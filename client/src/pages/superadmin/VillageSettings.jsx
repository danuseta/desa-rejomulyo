import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, Phone, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import api from '../../utils/api';

const Input = ({ label, error, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const VillageSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('main');
  
  const [formState, setFormState] = useState({
    village_name: '',
    district_name: '',
    regency_name: '',
    address: '',
    phone: '',
    email: '',
    head_name: '',
    head_position: '',
  });

  const labelTranslations = {
    village_name: 'Nama Desa',
    district_name: 'Nama Kecamatan',
    regency_name: 'Nama Kabupaten',
    address: 'Alamat',
    phone: 'Nomor Telepon',
    email: 'Email',
    head_name: 'Nama Kepala Desa',
    head_position: 'Jabatan Kepala Desa'
  };

  const fetchVillageInfo = async () => {
    try {
      const response = await api.get('/village');
      setFormState({
        village_name: response.data.village_name || '',
        district_name: response.data.district_name || '',
        regency_name: response.data.regency_name || '',
        address: response.data.address || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        head_name: response.data.head_name || '',
        head_position: response.data.head_position || '',
      });
    } catch (error) {
      console.error('Error fetching village data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil informasi desa'
      });
      navigate('/admin/dashboard');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchVillageInfo();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['village_name', 'district_name', 'regency_name', 'address', 'head_name', 'head_position'];
    
    requiredFields.forEach(field => {
      if (!formState[field]) {
        newErrors[field] = `${labelTranslations[field]} harus diisi`;
      }
    });

    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (formState.phone && !/^[0-9+\-() ]*$/.test(formState.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (value, key) => {
    setFormState(prev => ({
      ...prev,
      [key]: value
    }));
    // Clear error when user types
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await Swal.fire({
      title: 'Konfirmasi',
      html: 'Apakah Anda yakin ingin menyimpan perubahan data desa?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const formData = new FormData();
        Object.keys(formState).forEach(key => {
          formData.append(key, formState[key]);
        });

        await api.put('/village', formData);
        
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Informasi desa berhasil diperbarui'
        });
        
        navigate('/admin/dashboard');
      } catch (error) {
        console.error('Error updating village info:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Gagal memperbarui informasi desa'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Pengaturan Informasi Desa
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola informasi dan data desa Anda
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors
              ${activeTab === 'main' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <Building2 className="w-4 h-4" />
            Informasi Utama
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors
              ${activeTab === 'contact'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <MapPin className="w-4 h-4" />
            Kontak & Lokasi
          </button>
          <button
            onClick={() => setActiveTab('leadership')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors
              ${activeTab === 'leadership'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <User className="w-4 h-4" />
            Kepemimpinan
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'main' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={labelTranslations.village_name}
                value={formState.village_name}
                onChange={(e) => handleInputChange(e.target.value, 'village_name')}
                error={errors.village_name}
                required
                placeholder="Masukkan nama desa"
              />
              <Input
                label={labelTranslations.district_name}
                value={formState.district_name}
                onChange={(e) => handleInputChange(e.target.value, 'district_name')}
                error={errors.district_name}
                required
                placeholder="Masukkan nama kecamatan"
              />
              <Input
                label={labelTranslations.regency_name}
                value={formState.regency_name}
                onChange={(e) => handleInputChange(e.target.value, 'regency_name')}
                error={errors.regency_name}
                required
                placeholder="Masukkan nama kabupaten"
              />
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={labelTranslations.address}
                value={formState.address}
                onChange={(e) => handleInputChange(e.target.value, 'address')}
                error={errors.address}
                required
                placeholder="Masukkan alamat lengkap"
              />
              <Input
                label={labelTranslations.phone}
                value={formState.phone}
                onChange={(e) => handleInputChange(e.target.value, 'phone')}
                error={errors.phone}
                type="tel"
                placeholder="Masukkan nomor telepon"
              />
              <Input
                label={labelTranslations.email}
                value={formState.email}
                onChange={(e) => handleInputChange(e.target.value, 'email')}
                error={errors.email}
                type="email"
                placeholder="Masukkan alamat email"
              />
            </div>
          )}

          {activeTab === 'leadership' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={labelTranslations.head_name}
                value={formState.head_name}
                onChange={(e) => handleInputChange(e.target.value, 'head_name')}
                error={errors.head_name}
                required
                placeholder="Masukkan nama kepala desa"
              />
              <Input
                label={labelTranslations.head_position}
                value={formState.head_position}
                onChange={(e) => handleInputChange(e.target.value, 'head_position')}
                error={errors.head_position}
                required
                placeholder="Masukkan jabatan kepala desa"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="px-4 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VillageSettings;