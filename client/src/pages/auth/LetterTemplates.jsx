import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import api from '../../utils/api';

// Preview Modal Component
const PreviewModal = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preview Content */}
          <div className="space-y-6">
            {/* Logo Preview */}
            {template.use_logo && template.logo_path && (
              <div className="text-center">
                <img
                  src={template.logo_path}
                  alt="Logo"
                  className="h-24 mx-auto"
                />
              </div>
            )}

            {/* Header Content */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Kop Surat</h3>
              <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
                {template.header_content}
              </div>
            </div>

            {/* Main Content */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Isi Surat</h3>
              <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
                {template.content}
              </div>
            </div>

            {/* Placeholder Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Placeholder yang tersedia:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{'${nama}'}</span> - Nama lengkap
                </div>
                <div>
                  <span className="font-medium">{'${nik}'}</span> - NIK
                </div>
                <div>
                  <span className="font-medium">{'${tempat_lahir}'}</span> - Tempat lahir
                </div>
                <div>
                  <span className="font-medium">{'${tanggal_lahir}'}</span> - Tanggal lahir
                </div>
                {/* Add more placeholders as needed */}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const LetterTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/letter-templates');
      setTemplates(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data template surat'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Template yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        await api.delete(`/letter-templates/${id}`);
        Swal.fire(
          'Terhapus!',
          'Template berhasil dihapus.',
          'success'
        );
        fetchTemplates();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal menghapus template'
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Nama Template',
        accessor: 'name',
        Cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            {row.original.use_logo && (
              <div className="text-sm text-gray-500">Menggunakan Logo</div>
            )}
          </div>
        ),
      },
      {
        Header: 'Terakhir Digunakan',
        accessor: 'last_used',
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString('id-ID') : '-',
      },
      {
        Header: 'Jumlah Digunakan',
        accessor: 'usage_count',
        Cell: ({ value }) => value || '0',
      },
      {
        Header: 'Aksi',
        id: 'actions',
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => {
                setSelectedTemplate(row.original);
                setShowPreview(true);
              }}
            >
              <EyeIcon className="w-5 h-5" />
            </Button>
            <Link to={`/admin/letter-templates/edit/${row.original.id}`}>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDelete(row.original.id)}
            >
              <TrashIcon className="w-5 h-5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Template Surat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola template surat yang tersedia untuk pembuatan surat.
          </p>
        </div>
        <Link to="/admin/letter-templates/create">
          <Button className="w-full sm:w-auto">
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Template
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={templates}
        />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default LetterTemplates;