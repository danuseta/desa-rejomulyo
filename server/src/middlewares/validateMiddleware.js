 
// src/middlewares/validateMiddleware.js
const validateCitizen = (req, res, next) => {
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
        pekerjaan
    } = req.body;

    const errors = [];

    // Validate required fields
    if (!no_kk || no_kk.length !== 16) {
        errors.push('Nomor KK harus 16 digit');
    }
    if (!nik || nik.length !== 16) {
        errors.push('NIK harus 16 digit');
    }
    if (!nama || nama.trim().length < 3) {
        errors.push('Nama minimal 3 karakter');
    }
    if (!tempat_lahir) {
        errors.push('Tempat lahir wajib diisi');
    }
    if (!tanggal_lahir || !isValidDate(tanggal_lahir)) {
        errors.push('Tanggal lahir tidak valid');
    }
    if (!['B', 'S', 'P'].includes(status_perkawinan)) {
        errors.push('Status perkawinan tidak valid');
    }
    if (!['L', 'P'].includes(jenis_kelamin)) {
        errors.push('Jenis kelamin tidak valid');
    }
    if (!dusun) {
        errors.push('Dusun wajib diisi');
    }
    if (!rt || rt.length > 3) {
        errors.push('RT tidak valid');
    }
    if (!nama_ibu) {
        errors.push('Nama ibu wajib diisi');
    }
    if (!nama_ayah) {
        errors.push('Nama ayah wajib diisi');
    }
    if (!status_hubungan_keluarga) {
        errors.push('Status hubungan keluarga wajib diisi');
    }
    if (!agama) {
        errors.push('Agama wajib diisi');
    }
    if (!pendidikan) {
        errors.push('Pendidikan wajib diisi');
    }
    if (!pekerjaan) {
        errors.push('Pekerjaan wajib diisi');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            message: 'Validasi gagal', 
            errors 
        });
    }

    next();
};

// Helper function to validate date
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

module.exports = {
    validateCitizen
};