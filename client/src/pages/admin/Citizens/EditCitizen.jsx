import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import CitizenForm from '../../../components/ui/CitizenForm';
import api from '../../../utils/api';

const EditCitizen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [citizen, setCitizen] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchCitizen();
  }, [id]);

  const fetchCitizen = async () => {
    try {
      const response = await api.get(`/citizens/${id}`);
      setCitizen(response.data);
    } catch (error) {
      console.error('Error fetching citizen data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data penduduk'
      });
      navigate('/admin/citizens');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      html: `Apakah Anda yakin ingin menyimpan perubahan data penduduk <b>${formData.nama}</b>?`,
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
        await api.put(`/citizens/${id}`, formData);
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          html: `Data penduduk <b>${formData.nama}</b> berhasil diupdate`
        });
        navigate('/admin/citizens');
      } catch (error) {
        console.error('Error updating data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Gagal mengupdate data penduduk'
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

  if (!citizen) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <UserRound className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Data Tidak Ditemukan</h3>
          <p className="mt-2 text-gray-500">Data penduduk yang Anda cari tidak tersedia.</p>
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
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Edit Data Penduduk</h1>
            <p className="text-sm text-gray-500 mt-0.5">Perbarui informasi data penduduk</p>
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
          initialData={citizen} 
          onSubmit={handleSubmit} 
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default EditCitizen;