import React, { useState, useEffect } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import Swal from 'sweetalert2';
import { UserCircle, Home, Briefcase, Users } from 'lucide-react';
import { 
  PENDIDIKAN_OPTIONS, 
  PEKERJAAN_OPTIONS, 
  getNormalizedValue,
  getOptionLabel 
} from './options/ciitizenOptions';

const CitizenForm = ({ 
  onSubmit, 
  initialData = {}, 
  isLoading, 
  showBackButton = true,
  readOnly = false,
  onEdit,
  onCreateLetter
}) => {
  // State untuk custom options
  const [customPendidikanOptions, setCustomPendidikanOptions] = useState([...PENDIDIKAN_OPTIONS]);
  const [customPekerjaanOptions, setCustomPekerjaanOptions] = useState([...PEKERJAAN_OPTIONS]);

  const [formData, setFormData] = useState({
    no_kk: '',
    nik: '',
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    status_perkawinan: '',
    jenis_kelamin: '',
    dusun: '',
    rt: '',
    nama_ibu: '',
    nama_ayah: '',
    status_hubungan_keluarga: '',
    agama: '',
    pendidikan: '',
    pekerjaan: '',
    status_mandiri: false,
    status_pt: false,
    status_belum: false,
  });

  // Format helpers
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format dusun helpers
  const formatDusunForInput = (dusun) => {
    if (!dusun) return '';
    return dusun.split(' ')[1] || dusun;
  };

  const formatDusunForSubmit = (dusun) => {
    if (!dusun) return '';
    return dusun.startsWith('DUSUN') ? dusun : `DUSUN ${dusun}`;
  };

  // Effect untuk inisialisasi data
// Update the useEffect in CitizenForm
useEffect(() => {
  if (initialData && Object.keys(initialData).length > 0) {
    // Format dusun dan normalisasi data
    const formattedData = {
      ...initialData,
      dusun: formatDusunForInput(initialData.dusun),
      pendidikan: getNormalizedValue('pendidikan', initialData.pendidikan),
      pekerjaan: getNormalizedValue('pekerjaan', initialData.pekerjaan)
    };

    setFormData(formattedData);

    // Update custom options untuk pendidikan
    const normalizedPendidikan = getNormalizedValue('pendidikan', initialData.pendidikan);
    if (normalizedPendidikan && !PENDIDIKAN_OPTIONS.find(opt => opt.value === normalizedPendidikan)) {
      setCustomPendidikanOptions(prev => {
        if (!prev.find(opt => opt.value === normalizedPendidikan)) {
          return [...prev, { 
            value: normalizedPendidikan, 
            label: getOptionLabel('pendidikan', normalizedPendidikan) || normalizedPendidikan
          }];
        }
        return prev;
      });
    }

    // Update custom options untuk pekerjaan
    const normalizedPekerjaan = getNormalizedValue('pekerjaan', initialData.pekerjaan);
    if (normalizedPekerjaan && !PEKERJAAN_OPTIONS.find(opt => opt.value === normalizedPekerjaan)) {
      setCustomPekerjaanOptions(prev => {
        if (!prev.find(opt => opt.value === normalizedPekerjaan)) {
          return [...prev, { 
            value: normalizedPekerjaan, 
            label: getOptionLabel('pekerjaan', normalizedPekerjaan) || normalizedPekerjaan
          }];
        }
        return prev;
      });
    }
  }
}, [initialData]); // Only depend on initialData

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'no_kk':
        if (!value) return 'No KK wajib diisi';
        if (value.length !== 16) return 'No KK harus 16 digit';
        if (!/^\d+$/.test(value)) return 'No KK hanya boleh berisi angka';
        return '';
      case 'nik':
        if (!value) return 'NIK wajib diisi';
        if (value.length !== 16) return 'NIK harus 16 digit';
        if (!/^\d+$/.test(value)) return 'NIK hanya boleh berisi angka';
        return '';
      case 'nama':
        if (!value) return 'Nama wajib diisi';
        if (value.trim().length < 3) return 'Nama minimal 3 karakter';
        return '';
      case 'tempat_lahir':
        if (!value) return 'Tempat lahir wajib diisi';
        return '';
      case 'tanggal_lahir':
        if (!value) return 'Tanggal lahir wajib diisi';
        return '';
      case 'rt':
        if (!value) return 'RT wajib diisi';
        return '';
      default:
        if (value === '' && !['status_mandiri', 'status_pt', 'status_belum'].includes(name)) {
          return `${name.split('_').join(' ')} wajib diisi`;
        }
        return '';
    }
  };

  const handleChange = (e) => {
    if (readOnly) return;
    
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
  
    // Normalisasi value untuk pendidikan dan pekerjaan
    if (name === 'pendidikan' || name === 'pekerjaan') {
      newValue = getNormalizedValue(name, value);
      
      // Cek apakah value yang sudah dinormalisasi ada di options
      const existingOption = (name === 'pendidikan' ? customPendidikanOptions : customPekerjaanOptions)
        .find(opt => opt.value === newValue);
      
      // Hanya tambahkan jika belum ada
      if (!existingOption) {
        const newOption = { 
          value: newValue, 
          label: getOptionLabel(name, newValue) || newValue 
        };
        
        if (name === 'pendidikan') {
          setCustomPendidikanOptions(prev => [...prev, newOption]);
        } else {
          setCustomPekerjaanOptions(prev => [...prev, newOption]);
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  
    const error = validateField(name, newValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!['status_mandiri', 'status_pt', 'status_belum'].includes(key)) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors)
        .filter(error => error)
        .map(error => `• ${error}`);

      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        html: errorMessages.join('<br>'),
        confirmButtonText: 'Ok',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Format data sebelum submit
    const formattedData = {
      ...formData,
      dusun: formatDusunForSubmit(formData.dusun)
    };

    onSubmit(formattedData);
  };

  // ReadOnly field component
  const ReadOnlyField = ({ label, value }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
        {value || '-'}
      </div>
    </div>
  );

  // Fungsi untuk mendapatkan nilai display
  const getDisplayValue = (fieldName, value) => {
    if (!value) return '-';

    const mappings = {
      status_perkawinan: {
        'B': 'Belum Kawin',
        'S': 'Sudah Kawin',
        'P': 'Pernah Kawin'
      },
      jenis_kelamin: {
        'L': 'Laki-laki',
        'P': 'Perempuan'
      },
      dusun: {
        '001': 'DUSUN 001',
        '002': 'DUSUN 002',
        '003': 'DUSUN 003',
        '004': 'DUSUN 004'
      }
    };

    if (mappings[fieldName]?.[value]) {
      return mappings[fieldName][value];
    }

    if (fieldName === 'tanggal_lahir') {
      return formatDateForDisplay(value);
    }

    return value;
  };

  // JSX RENDER BAGIAN
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-8">
      {/* Data Identitas */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-gray-800 pb-2 border-b">
          <UserCircle className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Data Identitas</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {readOnly ? (
            <>
              <ReadOnlyField label="No KK" value={formData.no_kk} />
              <ReadOnlyField label="NIK" value={formData.nik} />
              <ReadOnlyField label="Nama Lengkap" value={formData.nama} />
              <ReadOnlyField label="Tempat Lahir" value={formData.tempat_lahir} />
              <ReadOnlyField 
                label="Tanggal Lahir" 
                value={getDisplayValue('tanggal_lahir', formData.tanggal_lahir)} 
              />
            </>
          ) : (
            <>
              <Input
                label="No KK"
                name="no_kk"
                value={formData.no_kk}
                onChange={handleChange}
                error={errors.no_kk}
                required
                maxLength={16}
                placeholder="Masukkan 16 digit No KK"
              />
              <Input
                label="NIK"
                name="nik"
                value={formData.nik}
                onChange={handleChange}
                error={errors.nik}
                required
                maxLength={16}
                placeholder="Masukkan 16 digit NIK"
              />
              <Input
                label="Nama Lengkap"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                error={errors.nama}
                required
                placeholder="Masukkan nama lengkap"
              />
              <Input
                label="Tempat Lahir"
                name="tempat_lahir"
                value={formData.tempat_lahir}
                onChange={handleChange}
                error={errors.tempat_lahir}
                required
                placeholder="Masukkan tempat lahir"
              />
              <Input
                label="Tanggal Lahir"
                name="tanggal_lahir"
                type="date"
                value={formatDateForInput(formData.tanggal_lahir)}
                onChange={handleChange}
                error={errors.tanggal_lahir}
                required
              />
            </>
          )}
        </div>
      </div>

      {/* Data Alamat */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-gray-800 pb-2 border-b">
          <Home className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Data Alamat</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {readOnly ? (
            <>
              <ReadOnlyField 
                label="Dusun" 
                value={getDisplayValue('dusun', formData.dusun)} 
              />
              <ReadOnlyField 
                label="RT" 
                value={formData.rt} 
              />
            </>
          ) : (
            <>
              <Select
                label="Dusun"
                name="dusun"
                value={formData.dusun}
                onChange={handleChange}
                error={errors.dusun}
                required
                options={[
                  { value: '001', label: 'DUSUN 001' },
                  { value: '002', label: 'DUSUN 002' },
                  { value: '003', label: 'DUSUN 003' },
                  { value: '004', label: 'DUSUN 004' }
                ]}
                placeholder="Pilih Dusun"
              />
              <Input
                label="RT"
                name="rt"
                value={formData.rt}
                onChange={handleChange}
                error={errors.rt}
                required
                maxLength={3}
                placeholder="Masukkan 3 digit RT"
              />
            </>
          )}
        </div>
      </div>

      {/* Data Status */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-gray-800 pb-2 border-b">
          <Users className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Data Status</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {readOnly ? (
            <>
              <ReadOnlyField 
                label="Status Perkawinan" 
                value={getDisplayValue('status_perkawinan', formData.status_perkawinan)} 
              />
              <ReadOnlyField 
                label="Jenis Kelamin" 
                value={getDisplayValue('jenis_kelamin', formData.jenis_kelamin)} 
              />
              <ReadOnlyField 
                label="Nama Ibu Kandung" 
                value={formData.nama_ibu} 
              />
              <ReadOnlyField 
                label="Nama Ayah Kandung" 
                value={formData.nama_ayah} 
              />
              <ReadOnlyField 
                label="Status Hubungan Keluarga" 
                value={formData.status_hubungan_keluarga}
              />
            </>
          ) : (
            <>
              <Select
                label="Status Perkawinan"
                name="status_perkawinan"
                value={formData.status_perkawinan}
                onChange={handleChange}
                error={errors.status_perkawinan}
                required
                options={[
                  { value: 'B', label: 'Belum Kawin' },
                  { value: 'S', label: 'Sudah Kawin' },
                  { value: 'P', label: 'Pernah Kawin' }
                ]}
                placeholder="Pilih Status Perkawinan"
              />
              
              <Select
                label="Jenis Kelamin"
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                error={errors.jenis_kelamin}
                required
                options={[
                  { value: 'L', label: 'Laki-laki' },
                  { value: 'P', label: 'Perempuan' }
                ]}
                placeholder="Pilih Jenis Kelamin"
              />

              <Input
                label="Nama Ibu Kandung"
                name="nama_ibu"
                value={formData.nama_ibu}
                onChange={handleChange}
                error={errors.nama_ibu}
                required
                placeholder="Masukkan nama ibu kandung"
              />

              <Input
                label="Nama Ayah Kandung"
                name="nama_ayah"
                value={formData.nama_ayah}
                onChange={handleChange}
                error={errors.nama_ayah}
                required
                placeholder="Masukkan nama ayah kandung"
              />

              <Select
                label="Status Hubungan Keluarga"
                name="status_hubungan_keluarga"
                value={formData.status_hubungan_keluarga}
                onChange={handleChange}
                error={errors.status_hubungan_keluarga}
                required
                options={[
                  { value: 'KEPALA KELUARGA', label: 'Kepala Keluarga' },
                  { value: 'ISTRI', label: 'Istri' },
                  { value: 'ANAK', label: 'Anak' },
                  { value: 'CUCU', label: 'Cucu' },
                  { value: 'ORANG TUA', label: 'Orang Tua' },
                  { value: 'MERTUA', label: 'Mertua' },
                  { value: 'FAMILI LAIN', label: 'Famili Lain' }
                ]}
                placeholder="Pilih Status Hubungan Keluarga"
              />
            </>
          )}
        </div>
      </div>

      {/* Data Pendidikan & Pekerjaan */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-gray-800 pb-2 border-b">
          <Briefcase className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Data Pendidikan & Pekerjaan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {readOnly ? (
            <>
              <ReadOnlyField 
                label="Agama" 
                value={formData.agama}
              />
              <ReadOnlyField 
                label="Pendidikan" 
                value={getOptionLabel('pendidikan', formData.pendidikan) || formData.pendidikan}
              />
              <ReadOnlyField 
                label="Pekerjaan" 
                value={getOptionLabel('pekerjaan', formData.pekerjaan) || formData.pekerjaan}
              />
            </>
          ) : (
            <>
              <Select
                label="Agama"
                name="agama"
                value={formData.agama}
                onChange={handleChange}
                error={errors.agama}
                required
                options={[
                  { value: 'ISLAM', label: 'Islam' },
                  { value: 'KRISTEN', label: 'Kristen' },
                  { value: 'KATOLIK', label: 'Katolik' },
                  { value: 'HINDU', label: 'Hindu' },
                  { value: 'BUDDHA', label: 'Buddha' },
                  { value: 'KONGHUCU', label: 'Konghucu' }
                ]}
                placeholder="Pilih Agama"
              />

              <Select
                label="Pendidikan"
                name="pendidikan"
                value={formData.pendidikan}
                onChange={handleChange}
                error={errors.pendidikan}
                required
                options={customPendidikanOptions}
                creatable
                placeholder="Pilih/Tambah Pendidikan"
                onCreateOption={(inputValue) => {
                  const newOption = { 
                    value: getNormalizedValue('pendidikan', inputValue),
                    label: getOptionLabel('pendidikan', inputValue) || inputValue
                  };
                  setCustomPendidikanOptions(prev => [...prev, newOption]);
                  return newOption;
                }}
              />

              <Select
                label="Pekerjaan"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleChange}
                error={errors.pekerjaan}
                required
                options={customPekerjaanOptions}
                creatable
                placeholder="Pilih/Tambah Pekerjaan"
                onCreateOption={(inputValue) => {
                  const newOption = {
                    value: getNormalizedValue('pekerjaan', inputValue),
                    label: getOptionLabel('pekerjaan', inputValue) || inputValue
                  };
                  setCustomPekerjaanOptions(prev => [...prev, newOption]);
                  return newOption;
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Status Checkbox */}
      <div className="space-y-6">
        <div className="space-y-4">
          {readOnly ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReadOnlyField
                label="Status Mandiri"
                value={formData.status_mandiri ? "Ya" : "Tidak"}
              />
              <ReadOnlyField
                label="Status PT"
                value={formData.status_pt ? "Ya" : "Tidak"}
              />
              <ReadOnlyField
                label="Status Belum"
                value={formData.status_belum ? "Ya" : "Tidak"}
              />
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="status_mandiri"
                  name="status_mandiri"
                  checked={formData.status_mandiri}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="status_mandiri" className="ml-2 text-sm text-gray-700">
                  Status Mandiri
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="status_pt"
                  name="status_pt"
                  checked={formData.status_pt}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="status_pt" className="ml-2 text-sm text-gray-700">
                  Status PT
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="status_belum"
                  name="status_belum"
                  checked={formData.status_belum}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="status_belum" className="ml-2 text-sm text-gray-700">
                  Status Belum
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        {readOnly ? (
          <>
            {onEdit && (
              <Button 
                type="button" 
                onClick={onEdit}
                className="w-full sm:w-auto"
              >
                Edit Data
              </Button>
            )}
            {onCreateLetter && (
              <Button 
                type="button"
                variant="primary"
                onClick={onCreateLetter}
                className="w-full sm:w-auto"
              >
                Buat Surat
              </Button>
            )}
          </>
        ) : (
          <>
            {showBackButton && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
            )}
            <Button 
              type="submit" 
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              Simpan
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default CitizenForm;