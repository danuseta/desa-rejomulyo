import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../utils/api';

const ActionButton = ({ icon: Icon, onClick, label, variant = "ghost", disabled = false }) => {
  const variants = {
    view: "text-blue-600 hover:bg-blue-50",
    edit: "text-emerald-600 hover:bg-emerald-50",
    danger: "text-red-600 hover:bg-red-50",
    ghost: "text-slate-600 hover:bg-slate-50"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={label}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
};

const ManageAdmin = () => {
  const [adminData, setAdminData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'admin'
  });

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, pageSize]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          page: currentPage,
          limit: pageSize
        }
      });
      setAdminData(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data admin. Silakan coba lagi nanti.',
        showConfirmButton: true,
        confirmButtonText: 'Coba Lagi',
      }).then((result) => {
        if (result.isConfirmed) {
          fetchAdmins();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      setShowModal(false);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'admin'
      });
      fetchAdmins();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Admin berhasil ditambahkan'
      });
    } catch (error) {
      console.error('Error adding admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Gagal menambahkan admin'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        await api.delete(`/admin/users/${id}`);
        Swal.fire('Terhapus!', 'Admin berhasil dihapus.', 'success');
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Gagal menghapus admin'
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'No',
        accessorFn: (_, index) => (currentPage - 1) * pageSize + index + 1,
        size: 70,
      },
      {
        header: 'Username',
        accessorKey: 'username',
        size: 200,
      },
      {
        header: 'Nama Lengkap',
        accessorKey: 'full_name',
        size: 250,
      },
      {
        header: 'Role',
        accessorKey: 'role',
        size: 150,
        cell: ({ row }) => 
          row.original.role === 'super_admin' ? 'Super Admin' : 'Admin'
      },
      {
        header: 'Aksi',
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <ActionButton
              icon={TrashIcon}
              onClick={() => handleDelete(row.original.id)}
              label="Hapus Admin"
              variant="danger"
              disabled={row.original.role === 'super_admin'}
            />
          </div>
        ),
      },
    ],
    [currentPage, pageSize]
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
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Kelola Admin</h1>
        <Button onClick={() => setShowModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Admin
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={adminData.data || []}
          pageCount={adminData.pagination?.totalPages || 1}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalItems={adminData.pagination?.totalItems || 0}
          isLoading={loading}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Tambah Admin</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 p-1 rounded-lg transition-colors hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Nama Lengkap"
                name="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmin;