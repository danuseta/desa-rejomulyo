import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Lock, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/auth/me');
      setFormData(prev => ({
        ...prev,
        username: response.data.username || '',
        full_name: response.data.full_name || '',
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil informasi pengguna'
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username harus diisi';
    }
    
    if (!formData.full_name) {
      newErrors.full_name = 'Nama lengkap harus diisi';
    }
    
    if (formData.new_password) {
      if (!formData.current_password) {
        newErrors.current_password = 'Password saat ini harus diisi';
      }
      if (formData.new_password.length < 6) {
        newErrors.new_password = 'Password minimal 6 karakter';
      }
      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Password tidak cocok';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await Swal.fire({
      title: 'Konfirmasi',
      html: 'Apakah Anda yakin ingin menyimpan perubahan data?',
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
        const userData = {
          username: formData.username,
          full_name: formData.full_name
        };

        if (formData.new_password) {
          userData.current_password = formData.current_password;
          userData.new_password = formData.new_password;
        }

        const response = await api.put('/auth/profile', userData);
        setUser({
          username: userData.username,
          full_name: userData.full_name,
          role: user.role
        });

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Profil berhasil diperbarui'
        });
        
        navigate('/admin/dashboard');
      } catch (error) {
        console.error('Error updating profile:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || error.message || 'Gagal memperbarui profil'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Pengaturan Profil
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Kelola informasi profil dan keamanan akun Anda
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors
              ${activeTab === 'profile' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <User className="w-4 h-4" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors
              ${activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <Lock className="w-4 h-4" />
            Keamanan
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'profile' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                error={errors.username}
                placeholder="Masukkan username"
              />
              <Input
                label="Nama Lengkap"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                error={errors.full_name}
                placeholder="Masukkan nama lengkap"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Ganti Password</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pastikan menggunakan password yang kuat dan belum pernah digunakan sebelumnya
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Password Saat Ini"
                  name="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  error={errors.current_password}
                  placeholder="Masukkan password saat ini"
                />
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Password Baru"
                    name="new_password"
                    type="password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    error={errors.new_password}
                    placeholder="Masukkan password baru"
                  />
                  <Input
                    label="Konfirmasi Password Baru"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    error={errors.confirm_password}
                    placeholder="Konfirmasi password baru"
                  />
                </div>
              </div>
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

export default Settings;