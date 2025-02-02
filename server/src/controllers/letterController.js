const Template = require('../models/Template');
const Letter = require('../models/Letter');
const Citizen = require('../models/Citizen');
const VillageInfo = require('../models/VillageInfo');
const pdfGenerator = require('../utils/pdfGenerator');
const db = require('../config/database');

const letterController = {

    // Tambahkan di letterController.js
    async downloadLetter(req, res) {
        try {
          const { id } = req.params;
          
          // Ambil data surat
          const letter = await Letter.findById(id);
          if (!letter) {
            return res.status(404).json({ message: 'Surat tidak ditemukan' });
          }
      
          // Ambil data template dan citizen
          const template = await Template.findById(letter.template_id);
          const citizen = await Citizen.findByNik(letter.nik);
          const villageInfo = await VillageInfo.findOne();
      
          if (!template || !citizen || !villageInfo) {
            return res.status(404).json({ 
              message: 'Data template, penduduk, atau desa tidak ditemukan',
              details: {
                template: !template ? 'Template tidak ditemukan' : null,
                citizen: !citizen ? 'Data penduduk tidak ditemukan' : null,
                villageInfo: !villageInfo ? 'Data desa tidak ditemukan' : null
              }
            });
          }
      
          // Validate template path exists
          if (!template.template_path) {
            return res.status(400).json({ message: 'File template surat tidak ditemukan' });
          }
      
          // Get parent's job jika diperlukan
          const parentJob = await Citizen.findParentJob(citizen.no_kk, citizen.nama_ayah);
          citizen.pekerjaan_orang_tua = parentJob || '';
      
          // Generate PDF
          const pdfBuffer = await pdfGenerator.generatePDF(template, citizen, villageInfo);
      
          // Set headers untuk download
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="surat_${template.name}_${citizen.nama}.pdf"`,
            'Content-Length': pdfBuffer.length
          });
      
          return res.send(pdfBuffer);
        } catch (error) {
          console.error('Download letter error:', error);
          return res.status(500).json({ 
            message: 'Gagal mengunduh surat',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
      },

    async preview(req, res) {
        try {
          const { templateId, citizenId } = req.body;
     
          if (!templateId || !citizenId) {
            return res.status(400).json({ message: 'Template ID and Citizen ID are required' });
          }
     
          const template = await Template.findById(templateId);
          const citizen = await Citizen.findById(citizenId);
          const villageInfo = await VillageInfo.findOne();
     
          if (!template || !citizen || !villageInfo) {
            return res.status(404).json({ message: 'Template, citizen, or village info not found' });
          }
     
          // Get parent's job
          const parentJob = await Citizen.findParentJob(citizen.no_kk, citizen.nama_ayah);
          citizen.pekerjaan_orang_tua = parentJob || '';
     
          // Generate preview sebagai base64 string
          const content = await pdfGenerator.generatePreview(template, citizen, villageInfo);
          
          // Kirim sebagai JSON dengan content berisi base64 string
          res.json({ content });
     
        } catch (error) {
          console.error('Preview letter error:', error);
          res.status(500).json({ message: 'Failed to generate letter preview' });
        }
     },

 async generate(req, res) {
   try {
     const { templateId, citizenId } = req.body;
     const userId = req.user.id;
 
     if (!templateId || !citizenId) {
       return res.status(400).json({ message: 'Template ID and Citizen ID are required' });
     }
 
     const template = await Template.findById(templateId);
     const citizen = await Citizen.findById(citizenId);
     const villageInfo = await VillageInfo.findOne();
 
     if (!template || !citizen || !villageInfo) {
       return res.status(404).json({ message: 'Template, citizen, or village info not found' });
     }

     // Validate template path exists
     if (!template.template_path) {
       return res.status(400).json({ message: 'Template file not found' });
     }

     // Get parent's job
     const parentJob = await Citizen.findParentJob(citizen.no_kk, citizen.nama_ayah);
     citizen.pekerjaan_orang_tua = parentJob || '';
 
     try {
       const pdfBuffer = await pdfGenerator.generatePDF(template, citizen, villageInfo);
 
       // Save to history
       await Letter.create({
         template_id: templateId,
         nik: citizen.nik,
         full_name: citizen.nama,
         printed_by: userId
       });
 
       // Set headers untuk menampilkan PDF di browser
       res.set({
         'Content-Type': 'application/pdf',
         'Content-Length': pdfBuffer.length,
         'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:5173',
         'Access-Control-Allow-Credentials': true
       });
       
       return res.send(pdfBuffer);
     } catch (pdfError) {
       console.error('PDF Generation Error:', pdfError);
       return res.status(500).json({ 
         message: 'Gagal membuat PDF',
         error: process.env.NODE_ENV === 'development' ? pdfError.message : undefined
       });
     }
   } catch (error) {
     console.error('Generate letter error:', error);
     return res.status(500).json({ 
       message: 'Gagal membuat surat',
       error: process.env.NODE_ENV === 'development' ? error.message : undefined
     });
   }
 },

 // letterController.js
async previewTemplate(req, res) {
    try {
      if (!req.files?.template) {
        return res.status(400).json({ message: 'Template file is required' });
      }
  
      const templateFile = req.files.template;
      
      // Generate preview dengan data dummy
      const dummyData = {
        nama: 'John Doe',
        nik: '1234567890',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1990-01-01',
        // ... data dummy lainnya
      };
  
      const pdfBuffer = await pdfGenerator.generatePreview({
        template_path: templateFile.path
      }, dummyData);
  
      res.json({ content: `data:application/pdf;base64,${pdfBuffer.toString('base64')}` });
    } catch (error) {
      console.error('Preview template error:', error);
      res.status(500).json({ message: 'Failed to generate template preview' });
    }
  },

 async saveHistory(req, res) {
   try {
     const { templateId, citizenId } = req.body;
     const userId = req.user.id;

     const citizen = await Citizen.findById(citizenId);
     if (!citizen) {
       return res.status(404).json({ message: 'Citizen not found' });
     }

     await Letter.create({
       template_id: templateId,
       nik: citizen.nik,
       full_name: citizen.nama,
       printed_by: userId
     });

     res.json({ message: 'Letter history saved successfully' });
   } catch (error) {
     console.error('Save letter history error:', error);
     res.status(500).json({ message: 'Failed to save letter history' });
   }
 },

 async getHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const templateId = req.query.templateId;
  
      // Build the base query
      let countQuery = `
        SELECT COUNT(DISTINCT l.id) as total 
        FROM letters l
        LEFT JOIN letter_templates t ON l.template_id = t.id 
        LEFT JOIN users u ON l.printed_by = u.id 
        WHERE 1=1
      `;
  
      let dataQuery = `
        SELECT l.*, t.name as template_name, u.full_name as printed_by_name 
        FROM letters l 
        LEFT JOIN letter_templates t ON l.template_id = t.id 
        LEFT JOIN users u ON l.printed_by = u.id 
        WHERE 1=1
      `;
  
      const queryParams = [];
  
      // Add search condition if provided
      if (search) {
        const searchCondition = `
          AND (l.nik LIKE ? OR l.full_name LIKE ? OR t.name LIKE ?)
        `;
        countQuery += searchCondition;
        dataQuery += searchCondition;
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
  
      // Add date range conditions if provided
      if (startDate) {
        countQuery += ` AND DATE(l.created_at) >= ?`;
        dataQuery += ` AND DATE(l.created_at) >= ?`;
        queryParams.push(startDate);
      }
  
      if (endDate) {
        countQuery += ` AND DATE(l.created_at) <= ?`;
        dataQuery += ` AND DATE(l.created_at) <= ?`;
        queryParams.push(endDate);
      }
  
      // Add template filter if provided
      if (templateId) {
        countQuery += ` AND l.template_id = ?`;
        dataQuery += ` AND l.template_id = ?`;
        queryParams.push(templateId);
      }
  
      // Add order and pagination to data query
      dataQuery += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
      const dataQueryParams = [...queryParams, limit, offset];
  
      // Execute both queries
      const [[{ total }]] = await db.query(countQuery, queryParams);
      const [letters] = await db.query(dataQuery, dataQueryParams);
  
      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
  
      res.json({
        data: letters,
        pagination: {
          totalItems: total,
          totalPages: totalPages,
          currentPage: page,
          pageSize: limit
        }
      });
      
    } catch (error) {
      console.error('Get letter history error:', error);
      res.status(500).json({ 
        message: 'Gagal mengambil history surat',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  },

 async getLetterById(req, res) {
   try {
     const { id } = req.params;
     const letter = await Letter.findById(id);
     
     if (!letter) {
       return res.status(404).json({ message: 'Letter not found' });
     }

     res.json(letter);
   } catch (error) {
     console.error('Get letter by id error:', error);
     res.status(500).json({ message: 'Failed to get letter' });
   }
 },

 async getLettersByNik(req, res) {
   try {
     const { nik } = req.params;
     const letters = await Letter.findByNik(nik);
     res.json(letters);
   } catch (error) {
     console.error('Get letters by NIK error:', error);
     res.status(500).json({ message: 'Failed to get letters' });
   }
 },

 async getLetterStats(req, res) {
   try {
     // Get letters count per template
     const [templateStats] = await db.query(`
       SELECT t.name, COUNT(l.id) as count
       FROM letter_templates t
       LEFT JOIN letters l ON t.id = l.template_id
       GROUP BY t.id, t.name
       ORDER BY count DESC
     `);

     // Get letters count per month
     const [monthlyStats] = await db.query(`
       SELECT 
         DATE_FORMAT(created_at, '%Y-%m') as month,
         COUNT(*) as count
       FROM letters
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC
     `);

     res.json({
       templateStats,
       monthlyStats
     });
   } catch (error) {
     console.error('Get letter statistics error:', error);
     res.status(500).json({ message: 'Failed to get letter statistics' });
   }
 }
};

module.exports = letterController;