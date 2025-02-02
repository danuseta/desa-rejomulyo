 
// src/models/Citizen.js
const db = require('../config/database');

class Citizen {
    // Basic CRUD Operations
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM citizens WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByNIK(nik) {
        const [rows] = await db.query(
            'SELECT * FROM citizens WHERE nik = ?',
            [nik]
        );
        return rows[0];
    }

    static async findAll({ search, dusun, page = 1, limit = 10, sortBy, sortOrder = 'ASC' }) {
        try {
            // Get total count first
            let countQuery = 'SELECT COUNT(*) as total FROM citizens WHERE 1=1';
            const countValues = [];
    
            if (search) {
                countQuery += ' AND (nama LIKE ? OR nik LIKE ? OR dusun LIKE ?)';
                countValues.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
    
            if (dusun) {
                countQuery += ' AND dusun = ?';
                countValues.push(dusun);
            }
    
            // Execute count query
            const [[{ total }]] = await db.query(countQuery, countValues);
    
            // Main query for data
            let query = 'SELECT * FROM citizens WHERE 1=1';
            const values = [];
    
            if (search) {
                query += ' AND (nama LIKE ? OR nik LIKE ? OR dusun LIKE ?)';
                values.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
    
            if (dusun) {
                query += ' AND dusun = ?';
                values.push(dusun);
            }
    
            // Add sorting
            if (sortBy) {
                query += ` ORDER BY ${sortBy} ${sortOrder}`;
            }
    
            // Add pagination
            const offset = (page - 1) * limit;
            query += ' LIMIT ? OFFSET ?';
            values.push(parseInt(limit), parseInt(offset));
    
            const [rows] = await db.query(query, values);
    
            // Calculate pagination info
            const totalPages = Math.ceil(total / limit);
    
            return {
                data: rows,
                pagination: {
                    total,
                    totalPages,
                    currentPage: parseInt(page),
                    pageSize: parseInt(limit)
                }
            };
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    // Tambahkan method ini di dalam class Citizen di model Citizen.js
static async searchCitizens(searchTerm) {
    try {
        const query = `
            SELECT id, nik, nama, dusun, rt 
            FROM citizens 
            WHERE nama LIKE ? OR nik LIKE ? 
            ORDER BY nama ASC
        `;
        const [rows] = await db.query(query, [`%${searchTerm}%`, `%${searchTerm}%`]);
        return rows;
    } catch (error) {
        console.error('Error in searchCitizens:', error);
        throw error;
    }
}

static async findParentJob(noKk, parentName) {
    const [result] = await db.query(
      `SELECT pekerjaan 
       FROM citizens 
       WHERE no_kk = ? AND nama = ?`,
      [noKk, parentName]
    );
    return result[0]?.pekerjaan;
  }

    static async create(citizenData) {
        const {
            no_kk,
            nik,
            nama,
            tempat_lahir,
            tanggal_lahir,
            status_perkawinan,
            jenis_kelamin,
            dusun,
            rt,
            nama_ibu,
            nama_ayah,
            status_hubungan_keluarga,
            agama,
            pendidikan,
            pekerjaan,
            status_mandiri = false,
            status_pt = false,
            status_belum = false
        } = citizenData;

        // Hitung umur
        const birthDate = new Date(tanggal_lahir);
        const today = new Date();
        let umur = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            umur--;
        }

        const [result] = await db.query(
            `INSERT INTO citizens (
                no_kk, nik, nama, tempat_lahir, tanggal_lahir, umur,
                status_perkawinan, jenis_kelamin, dusun, rt,
                nama_ibu, nama_ayah, status_hubungan_keluarga,
                agama, pendidikan, pekerjaan,
                status_mandiri, status_pt, status_belum
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                no_kk, nik, nama, tempat_lahir, tanggal_lahir, umur,
                status_perkawinan, jenis_kelamin, dusun, rt,
                nama_ibu, nama_ayah, status_hubungan_keluarga,
                agama, pendidikan, pekerjaan,
                status_mandiri, status_pt, status_belum
            ]
        );

        return result.insertId;
    }

    static async update(id, citizenData) {
        const updateFields = [];
        const updateValues = [];

        // Dynamically build update query based on provided fields
        Object.entries(citizenData).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(value);
            }
        });

        // Add ID to values array
        updateValues.push(id);

        const [result] = await db.query(
            `UPDATE citizens SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM citizens WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Statistics Methods
    static async getAgeStatistics() {
        const [results] = await db.query(`
            SELECT 
                SUM(CASE WHEN umur BETWEEN 0 AND 3 THEN 1 ELSE 0 END) as '0-3 th',
                SUM(CASE WHEN umur BETWEEN 3 AND 6 THEN 1 ELSE 0 END) as '3-6 th',
                SUM(CASE WHEN umur BETWEEN 7 AND 12 THEN 1 ELSE 0 END) as '7-12 th',
                SUM(CASE WHEN umur BETWEEN 13 AND 15 THEN 1 ELSE 0 END) as '13-15 th',
                SUM(CASE WHEN umur BETWEEN 16 AND 18 THEN 1 ELSE 0 END) as '16-18 th',
                SUM(CASE WHEN umur BETWEEN 19 AND 59 THEN 1 ELSE 0 END) as '19-59 th',
                SUM(CASE WHEN umur >= 60 THEN 1 ELSE 0 END) as '60+ th'
            FROM citizens
        `);
        return results[0];
    }

    static async getDusunStatistics() {
        const dusunList = ['DUSUN 001', 'DUSUN 002', 'DUSUN 003', 'DUSUN 004'];
        const ageCategories = [
            { name: 'Balita', min: 0, max: 5 },
            { name: 'Anak-anak', min: 6, max: 12 },
            { name: 'Remaja', min: 13, max: 18 },
            { name: 'Dewasa', min: 19, max: 59 },
            { name: 'Lansia', min: 60, max: 999 }
        ];

        const rows = [];

        // Get statistics for each age category
        for (const category of ageCategories) {
            const [results] = await db.query(`
                SELECT dusun, COUNT(*) as count
                FROM citizens
                WHERE umur BETWEEN ? AND ?
                GROUP BY dusun
                ORDER BY dusun
            `, [category.min, category.max]);

            const values = dusunList.map(dusun => {
                const result = results.find(r => r.dusun === dusun);
                return result ? result.count : 0;
            });

            rows.push({
                kriteria: category.name,
                values
            });
        }

        // Get total for each dusun
        const [totalResults] = await db.query(`
            SELECT dusun, COUNT(*) as count
            FROM citizens
            GROUP BY dusun
            ORDER BY dusun
        `);

        const totalValues = dusunList.map(dusun => {
            const result = totalResults.find(r => r.dusun === dusun);
            return result ? result.count : 0;
        });

        rows.push({
            kriteria: 'Jumlah',
            values: totalValues
        });

        return {
            dusun: dusunList,
            rows
        };
    }

    static async getMarriageStatistics() {
        const dusunList = ['DUSUN 001', 'DUSUN 002', 'DUSUN 003', 'DUSUN 004'];
        const [results] = await db.query(`
            SELECT 
                dusun,
                status_perkawinan,
                COUNT(*) as count
            FROM citizens
            GROUP BY dusun, status_perkawinan
            ORDER BY dusun, status_perkawinan
        `);

        const rows = [
            { kriteria: 'Belum Kawin', values: [] },
            { kriteria: 'Kawin', values: [] },
            { kriteria: 'Pernah Kawin', values: [] },
            { kriteria: 'Jumlah', values: [] }
        ];

        // Initialize values arrays
        dusunList.forEach(dusun => {
            const dusunData = results.filter(r => r.dusun === dusun);
            
            // Belum Kawin (B)
            rows[0].values.push(
                dusunData.find(d => d.status_perkawinan === 'B')?.count || 0
            );
            
            // Kawin (S)
            rows[1].values.push(
                dusunData.find(d => d.status_perkawinan === 'S')?.count || 0
            );
            
            // Pernah Kawin (P)
            rows[2].values.push(
                dusunData.find(d => d.status_perkawinan === 'P')?.count || 0
            );
            
            // Total
            rows[3].values.push(
                dusunData.reduce((sum, d) => sum + d.count, 0)
            );
        });

        return {
            dusun: dusunList,
            rows
        };
    }

    // Bulk Operations
// Di dalam method bulkCreate di Citizen.js
// static async bulkCreate(citizensData) {
//     const connection = await db.getConnection();
//     try {
//       await connection.beginTransaction();
  
//       for (const data of citizensData) {
//         // Tangani format tanggal
//         let tanggalLahir = null;
//         if (data.tanggal_lahir && typeof data.tanggal_lahir === 'string') {
//           // Cek apakah sudah dalam format YYYY-MM-DD
//           if (data.tanggal_lahir.match(/^\d{4}-\d{2}-\d{2}$/)) {
//             tanggalLahir = data.tanggal_lahir;
//           } 
//           // Jika dalam format DD/MM/YYYY
//           else if (data.tanggal_lahir.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
//             const [day, month, year] = data.tanggal_lahir.split('/');
//             tanggalLahir = `${year}-${month}-${day}`;
//           }
          
//           // Validasi tanggal
//           const date = new Date(tanggalLahir);
//           if (isNaN(date.getTime())) {
//             throw new Error(`Invalid date format: ${data.tanggal_lahir}`);
//           }
//         }
  
//         // Hitung umur
//         let umur = 0;
//         if (tanggalLahir) {
//           const birthDate = new Date(tanggalLahir);
//           const today = new Date();
//           umur = today.getFullYear() - birthDate.getFullYear();
//           const m = today.getMonth() - birthDate.getMonth();
//           if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//             umur--;
//           }
//         }
  
//         // Normalize dusun format jika perlu
//         let dusun = data.dusun;
//         if (dusun && !dusun.startsWith('DUSUN')) {
//           dusun = `DUSUN ${dusun.padStart(3, '0')}`;
//         }

//         // Normalize RT format
//         let rt = data.rt;
//         if (rt) {
//           rt = rt.padStart(3, '0');
//         }
  
//         await connection.query(
//           `INSERT INTO citizens (
//             no_kk, nik, nama, tempat_lahir, tanggal_lahir, umur,
//             status_perkawinan, jenis_kelamin, dusun, rt,
//             nama_ibu, nama_ayah, status_hubungan_keluarga,
//             agama, pendidikan, pekerjaan,
//             status_mandiri, status_pt, status_belum
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             data.no_kk, 
//             data.nik, 
//             data.nama.toUpperCase(), 
//             data.tempat_lahir.toUpperCase(),
//             tanggalLahir, 
//             umur,
//             data.status_perkawinan.toUpperCase(), 
//             data.jenis_kelamin.toUpperCase(), 
//             dusun, 
//             rt,
//             data.nama_ibu.toUpperCase(), 
//             data.nama_ayah.toUpperCase(), 
//             data.status_hubungan_keluarga.toUpperCase(),
//             data.agama.toUpperCase(), 
//             data.pendidikan.toUpperCase(), 
//             data.pekerjaan.toUpperCase(),
//             data.status_mandiri, 
//             data.status_pt, 
//             data.status_belum
//           ]
//         );
//       }
  
//       await connection.commit();
//       return true;
//     } catch (error) {
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
// }

// src/models/Citizen.js

static async bulkCreate(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Data harus berupa array dan tidak boleh kosong');
        }

        const processedData = data.map(row => {
            // Hitung umur jika tanggal lahir valid
            let umur = 0;
            if (row.tanggal_lahir) {
                const birthDate = new Date(row.tanggal_lahir);
                if (!isNaN(birthDate.getTime())) {
                    const today = new Date();
                    umur = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        umur--;
                    }
                }
            }

            return [
                row.no_kk || '',
                row.nik || '',
                row.nama || '',
                row.tempat_lahir || '',
                row.tanggal_lahir, // Tanggal sudah divalidasi di controller
                umur,
                row.status_perkawinan || '',
                row.jenis_kelamin || '',
                row.dusun || '',
                row.rt || '000',
                row.nama_ibu || '',
                row.nama_ayah || '',
                row.status_hubungan_keluarga || 'ANGGOTA KELUARGA',
                row.agama || '',
                row.pendidikan || '',
                row.pekerjaan || '',
                row.status_mandiri || false,
                row.status_pt || false,
                row.status_belum || false
            ];
        });

        // Query tetap sama
        const baseQuery = `
            INSERT INTO citizens (
                no_kk, nik, nama, tempat_lahir, tanggal_lahir, umur,
                status_perkawinan, jenis_kelamin, dusun, rt,
                nama_ibu, nama_ayah, status_hubungan_keluarga,
                agama, pendidikan, pekerjaan,
                status_mandiri, status_pt, status_belum
            ) VALUES ? 
            ON DUPLICATE KEY UPDATE 
                no_kk = VALUES(no_kk),
                nama = VALUES(nama),
                tempat_lahir = VALUES(tempat_lahir),
                tanggal_lahir = VALUES(tanggal_lahir),
                umur = VALUES(umur),
                status_perkawinan = VALUES(status_perkawinan),
                jenis_kelamin = VALUES(jenis_kelamin),
                dusun = VALUES(dusun),
                rt = VALUES(rt),
                nama_ibu = VALUES(nama_ibu),
                nama_ayah = VALUES(nama_ayah),
                status_hubungan_keluarga = VALUES(status_hubungan_keluarga),
                agama = VALUES(agama),
                pendidikan = VALUES(pendidikan),
                pekerjaan = VALUES(pekerjaan),
                status_mandiri = VALUES(status_mandiri),
                status_pt = VALUES(status_pt),
                status_belum = VALUES(status_belum)
        `;

        await db.query(baseQuery, [processedData]);
        return true;
    } catch (error) {
        console.error('Error in Citizen.bulkCreate:', error);
        throw error;
    }
}


// Di dalam method getWarningDataWithPagination di Citizen.js
static async getWarningDataWithPagination({ page = 1, limit = 10, search = '' }) {
    try {
        const offset = (page - 1) * limit;
        let query = `
            SELECT 
                SQL_CALC_FOUND_ROWS
                id, nama, nik, dusun, rt,
                CONCAT_WS(', ',
                    CASE WHEN no_kk IS NULL OR TRIM(no_kk) = '' OR LENGTH(TRIM(no_kk)) != 16 THEN 'Nomor KK tidak valid' END,
                    CASE WHEN nik IS NULL OR TRIM(nik) = '' OR LENGTH(TRIM(nik)) != 16 THEN 'NIK tidak valid' END,
                    CASE WHEN nama IS NULL OR TRIM(nama) = '' OR LENGTH(TRIM(nama)) < 3 THEN 'Nama tidak valid' END,
                    CASE WHEN tempat_lahir IS NULL OR TRIM(tempat_lahir) = '' THEN 'Tempat Lahir kosong' END,
                    CASE WHEN tanggal_lahir IS NULL THEN 'Tanggal Lahir kosong' END,
                    CASE WHEN status_perkawinan IS NULL OR status_perkawinan NOT IN ('B', 'S', 'P') THEN 'Status Perkawinan tidak valid' END,
                    CASE WHEN jenis_kelamin IS NULL OR jenis_kelamin NOT IN ('L', 'P') THEN 'Jenis Kelamin tidak valid' END,
                    CASE WHEN dusun IS NULL OR TRIM(dusun) = '' OR dusun = '-' THEN 'Dusun kosong' END,
                    CASE WHEN rt IS NULL OR TRIM(rt) = '' THEN 'RT kosong' END,
                    CASE WHEN nama_ibu IS NULL OR TRIM(nama_ibu) = '' THEN 'Nama Ibu kosong' END,
                    CASE WHEN nama_ayah IS NULL OR TRIM(nama_ayah) = '' THEN 'Nama Ayah kosong' END,
                    CASE WHEN agama IS NULL OR TRIM(agama) = '' THEN 'Agama kosong' END,
                    CASE WHEN pendidikan IS NULL OR TRIM(pendidikan) = '' THEN 'Pendidikan kosong' END,
                    CASE WHEN pekerjaan IS NULL OR TRIM(pekerjaan) = '' THEN 'Pekerjaan kosong' END
                ) as all_warnings
            FROM citizens
            WHERE (
                no_kk IS NULL OR TRIM(no_kk) = '' OR LENGTH(TRIM(no_kk)) != 16 OR
                nik IS NULL OR TRIM(nik) = '' OR LENGTH(TRIM(nik)) != 16 OR
                nama IS NULL OR TRIM(nama) = '' OR LENGTH(TRIM(nama)) < 3 OR
                tempat_lahir IS NULL OR TRIM(tempat_lahir) = '' OR
                tanggal_lahir IS NULL OR
                status_perkawinan IS NULL OR status_perkawinan NOT IN ('B', 'S', 'P') OR
                jenis_kelamin IS NULL OR jenis_kelamin NOT IN ('L', 'P') OR
                dusun IS NULL OR TRIM(dusun) = '' OR dusun = '-' OR
                rt IS NULL OR TRIM(rt) = '' OR
                nama_ibu IS NULL OR TRIM(nama_ibu) = '' OR
                nama_ayah IS NULL OR TRIM(nama_ayah) = '' OR
                agama IS NULL OR TRIM(agama) = '' OR
                pendidikan IS NULL OR TRIM(pendidikan) = '' OR
                pekerjaan IS NULL OR TRIM(pekerjaan) = ''
            )
        `;

        const values = [];

        // Add search condition if search term exists
        if (search) {
            query += ` AND (nama LIKE ? OR nik LIKE ?)`;
            values.push(`%${search}%`, `%${search}%`);
        }

        // Add ordering and pagination
        query += ` HAVING all_warnings IS NOT NULL ORDER BY nama ASC LIMIT ? OFFSET ?`;
        values.push(parseInt(limit), parseInt(offset));

        // Execute main query
        const [rows] = await db.query(query, values);
        
        // Get total count
        const [[{ total }]] = await db.query('SELECT FOUND_ROWS() as total');

        return {
            data: rows,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Error in getWarningDataWithPagination:', error);
        throw error;
    }
}


// Tambahkan di class Citizen
// Di dalam class Citizen
static async getWarningData() {
    try {
        const query = `
            SELECT 
                id, 
                nama, 
                nik, 
                dusun, 
                rt,
                CONCAT_WS(', ',
                    CASE WHEN no_kk IS NULL OR TRIM(no_kk) = '' OR LENGTH(TRIM(no_kk)) != 16 THEN 'Nomor KK tidak valid' END,
                    CASE WHEN nik IS NULL OR TRIM(nik) = '' OR LENGTH(TRIM(nik)) != 16 THEN 'NIK tidak valid' END,
                    CASE WHEN nama IS NULL OR TRIM(nama) = '' OR LENGTH(TRIM(nama)) < 3 THEN 'Nama tidak valid' END,
                    CASE WHEN tempat_lahir IS NULL OR TRIM(tempat_lahir) = '' THEN 'Tempat Lahir kosong' END,
                    CASE WHEN tanggal_lahir IS NULL THEN 'Tanggal Lahir kosong' END,
                    CASE WHEN status_perkawinan IS NULL OR status_perkawinan NOT IN ('B', 'S', 'P') THEN 'Status Perkawinan tidak valid' END,
                    CASE WHEN jenis_kelamin IS NULL OR jenis_kelamin NOT IN ('L', 'P') THEN 'Jenis Kelamin tidak valid' END,
                    CASE WHEN dusun IS NULL OR TRIM(dusun) = '' OR dusun = '-' THEN 'Dusun kosong' END,
                    CASE WHEN rt IS NULL OR TRIM(rt) = '' THEN 'RT kosong' END,
                    CASE WHEN nama_ibu IS NULL OR TRIM(nama_ibu) = '' THEN 'Nama Ibu kosong' END,
                    CASE WHEN nama_ayah IS NULL OR TRIM(nama_ayah) = '' THEN 'Nama Ayah kosong' END,
                    CASE WHEN agama IS NULL OR TRIM(agama) = '' THEN 'Agama kosong' END,
                    CASE WHEN pendidikan IS NULL OR TRIM(pendidikan) = '' THEN 'Pendidikan kosong' END,
                    CASE WHEN pekerjaan IS NULL OR TRIM(pekerjaan) = '' THEN 'Pekerjaan kosong' END
                ) as all_warnings
            FROM citizens
            WHERE 
                no_kk IS NULL OR TRIM(no_kk) = '' OR LENGTH(TRIM(no_kk)) != 16 OR
                nik IS NULL OR TRIM(nik) = '' OR LENGTH(TRIM(nik)) != 16 OR
                nama IS NULL OR TRIM(nama) = '' OR LENGTH(TRIM(nama)) < 3 OR
                tempat_lahir IS NULL OR TRIM(tempat_lahir) = '' OR
                tanggal_lahir IS NULL OR
                status_perkawinan IS NULL OR status_perkawinan NOT IN ('B', 'S', 'P') OR
                jenis_kelamin IS NULL OR jenis_kelamin NOT IN ('L', 'P') OR
                dusun IS NULL OR TRIM(dusun) = '' OR dusun = '-' OR
                rt IS NULL OR TRIM(rt) = '' OR
                nama_ibu IS NULL OR TRIM(nama_ibu) = '' OR
                nama_ayah IS NULL OR TRIM(nama_ayah) = '' OR
                agama IS NULL OR TRIM(agama) = '' OR
                pendidikan IS NULL OR TRIM(pendidikan) = '' OR
                pekerjaan IS NULL OR TRIM(pekerjaan) = ''
            HAVING all_warnings IS NOT NULL
            ORDER BY nama ASC`;
        
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error in getWarningData:', error);
        throw error;
    }
}

    // Additional Query Methods
    static async findByNoKK(noKK) {
        const [rows] = await db.query(
            'SELECT * FROM citizens WHERE no_kk = ? ORDER BY nama',
            [noKK]
        );
        return rows;
    }

    static async getTotalFamilies() {
        const [result] = await db.query(
            'SELECT COUNT(DISTINCT no_kk) as total FROM citizens'
        );
        return result[0].total;
    }
}

module.exports = Citizen;