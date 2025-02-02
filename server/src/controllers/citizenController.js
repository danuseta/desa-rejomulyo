// src/controllers/citizenController.js
const Citizen = require('../models/Citizen');
const ExcelHelper = require('../utils/excelHelper');
const path = require('path');
const fs = require('fs').promises;

// Pastikan folder templates ada sebelum menulis file
const ensureTemplatesDir = async () => {
    const templatesDir = path.join(__dirname, '../templates');
    try {
        await fs.access(templatesDir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(templatesDir, { recursive: true });
        } else {
            throw error;
        }
    }
};

// Panggil di awal aplikasi
ensureTemplatesDir().catch(console.error);

// Get all citizens with filtering, sorting and pagination
const getCitizens = async (req, res) => {
    try {
        const { search, dusun, page = 1, limit = 10, sortBy, sortOrder } = req.query;
        const citizenData = await Citizen.findAll({ 
            search, 
            dusun, 
            page: parseInt(page), 
            limit: parseInt(limit), 
            sortBy, 
            sortOrder 
        });
        res.json(citizenData); // Will now send data and pagination info
    } catch (error) {
        console.error('Error in getCitizens:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};


// Get single citizen by ID
const getCitizenById = async (req, res) => {
    try {
        const citizen = await Citizen.findById(req.params.id);
        if (!citizen) {
            return res.status(404).json({ message: 'Data penduduk tidak ditemukan' });
        }
        res.json(citizen);
    } catch (error) {
        console.error('Error in getCitizenById:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Create new citizen
const createCitizen = async (req, res) => {
    try {
        // Check if NIK already exists
        const existingCitizen = await Citizen.findByNIK(req.body.nik);
        if (existingCitizen) {
            return res.status(400).json({ message: 'NIK sudah terdaftar' });
        }

        // Check if No KK already exists and validate other fields
        const existingKK = await Citizen.findByNoKK(req.body.no_kk);
        const validationErrors = [];

        if (!req.body.no_kk || req.body.no_kk.length !== 16) {
            validationErrors.push('Nomor KK harus 16 digit');
        }
        if (!req.body.nik || req.body.nik.length !== 16) {
            validationErrors.push('NIK harus 16 digit');
        }
        if (!req.body.nama || req.body.nama.trim().length < 3) {
            validationErrors.push('Nama minimal 3 karakter');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: validationErrors
            });
        }

        const citizenId = await Citizen.create(req.body);
        res.status(201).json({ 
            message: 'Data penduduk berhasil ditambahkan',
            citizenId 
        });
    } catch (error) {
        console.error('Error in createCitizen:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Update existing citizen
const updateCitizen = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if citizen exists
        const existingCitizen = await Citizen.findById(id);
        if (!existingCitizen) {
            return res.status(404).json({ message: 'Data penduduk tidak ditemukan' });
        }

        // If NIK is being changed, check if new NIK already exists
        if (req.body.nik && req.body.nik !== existingCitizen.nik) {
            const nikExists = await Citizen.findByNIK(req.body.nik);
            if (nikExists) {
                return res.status(400).json({ message: 'NIK sudah terdaftar' });
            }
        }

        // Validate fields being updated
        const validationErrors = [];
        if (req.body.no_kk && req.body.no_kk.length !== 16) {
            validationErrors.push('Nomor KK harus 16 digit');
        }
        if (req.body.nik && req.body.nik.length !== 16) {
            validationErrors.push('NIK harus 16 digit');
        }
        if (req.body.nama && req.body.nama.trim().length < 3) {
            validationErrors.push('Nama minimal 3 karakter');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: validationErrors
            });
        }

        const success = await Citizen.update(id, req.body);
        if (!success) {
            return res.status(400).json({ message: 'Gagal mengupdate data penduduk' });
        }

        res.json({ message: 'Data penduduk berhasil diupdate' });
    } catch (error) {
        console.error('Error in updateCitizen:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Delete citizen
const deleteCitizen = async (req, res) => {
    try {
        const success = await Citizen.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ message: 'Data penduduk tidak ditemukan' });
        }
        res.json({ message: 'Data penduduk berhasil dihapus' });
    } catch (error) {
        console.error('Error in deleteCitizen:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Get statistics
const getStatistics = async (req, res) => {
    try {
        const [ageStats, dusunStats, marriageStats] = await Promise.all([
            Citizen.getAgeStatistics(),
            Citizen.getDusunStatistics(),
            Citizen.getMarriageStatistics()
        ]);

        res.json({
            age: ageStats,
            dusun: dusunStats,
            marriage: marriageStats
        });
    } catch (error) {
        console.error('Error in getStatistics:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Import citizens from Excel
// Update the importCitizens function in citizenController.js
// src/controllers/citizenController.js
const importCitizens = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File tidak ditemukan' });
        }

        console.log('Processing file:', req.file.path);

        // Parse Excel file
        const excelData = await ExcelHelper.parseExcel(req.file.path);
        
        if (!Array.isArray(excelData) || excelData.length === 0) {
            return res.status(400).json({ message: 'Format file tidak valid' });
        }

        console.log('Sample data before processing:', excelData[0]); 

        // Collect warnings instead of validation errors
        const warnings = [];
        const processedData = excelData.map((row, index) => {
            // Check and collect warnings
            if (!row.no_kk || String(row.no_kk).length !== 16) {
                warnings.push(`Baris ${index + 1}: Nomor KK harus 16 digit`);
            }
            if (!row.nik || String(row.nik).length !== 16) {
                warnings.push(`Baris ${index + 1}: NIK harus 16 digit`);
            }
            if (!row.nama || String(row.nama).trim().length < 3) {
                warnings.push(`Baris ${index + 1}: Nama minimal 3 karakter`);
            }
            if (!row.status_perkawinan || !['B', 'S', 'P'].includes(row.status_perkawinan)) {
                warnings.push(`Baris ${index + 1}: Status perkawinan harus B/S/P`);
            }
            if (!row.jenis_kelamin || !['L', 'P'].includes(row.jenis_kelamin)) {
                warnings.push(`Baris ${index + 1}: Jenis kelamin harus L/P`);
            }
            if (!row.rt) {
                warnings.push(`Baris ${index + 1}: RT harus diisi`);
            }

            // Proses tanggal lahir
            let tanggalLahir = null;
            if (row.tanggal_lahir) {
                // Jika tanggal dalam format Date object
                if (row.tanggal_lahir instanceof Date) {
                    if (!isNaN(row.tanggal_lahir.getTime())) {
                        const year = row.tanggal_lahir.getFullYear();
                        const month = String(row.tanggal_lahir.getMonth() + 1).padStart(2, '0');
                        const day = String(row.tanggal_lahir.getDate()).padStart(2, '0');
                        tanggalLahir = `${year}-${month}-${day}`;
                    }
                } 
                // Jika tanggal dalam format string
                else if (typeof row.tanggal_lahir === 'string') {
                    const cleanDate = row.tanggal_lahir.trim();
                    // Format DD/MM/YYYY
                    if (cleanDate.includes('/')) {
                        const [day, month, year] = cleanDate.split('/');
                        tanggalLahir = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                    // Format YYYY-MM-DD
                    else if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        tanggalLahir = cleanDate;
                    }
                }

                // Validasi final format tanggal
                const testDate = new Date(tanggalLahir);
                if (isNaN(testDate.getTime())) {
                    tanggalLahir = null;
                    warnings.push(`Baris ${index + 1}: Format tanggal lahir tidak valid`);
                } else {
                    // Validasi tanggal tidak di masa depan
                    if (testDate > new Date()) {
                        warnings.push(`Baris ${index + 1}: Tanggal lahir tidak boleh di masa depan`);
                        tanggalLahir = null;
                    }
                }
            }

            // Proses format dusun
            let dusun = String(row.dusun || '').trim().toUpperCase();
            if (dusun && !dusun.startsWith('DUSUN')) {
                dusun = `DUSUN ${dusun.padStart(3, '0')}`;
            }

            return {
                no_kk: String(row.no_kk || '').trim(),
                nik: String(row.nik || '').trim(),
                nama: String(row.nama || '').trim().toUpperCase(),
                tempat_lahir: String(row.tempat_lahir || '').trim().toUpperCase(),
                tanggal_lahir: tanggalLahir,
                status_perkawinan: String(row.status_perkawinan || '').trim().toUpperCase(),
                jenis_kelamin: String(row.jenis_kelamin || '').trim().toUpperCase(),
                dusun: dusun,
                rt: String(row.rt || '').trim().padStart(3, '0'),
                nama_ibu: String(row.nama_ibu || '').trim().toUpperCase(),
                nama_ayah: String(row.nama_ayah || '').trim().toUpperCase(),
                status_hubungan_keluarga: String(row.status_hubungan_keluarga || '').trim().toUpperCase(),
                agama: String(row.agama || '').trim().toUpperCase(),
                pendidikan: String(row.pendidikan || '').trim().toUpperCase(),
                pekerjaan: String(row.pekerjaan || '').trim().toUpperCase()
            };
        });

        // Log warnings to console but continue with import
        if (warnings.length > 0) {
            console.log('Import warnings:', warnings);
        }

        // Bulk create citizens
        await Citizen.bulkCreate(processedData);

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        // Return success with warnings
        res.json({ 
            message: 'Data berhasil diimport',
            imported: processedData.length,
            warnings: warnings.length > 0 ? warnings : undefined
        });
    } catch (error) {
        console.error('Detailed import error:', error);
        
        // Clean up uploaded file in case of error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({ 
            message: 'Gagal mengimport data', 
            error: error.message
        });
    }
};


const getWarningData = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        const result = await Citizen.getWarningDataWithPagination({ 
            page, 
            limit, 
            search 
        });
        res.json(result);
    } catch (error) {
        console.error('Error in getWarningData:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const searchCitizens = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 3) {
            return res.status(400).json({ message: 'Query minimal 3 karakter' });
        }

        // Gunakan method search yang baru
        const citizens = await Citizen.searchCitizens(q);
        
        res.json(citizens);
    } catch (error) {
        console.error('Error in searchCitizens:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Download Excel template
const downloadTemplate = async (req, res) => {
    try {
        // Generate template Excel
        const templatePath = ExcelHelper.createTemplate();
        
        // Check if file exists
        try {
            await fs.access(templatePath);
        } catch (error) {
            return res.status(404).json({
                message: 'Template file tidak ditemukan'
            });
        }

        // Send file
        res.download(templatePath, 'template_import_penduduk.xlsx', async (err) => {
            if (err) {
                console.error('Error downloading template:', err);
                // Clean up if error occurs after starting download
                if (res.headersSent) {
                    try {
                        await fs.unlink(templatePath);
                    } catch (unlinkError) {
                        console.error('Error deleting template file:', unlinkError);
                    }
                } else {
                    res.status(500).json({
                        message: 'Gagal mendownload template'
                    });
                }
            } else {
                // Clean up successful download
                try {
                    await fs.unlink(templatePath);
                } catch (unlinkError) {
                    console.error('Error deleting template file:', unlinkError);
                }
            }
        });
    } catch (error) {
        console.error('Error in downloadTemplate:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat membuat template'
        });
    }
};

// Get citizens by KK number
const getCitizensByKK = async (req, res) => {
    try {
        const citizens = await Citizen.findByNoKK(req.params.noKK);
        res.json(citizens);
    } catch (error) {
        console.error('Error in getCitizensByKK:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

// Get total families
const getTotalFamilies = async (req, res) => {
    try {
        const total = await Citizen.getTotalFamilies();
        res.json({ total });
    } catch (error) {
        console.error('Error in getTotalFamilies:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

module.exports = {
    getCitizens,
    getCitizenById,
    createCitizen,
    updateCitizen,
    deleteCitizen,
    getStatistics,
    importCitizens,
    downloadTemplate,
    getCitizensByKK,
    getTotalFamilies,
    searchCitizens,
    getWarningData
};