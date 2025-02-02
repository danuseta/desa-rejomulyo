import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import _ from 'lodash';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../utils/api';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const CreateLetter = () => {
  const location = useLocation();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [citizen, setCitizen] = useState(location.state?.citizen || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/letter-templates', {
        params: {
          limit: 100, // Ambil semua template yang tersedia
          page: 1
        }
      });
      setTemplates(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil template surat. Silakan coba lagi.',
        showConfirmButton: true,
        confirmButtonText: 'Coba Lagi'
      }).then((result) => {
        if (result.isConfirmed) {
          fetchTemplates();
        }
      });
    }
  };

  const debouncedSearch = useCallback(
    _.debounce(async (searchValue) => {
      if (searchValue.length >= 3) {
        try {
          const response = await api.get(`/citizens/search?q=${searchValue}`);
          // Tambahkan log untuk debugging
          console.log('Search response:', response.data);
          
          // Handle both formats - array or {data: []}
          const results = Array.isArray(response.data) ? 
            response.data : 
            response.data?.data || [];
          
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching citizens:', error);
          setSearchResults([]);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal mencari data penduduk'
          });
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const selectCitizen = (selected) => {
    setCitizen(selected);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    setLetterContent('');
    
    if (citizen && templateId) {
      try {
        const response = await api.post('/letters/preview', {
          templateId,
          citizenId: citizen.id
        });
        setLetterContent(response.data.content);
      } catch (error) {
        console.error('Error getting preview:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal mengambil preview surat'
        });
      }
    }
  };

  const handlePrint = async () => {
    if (!citizen || !selectedTemplate) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Pilih penduduk dan template surat terlebih dahulu'
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post(
        '/letters/generate',
        {
          templateId: selectedTemplate,
          citizenId: citizen.id
        },
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      
      if (newWindow === null) {
        Swal.fire({
          icon: 'warning',
          title: 'Pop-up Diblokir',
          text: 'Mohon izinkan pop-up untuk melihat PDF'
        });
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Surat berhasil dibuat'
      });
  
    } catch (error) {
      console.error('Error generating letter:', error);
  
      let errorMessage = 'Gagal membuat surat. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCitizen(null);
    setSearchTerm('');
    setSelectedTemplate('');
    setLetterContent('');
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Buat Surat</h1>
        {loading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
            <span>Memproses...</span>
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Pencarian Penduduk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Penduduk (NIK/Nama)
            </label>
            <div className="relative">
              <Input
                type="text"
                name="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Masukkan NIK atau Nama"
                disabled={!!citizen}
                className="w-full"
                autoComplete="off"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border max-h-48 sm:max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="px-3 py-2 sm:px-4 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectCitizen(result)}
                    >
                      <p className="font-medium text-sm sm:text-base">{result.nama}</p>
                      <p className="text-xs sm:text-sm text-gray-500">NIK: {result.nik}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Data Penduduk Terpilih */}
          {citizen && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-medium text-gray-900">Data Penduduk</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  Ganti
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">NIK</p>
                  <p className="font-medium">{citizen.nik}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium">{citizen.nama}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium">
                    {citizen.dusun} RT {citizen.rt}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pilih Template Surat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Jenis Surat
            </label>
            <select
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={selectedTemplate}
              onChange={handleTemplateChange}
              disabled={!citizen}
            >
              <option value="">Pilih Template</option>
              {Array.isArray(templates) && templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Surat */}
          {letterContent && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Preview Surat</h3>
              <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={letterContent}
                    plugins={[defaultLayoutPluginInstance]}
                  />
                </Worker>
              </div>
            </div>
          )}

          {/* Tombol Cetak */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handlePrint}
              disabled={!citizen || !selectedTemplate || loading}
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Memproses...' : 'Cetak Surat'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLetter;