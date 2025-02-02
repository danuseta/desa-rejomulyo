// dashboardController.js
const db = require('../config/database');

const getDashboardStats = async (req, res) => {
    try {
        // Total citizens
        const [citizensResult] = await db.query(
            'SELECT COUNT(*) as total FROM citizens'
        );
        
        // Total families (unique no_kk)
        const [familiesResult] = await db.query(
            'SELECT COUNT(DISTINCT no_kk) as total FROM citizens'
        );
        
        // Total letters
        const [lettersResult] = await db.query(
            'SELECT COUNT(*) as total FROM letters'
        );
        
        // Total templates
        const [templatesResult] = await db.query(
            'SELECT COUNT(*) as total FROM letter_templates WHERE deleted_at IS NULL'
        );

        // Gender stats
        const [genderResult] = await db.query(`
            SELECT 
                SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as male,
                SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as female
            FROM citizens
        `);

        // Dusun stats (total per dusun)
        const [dusunResult] = await db.query(`
            SELECT dusun, COUNT(*) as total
            FROM citizens
            GROUP BY dusun
            ORDER BY dusun
        `);

        const dusunStats = {};
        dusunResult.forEach(row => {
            dusunStats[row.dusun] = row.total;
        });

        res.json({
            totalCitizens: citizensResult[0].total,
            totalFamilies: familiesResult[0].total,
            totalLetters: lettersResult[0].total,
            totalTemplates: templatesResult[0].total,
            genderStats: {
                male: genderResult[0].male,
                female: genderResult[0].female
            },
            dusunStats
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const getAgeStats = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                SUM(CASE WHEN umur BETWEEN 0 AND 4 THEN 1 ELSE 0 END) as '0-4 th',
                SUM(CASE WHEN umur BETWEEN 5 AND 11 THEN 1 ELSE 0 END) as '5-11 th',
                SUM(CASE WHEN umur BETWEEN 12 AND 17 THEN 1 ELSE 0 END) as '12-17 th',
                SUM(CASE WHEN umur BETWEEN 18 AND 25 THEN 1 ELSE 0 END) as '18-25 th',
                SUM(CASE WHEN umur BETWEEN 26 AND 45 THEN 1 ELSE 0 END) as '26-45 th',
                SUM(CASE WHEN umur BETWEEN 46 AND 65 THEN 1 ELSE 0 END) as '46-65 th',
                SUM(CASE WHEN umur > 65 THEN 1 ELSE 0 END) as '65+ th'
            FROM citizens
        `);

        res.json(results[0]);
    } catch (error) {
        console.error('Error getting age stats:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const getDusunStats = async (req, res) => {
    try {
        const dusunList = ['DUSUN 001', 'DUSUN 002', 'DUSUN 003', 'DUSUN 004'];
        const ageCategories = [
            { name: 'Balita (0-4)', min: 0, max: 4 },
            { name: 'Anak (5-11)', min: 5, max: 11 },
            { name: 'Remaja (12-17)', min: 12, max: 17 },
            { name: 'Pemuda (18-25)', min: 18, max: 25 },
            { name: 'Dewasa (26-45)', min: 26, max: 45 },
            { name: 'Lansia (46+)', min: 46, max: 200 }
        ];

        const rows = [];
        let categoryTotals = {
            L: 0,
            P: 0,
            JML: 0
        };

        // Get statistics for each age category
        for (const category of ageCategories) {
            const [results] = await db.query(`
                SELECT 
                    dusun,
                    SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as L,
                    SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as P,
                    COUNT(*) as JML
                FROM citizens
                WHERE umur BETWEEN ? AND ?
                GROUP BY dusun
                ORDER BY dusun
            `, [category.min, category.max]);

            // Calculate totals for this category
            const categoryL = results.reduce((sum, row) => sum + Number(row.L || 0), 0);
            const categoryP = results.reduce((sum, row) => sum + Number(row.P || 0), 0);
            const categoryJML = categoryL + categoryP;

            categoryTotals.L += categoryL;
            categoryTotals.P += categoryP;
            categoryTotals.JML += categoryJML;

            const values = [...dusunList.map(dusun => {
                const result = results.find(r => r.dusun === dusun) || { L: 0, P: 0, JML: 0 };
                return { 
                    L: Number(result.L || 0), 
                    P: Number(result.P || 0), 
                    JML: Number(result.JML || 0) 
                };
            }), {
                L: categoryL,
                P: categoryP,
                JML: categoryJML
            }];

            rows.push({
                kriteria: category.name,
                values
            });
        }

        // Add grand total row
        const [totalByDusun] = await db.query(`
            SELECT 
                dusun,
                SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as L,
                SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as P,
                COUNT(*) as JML
            FROM citizens
            GROUP BY dusun
            ORDER BY dusun
        `);

        const totalValues = [...dusunList.map(dusun => {
            const result = totalByDusun.find(r => r.dusun === dusun) || { L: 0, P: 0, JML: 0 };
            return { 
                L: Number(result.L || 0), 
                P: Number(result.P || 0), 
                JML: Number(result.JML || 0) 
            };
        }), categoryTotals];

        rows.push({
            kriteria: 'Total',
            values: totalValues,
            isTotal: true
        });

        res.json({
            dusun: dusunList,
            rows
        });
    } catch (error) {
        console.error('Error getting dusun stats:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const getMarriageStats = async (req, res) => {
    try {
        const dusunList = ['DUSUN 001', 'DUSUN 002', 'DUSUN 003', 'DUSUN 004'];
        const marriageStatuses = [
            { name: 'Belum Kawin', code: 'B' },
            { name: 'Kawin', code: 'S' },
            { name: 'Pernah Kawin', code: 'P' }
        ];

        const rows = [];
        let categoryTotals = {
            L: 0,
            P: 0,
            JML: 0
        };

        // Get statistics for each marriage status
        for (const status of marriageStatuses) {
            const [results] = await db.query(`
                SELECT 
                    dusun,
                    SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as L,
                    SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as P,
                    COUNT(*) as JML
                FROM citizens
                WHERE status_perkawinan = ?
                GROUP BY dusun
                ORDER BY dusun
            `, [status.code]);

            // Calculate totals for this status
            const statusL = results.reduce((sum, row) => sum + Number(row.L || 0), 0);
            const statusP = results.reduce((sum, row) => sum + Number(row.P || 0), 0);
            const statusJML = statusL + statusP;

            categoryTotals.L += statusL;
            categoryTotals.P += statusP;
            categoryTotals.JML += statusJML;

            const values = [...dusunList.map(dusun => {
                const result = results.find(r => r.dusun === dusun) || { L: 0, P: 0, JML: 0 };
                return {
                    L: Number(result.L || 0),
                    P: Number(result.P || 0),
                    JML: Number(result.JML || 0)
                };
            }), {
                L: statusL,
                P: statusP,
                JML: statusJML
            }];

            rows.push({
                kriteria: status.name,
                values
            });
        }

        // Get total by dusun for the last row
        const [totalByDusun] = await db.query(`
            SELECT 
                dusun,
                SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as L,
                SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as P,
                COUNT(*) as JML
            FROM citizens
            GROUP BY dusun
            ORDER BY dusun
        `);

        const totalValues = [...dusunList.map(dusun => {
            const result = totalByDusun.find(r => r.dusun === dusun) || { L: 0, P: 0, JML: 0 };
            return { 
                L: Number(result.L || 0), 
                P: Number(result.P || 0), 
                JML: Number(result.JML || 0) 
            };
        }), categoryTotals];

        rows.push({
            kriteria: 'Total',
            values: totalValues,
            isTotal: true
        });

        res.json({
            dusun: dusunList,
            rows
        });
    } catch (error) {
        console.error('Error getting marriage stats:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

const getEducationStats = async (req, res) => {
    try {
        const dusunList = ['DUSUN 001', 'DUSUN 002', 'DUSUN 003', 'DUSUN 004'];
        const educationLevels = [
            { name: 'Tidak/Belum Sekolah', code: 'TIDAK/BELUM SEKOLAH' },
            { name: 'Belum Tamat SD/Sederajat', code: 'BELUM TAMAT SD/SEDERAJAT' },
            { name: 'Tamat SD/Sederajat', code: 'TAMAT SD/SEDERAJAT' },
            { name: 'SLTP/Sederajat', code: 'SLTP/SEDERAJAT' },
            { name: 'SLTA/Sederajat', code: 'SLTA/SEDERAJAT' },
            { name: 'Diploma I/II', code: 'DIPLOMA I/II' },
            { name: 'Akademi/Diploma III/Sarjana Muda', code: 'AKADEMI/DIPLOMA III/SARJANA MUDA' },
            { name: 'Diploma IV/Strata I', code: 'DIPLOMA IV/STRATA I' },
            { name: 'Strata II', code: 'STRATA II' },
            { name: 'Strata III', code: 'STRATA III' }
        ];

        const rows = [];
        let categoryTotals = {
            L: 0,
            P: 0,
            JML: 0
        };

        // Get statistics for each education level
        for (const level of educationLevels) {
            const [results] = await db.query(`
                SELECT 
                    dusun,
                    SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as L,
                    SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as P,
                    COUNT(*) as JML
                FROM citizens
                WHERE COALESCE(pendidikan, '') = ?
                GROUP BY dusun
                ORDER BY dusun
            `, [level.code]);

            // Calculate totals for this level
            const levelL = results.reduce((sum, row) => sum + Number(row.L || 0), 0);
            const levelP = results.reduce((sum, row) => sum + Number(row.P || 0), 0);
            const levelJML = levelL + levelP;

            categoryTotals.L += levelL;
            categoryTotals.P += levelP;
            categoryTotals.JML += levelJML;

            const values = [...dusunList.map(dusun => {
                const result = results.find(r => r.dusun === dusun) || { L: 0, P: 0, JML: 0 };
                return {
                    L: Number(result.L || 0),
                    P: Number(result.P || 0),
                    JML: Number(result.JML || 0)
                };
            }), {
                L: levelL,
                P: levelP,
                JML: levelJML
            }];

            rows.push({
                kriteria: level.name,
                values
            });
        }

        // Get total by dusun (termasuk yang NULL/empty)
        const [totalByDusun] = await db.query(`
            SELECT 
                dusun,
                SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as L,
                SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as P,
                COUNT(*) as JML
            FROM citizens
            GROUP BY dusun
            ORDER BY dusun
        `);

        const totalValues = [...dusunList.map(dusun => {
            const result = totalByDusun.find(r => r.dusun === dusun) || { L: 0, P: 0, JML: 0 };
            return { 
                L: Number(result.L || 0), 
                P: Number(result.P || 0), 
                JML: Number(result.JML || 0) 
            };
        }), {
            L: totalByDusun.reduce((sum, row) => sum + Number(row.L || 0), 0),
            P: totalByDusun.reduce((sum, row) => sum + Number(row.P || 0), 0),
            JML: totalByDusun.reduce((sum, row) => sum + Number(row.JML || 0), 0)
        }];

        rows.push({
            kriteria: 'Total',
            values: totalValues,
            isTotal: true
        });

        res.json({
            dusun: dusunList,
            rows
        });
    } catch (error) {
        console.error('Error getting education stats:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

module.exports = {
    getDashboardStats,
    getAgeStats,
    getDusunStats,
    getMarriageStats,
    getEducationStats
};