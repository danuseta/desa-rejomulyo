import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { renderAsync } from 'docx-preview';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import api from '../../utils/api';

const TemplateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(id ? true : false);

  // Ref for file input
  const templateInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'docx'
  });

  // File state
  const [templateFile, setTemplateFile] = useState(null);

  // Effect to load existing template data
  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await api.get(`/letter-templates/${id}`);
      setFormData({
        name: response.data.name,
        type: response.data.template_type || 'docx'
      });
      
      // Preview existing template
      if (response.data.template_path) {
        try {
          const fileResponse = await api.get(`/letter-templates/${id}/file`, {
            responseType: 'arraybuffer'
          });
          const container = document.getElementById('preview-container');
          if (container) {
            container.innerHTML = '';
            await renderAsync(fileResponse.data, container, container);
          }
        } catch (previewError) {
          console.error('Error previewing template:', previewError);
        }
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data template'
      });
      navigate('/superadmin/letter-templates');
    } finally {
      setInitialLoading(false);
    }
  };

  // Handle template file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const isWordFile = 
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.doc') || 
      file.name.endsWith('.docx');

    if (!isWordFile) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Format file harus Word Document (.doc atau .docx)'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ukuran file tidak boleh lebih dari 10MB'
      });
      return;
    }

    setTemplateFile(file);

    // Preview file
    try {
      const arrayBuffer = await file.arrayBuffer();
      const container = document.getElementById('preview-container');
      if (container) {
        container.innerHTML = '';
        await renderAsync(arrayBuffer, container, container);
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal menampilkan preview template'
      });
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setTemplateFile(null);
    if (templateInputRef.current) {
      templateInputRef.current.value = '';
    }
    const container = document.getElementById('preview-container');
    if (container) {
      container.innerHTML = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Nama template harus diisi');
      }

      if (!id && !templateFile) {
        throw new Error('File template Word harus diupload');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('template_type', formData.type);
      
      if (templateFile) {
        formDataToSend.append('template', templateFile);
      }

      if (id) {
        await api.put(`/letter-templates/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/letter-templates', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Sukses',
        text: id ? 'Template berhasil diupdate' : 'Template berhasil dibuat'
      });

      navigate('/superadmin/letter-templates');
    } catch (error) {
      console.error('Error saving template:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Gagal menyimpan template'
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/superadmin/letter-templates')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Kembali ke Daftar Template
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {id ? 'Edit Template' : 'Tambah Template'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Template
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Contoh: Surat Keterangan Tidak Mampu"
            />
          </div>

          {/* Template Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Template Word
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={templateInputRef}
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
                id="template-upload"
              />
              <label
                htmlFor="template-upload"
                className="px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition inline-block"
              >
                {templateFile ? 'Ganti Template' : 'Upload Template'}
              </label>
              {templateFile && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md flex-1">
                  <span className="text-sm text-gray-600 truncate">
                    {templateFile.name}
                  </span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-600 flex-shrink-0"
                    onClick={handleRemoveFile}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Format: DOC, DOCX (Microsoft Word). Maksimal 10MB
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Gunakan placeholder berikut dalam template Word: {'{nama}'}, {'{nik}'}, {'{tempat_lahir}'}, {'{tanggal_lahir}'}, {'{jenis_kelamin}'}, {'{alamat}'}, {'{agama}'}, {'{status_perkawinan}'}, {'{pekerjaan}'}
            </p>
          </div>

          {/* Preview Document */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Template</h3>
            <div 
              id="preview-container"
              className="border rounded-lg p-4 bg-white min-h-[500px] overflow-auto"
            />
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/superadmin/letter-templates')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              {id ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateForm;