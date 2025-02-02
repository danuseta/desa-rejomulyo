const Template = require('../models/Template');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/Cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadDir = file.fieldname === 'logo' ? 'uploads/logos' : 'uploads/templates';
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Konfigurasi upload
const upload = multer({
  storage,
  limits: {
    fileSize: (req, file) => {
      if (file.fieldname === 'logo') return 2 * 1024 * 1024; // 2MB untuk logo
      return 10 * 1024 * 1024; // 10MB untuk template
    }
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
        return cb(new Error('Hanya file gambar (jpg, jpeg, png) yang diperbolehkan!'));
      }
    } else if (file.fieldname === 'template') {
      if (!file.originalname.match(/\.(doc|docx)$/)) {
        return cb(new Error('Hanya file Word (doc, docx) yang diperbolehkan!'));
      }
    }
    cb(null, true);
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'template', maxCount: 1 }
]);


const controller = {
  // Get all templates
// Di templateController.js, update getTemplates:
async getTemplates(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const result = await Template.findAllPaginated(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  },

  async getTemplateFile(req, res) {
    try {
      const { id } = req.params;
      const template = await Template.findById(id);
      
      if (!template) {
        return res.status(404).json({ message: 'Template tidak ditemukan' });
      }
  
      const filePath = path.join(__dirname, '../..', template.template_path);
      const fileContent = await fs.readFile(filePath);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(fileContent);
  
    } catch (error) {
      console.error('Error getting template file:', error);
      res.status(500).json({ message: 'Failed to get template file' });
    }
  },

  // Get single template
  async getTemplateById(req, res) {
    try {
      const template = await Template.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: 'Template tidak ditemukan' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  },

  // Create new template
  async createTemplate(req, res) {
    let logoData = null;
    let templatePath = null;
    
    try {
      const { name } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({ message: 'Nama template harus diisi' });
      }
  
      console.log('Files received:', req.files);
      console.log('Body received:', req.body);
  
      // Upload logo to Cloudinary if exists
      if (req.files?.logo?.[0]) {
        try {
          logoData = await uploadToCloudinary(req.files.logo[0], 'logos');
        } catch (error) {
          console.error('Error uploading logo:', error);
          return res.status(400).json({ message: 'Gagal mengupload logo' });
        }
      }
  
      // Save template file path if exists
      if (req.files?.template?.[0]) {
        templatePath = req.files.template[0].path;
      } else {
        return res.status(400).json({ message: 'File template Word harus diupload' });
      }
  
      // Create template in database
      const templateId = await Template.create({
        name,
        content: '',
        header_content: '',
        use_logo: !!logoData,
        logo_path: logoData?.url || null,
        logo_public_id: logoData?.public_id || null,
        template_path: templatePath,
        template_type: 'docx'
      });
  
      res.status(201).json({
        message: 'Template berhasil dibuat',
        templateId,
        logo_path: logoData?.url
      });
  
    } catch (error) {
      console.error('Error creating template:', error);
      
      // Cleanup: delete uploaded files if template creation fails
      if (logoData?.public_id) {
        try {
          await deleteFromCloudinary(logoData.public_id);
        } catch (deleteError) {
          console.error('Error deleting logo from Cloudinary:', deleteError);
        }
      }
      
      if (templatePath) {
        try {
          await fs.unlink(templatePath);
        } catch (deleteError) {
          console.error('Error deleting template file:', deleteError);
        }
      }
      
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  },

  // Update template
  async updateTemplate(req, res) {
    let logoData = null;
    let templatePath = null;
    
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Check if template exists
      const existingTemplate = await Template.findById(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: 'Template tidak ditemukan' });
      }

      // Upload new logo if exists
      if (req.files?.logo?.[0]) {
        try {
          logoData = await uploadToCloudinary(req.files.logo[0], 'logos');
          // Delete old logo from Cloudinary
          if (existingTemplate.logo_public_id) {
            await deleteFromCloudinary(existingTemplate.logo_public_id);
          }
        } catch (error) {
          console.error('Error uploading new logo:', error);
          return res.status(400).json({ message: 'Gagal mengupload logo baru' });
        }
      }

      // Handle new template file
      if (req.files?.template?.[0]) {
        templatePath = req.files.template[0].path;
        // Delete old template file
        if (existingTemplate.template_path) {
          try {
            await fs.unlink(existingTemplate.template_path);
          } catch (error) {
            console.error('Error deleting old template file:', error);
          }
        }
      }

      // Update template
      const success = await Template.update(id, {
        name: name || existingTemplate.name,
        use_logo: !!(logoData?.url || existingTemplate.logo_path),
        logo_path: logoData?.url || existingTemplate.logo_path,
        logo_public_id: logoData?.public_id || existingTemplate.logo_public_id,
        template_path: templatePath || existingTemplate.template_path,
        template_type: 'docx'
      });

      if (!success) {
        throw new Error('Failed to update template');
      }

      res.json({
        message: 'Template berhasil diupdate',
        logo_path: logoData?.url || existingTemplate.logo_path
      });

    } catch (error) {
      console.error('Error updating template:', error);
      
      // Cleanup new files if update fails
      if (logoData?.public_id) {
        try {
          await deleteFromCloudinary(logoData.public_id);
        } catch (deleteError) {
          console.error('Error deleting new logo from Cloudinary:', deleteError);
        }
      }

      if (templatePath) {
        try {
          await fs.unlink(templatePath);
        } catch (deleteError) {
          console.error('Error deleting new template file:', deleteError);
        }
      }

      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  },

  // Delete template
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      
      // Check if template exists
      const template = await Template.findById(id);
      if (!template) {
        return res.status(404).json({ message: 'Template tidak ditemukan' });
      }
  
      // Delete logo from Cloudinary if exists
      if (template.logo_public_id) {
        try {
          await deleteFromCloudinary(template.logo_public_id);
        } catch (error) {
          console.error('Error deleting logo from Cloudinary:', error);
        }
      }
  
      // Delete template file if exists
      if (template.template_path) {
        try {
          await fs.unlink(template.template_path);
        } catch (error) {
          console.error('Error deleting template file:', error);
        }
      }
  
      // Soft delete template
      const success = await Template.softDelete(id);
      if (!success) {
        throw new Error('Failed to delete template');
      }
  
      res.json({ message: 'Template berhasil dihapus' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }
};

module.exports = { controller, upload };