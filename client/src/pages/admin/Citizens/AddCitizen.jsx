import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CitizenForm from '../../../components/ui/CitizenForm';
import api from '../../../utils/api';
import { ArrowLeft, UserPlus } from 'lucide-react';

const AddCitizen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await api.post('/citizens', formData);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Data penduduk berhasil ditambahkan'
      });
      navigate('/admin/citizens');
    } catch (error) {
      console.error('Error submitting data:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menambahkan data penduduk';
      const errorDetails = error.response?.data?.errors;
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: errorDetails ? errorDetails.join('<br>') : errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Tambah Data Penduduk</h1>
            <p className="text-sm text-gray-500 mt-0.5">Masukkan informasi data penduduk baru</p>
          </div>
        </div>
        <div className="hidden sm:block">
          {loading && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
              <span>Menyimpan...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CitizenForm 
          onSubmit={handleSubmit} 
          isLoading={loading} 
          showBackButton={false}
        />
      </div>
    </div>
  );
};

export default AddCitizen;