import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUpTrayIcon 
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import SearchFilter from '../../../components/ui/SearchFilter';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';

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

const Citizens = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [citizenData, setCitizenData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citizens', {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: pageSize,
          sortBy: 'nama',
          sortOrder: 'ASC'
        }
      });

      if (response.data) {
        setCitizenData({
          data: response.data.data || [],
          pagination: {
            totalItems: response.data.pagination.total || 0,
            totalPages: response.data.pagination.totalPages || 1,
            currentPage: response.data.pagination.currentPage || 1,
            pageSize: response.data.pagination.pageSize || 10
          }
        });
      }
    } catch (error) {
      console.error('Error fetching citizens:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data penduduk',
        showConfirmButton: true,
        confirmButtonText: 'Coba Lagi'
      }).then((result) => {
        if (result.isConfirmed) {
          fetchCitizens();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [currentPage, pageSize, searchTerm]);

  const handleDelete = async (citizen) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      html: `Apakah Anda yakin ingin menghapus data penduduk <b>${citizen.nama}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });
  
    if (result.isConfirmed) {
      try {
        await api.delete(`/citizens/${citizen.id}`);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          html: `Data penduduk <b>${citizen.nama}</b> berhasil dihapus`
        });
        fetchCitizens();
      } catch (error) {
        console.error('Error deleting citizen:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Gagal menghapus data penduduk'
        });
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'number',
        header: 'No',
        size: 70,
        cell: ({ row }) => {
          const rowNumber = (currentPage - 1) * pageSize + row.index + 1;
          return (
            <div className="text-center font-medium">
              {rowNumber}
            </div>
          );
        },
      },
      {
        id: 'nik',
        header: 'NIK',
        accessorKey: 'nik',
        size: 200,
      },
      {
        id: 'name',
        header: 'Nama',
        accessorKey: 'nama',
        size: 250,
      },
      {
        id: 'address',
        header: 'Alamat',
        size: 200,
        cell: ({ row }) => {
          return `${row.original.dusun} RT ${row.original.rt}`;
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-1 justify-center">
            <Link to={`/admin/citizens/${row.original.id}`}>
              <ActionButton
                icon={EyeIcon}
                label="Lihat Detail"
                variant="view"
              />
            </Link>
            {isSuperAdmin && (
              <>
                <Link to={`/admin/citizens/edit/${row.original.id}`}>
                  <ActionButton
                    icon={PencilSquareIcon}
                    label="Edit"
                    variant="edit"
                  />
                </Link>
                <ActionButton
                  icon={TrashIcon}
                  onClick={() => handleDelete(row.original)}
                  label="Hapus"
                  variant="danger"
                />
              </>
            )}
          </div>
        ),
      },
    ],
    [currentPage, pageSize, isSuperAdmin]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (loading && !citizenData.data.length) {
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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Data Penduduk</h1>
        {isSuperAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link to="/admin/citizens/import">
              <Button variant="secondary" className="w-full sm:w-auto">
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Import Excel
              </Button>
            </Link>
            <Link to="/admin/citizens/add">
              <Button className="w-full sm:w-auto">
                <PlusIcon className="h-5 w-5 mr-2" />
                Tambah Penduduk
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Search Filter */}
      <div className="w-full sm:max-w-xs">
        <SearchFilter
          value={searchTerm}
          onSearch={handleSearch}
          placeholder="Cari NIK, Nama, atau Dusun..."
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-md">
        <Table
          columns={columns}
          data={citizenData.data}
          pageCount={citizenData.pagination.totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={citizenData.pagination.totalItems}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default Citizens;