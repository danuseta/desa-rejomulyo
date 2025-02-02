import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import api from '../../utils/api';

const ActionButton = ({ icon: Icon, onClick, label, variant = "ghost" }) => {
  const variants = {
    view: "text-blue-600 hover:bg-blue-50",
    edit: "text-emerald-600 hover:bg-emerald-50",
    danger: "text-red-600 hover:bg-red-50",
    ghost: "text-slate-600 hover:bg-slate-50"
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${variants[variant]}`}
      title={label}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
};

const ManageLetterTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, pageSize]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/letter-templates', {
        params: {
          page: currentPage,
          limit: pageSize
        }
      });
      
      setTemplates(response.data.data);
      setTotalItems(response.data.pagination.totalItems);
      setPageCount(response.data.pagination.totalPages);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data template'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Template yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        await api.delete(`/letter-templates/${id}`);
        fetchTemplates();
        Swal.fire('Terhapus!', 'Template berhasil dihapus.', 'success');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Gagal menghapus template'
      });
    }
  };

  const columns = React.useMemo(
    () => [
      {
        header: 'No',
        accessorFn: (_, index) => (currentPage - 1) * pageSize + index + 1,
        size: 70,
      },
      {
        header: 'Nama Template',
        accessorKey: 'name',
        size: 250,
      },
      {
        header: 'Tipe Template',
        accessorKey: 'template_type',
        size: 150,
        cell: ({ row }) => row.original.template_type === 'docx' ? 'Word Document' : 'Text',
      },
      {
        header: 'Terakhir Diupdate',
        accessorKey: 'updated_at',
        size: 200,
        cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      },
      {
        header: 'Aksi',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 justify-center">
            <ActionButton
              icon={PencilSquareIcon}
              onClick={() => navigate(`/superadmin/letter-templates/edit/${row.original.id}`)}
              label="Edit Template"
              variant="edit"
            />
            <ActionButton
              icon={TrashIcon}
              onClick={() => handleDelete(row.original.id)}
              label="Hapus Template"
              variant="danger"
            />
          </div>
        ),
      },
    ],
    [navigate, currentPage, pageSize]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Template Surat</h1>
        <Button onClick={() => navigate('/superadmin/letter-templates/add')}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Template
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={templates}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          pageCount={pageCount}
          totalItems={totalItems}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default ManageLetterTemplates;