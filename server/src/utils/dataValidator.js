 
// src/utils/dataValidator.js

const validateNIK = (nik) => {
    return /^\d{16}$/.test(nik);
};

const validateNoKK = (noKK) => {
    return /^\d{16}$/.test(noKK);
};

const validateRT = (rt) => {
    return /^\d{3}$/.test(rt);
};

exports.validateCitizen = (data) => {
    const errors = [];

    // Required fields
    const requiredFields = [
        'no_kk', 'nik', 'nama', 'tempat_lahir', 'tanggal_lahir',
        'status_perkawinan', 'jenis_kelamin', 'dusun', 'rt',
        'nama_ibu', 'nama_ayah', 'status_hubungan_keluarga',
        'agama', 'pendidikan', 'pekerjaan'
    ];

    requiredFields.forEach(field => {
        if (!data[field]) {
            errors.push(`${field} harus diisi`);
        }
    });

    // NIK validation
    if (data.nik && !validateNIK(data.nik)) {
        errors.push('NIK harus 16 digit angka');
    }

    // No KK validation
    if (data.no_kk && !validateNoKK(data.no_kk)) {
        errors.push('No KK harus 16 digit angka');
    }

    // RT validation
    if (data.rt && !validateRT(data.rt)) {
        errors.push('RT harus 3 digit angka');
    }

    // Status perkawinan validation
    if (data.status_perkawinan && !['B', 'S', 'P'].includes(data.status_perkawinan)) {
        errors.push('Status perkawinan tidak valid (B/S/P)');
    }

    // Jenis kelamin validation
    if (data.jenis_kelamin && !['L', 'P'].includes(data.jenis_kelamin)) {
        errors.push('Jenis kelamin tidak valid (L/P)');
    }

    // Tanggal lahir validation
    if (data.tanggal_lahir) {
        const birthDate = new Date(data.tanggal_lahir);
        if (isNaN(birthDate.getTime())) {
            errors.push('Format tanggal lahir tidak valid');
        } else if (birthDate > new Date()) {
            errors.push('Tanggal lahir tidak boleh lebih dari hari ini');
        }
    }

    // Name length validation
    if (data.nama && data.nama.length > 100) {
        errors.push('Nama tidak boleh lebih dari 100 karakter');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};