import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound, FileEdit, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import CitizenForm from '../../../components/ui/CitizenForm';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

const CitizenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitizenData();
  }, [id]);

  const fetchCitizenData = async () => {
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
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/citizens/edit/${id}`);
  };

  const handleCreateLetter = () => {
    navigate('/admin/create-letter', { state: { citizen } });
  };

  if (loading) {
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
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Detail Penduduk</h1>
            <p className="text-sm text-gray-500 mt-0.5">Informasi lengkap data penduduk</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* <button
            onClick={handleCreateLetter}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Buat Surat
          </button> */}
          {isSuperAdmin && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Edit Data
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CitizenForm 
          initialData={citizen}
          readOnly={true}
          showBackButton={false}
          onEdit={isSuperAdmin ? handleEdit : undefined}
          onCreateLetter={handleCreateLetter}
        />
      </div>
    </div>
  );
};

export default CitizenDetail;