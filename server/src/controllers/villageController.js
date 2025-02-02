const VillageInfo = require('../models/VillageInfo');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/signatures';
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'signature-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Konfigurasi upload
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar (jpg, jpeg, png) yang diperbolehkan!'));
  }
});

const controller = {
  async getVillageInfo(req, res) {
    try {
      const villageInfo = await VillageInfo.findOne();
      if (!villageInfo) {
        return res.status(404).json({ message: 'Informasi desa belum diatur' });
      }
      res.json(villageInfo);
    } catch (error) {
      console.error('Error getting village info:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  },

  async updateVillageInfo(req, res) {
    try {
      const {
        village_name,
        district_name,
        regency_name,
        address,
        phone,
        email,
        head_name,
        head_position
      } = req.body;

      // Validate required fields
      if (!village_name || !district_name || !regency_name || !address || !head_name || !head_position) {
        return res.status(400).json({
          message: 'Nama desa, kecamatan, kabupaten, alamat, nama kepala desa, dan jabatan harus diisi'
        });
      }

      let signature_path = null;
      if (req.file) {
        signature_path = `/uploads/signatures/${req.file.filename}`;

        // Delete old signature if exists
        const currentInfo = await VillageInfo.findOne();
        if (currentInfo?.signature_path) {
          const oldPath = path.join(__dirname, '../..', currentInfo.signature_path);
          try {
            await fs.access(oldPath);
            await fs.unlink(oldPath);
          } catch (error) {
            console.error('Error deleting old signature:', error);
          }
        }
      }

      const success = await VillageInfo.update({
        village_name,
        district_name,
        regency_name,
        address,
        phone,
        email,
        head_name,
        head_position,
        signature_path: signature_path || req.body.signature_path
      });

      if (!success) {
        return res.status(400).json({ message: 'Gagal memperbarui informasi desa' });
      }

      res.json({ 
        message: 'Informasi desa berhasil diperbarui',
        signature_path: signature_path || req.body.signature_path
      });
    } catch (error) {
      console.error('Error updating village info:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }
};

module.exports = { controller, upload };