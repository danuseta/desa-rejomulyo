import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import SearchFilter from '../../components/ui/SearchFilter';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import { 
  Download,
  Calendar,
  FileText,
  Filter,
  XCircle
} from 'lucide-react';

const LetterHistory = () => {
  const [history, setHistory] = useState({ 
    data: [], 
    pagination: { 
      totalItems: 0, 
      totalPages: 1,
      currentPage: 1,
      pageSize: 10 
    } 
  });
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    templateId: ''
  });
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchHistory();
    fetchTemplates();
  }, [currentPage, pageSize]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', currentPage);
      params.append('limit', pageSize);

      const response = await api.get(`/letters/history?${params.toString()}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data history surat',
        showConfirmButton: true,
        confirmButtonText: 'Coba Lagi'
      }).then((result) => {
        if (result.isConfirmed) {
          fetchHistory();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/letter-templates', {
        params: {
          limit: 100,
          page: 1
        }
      });
      setTemplates(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengambil data template surat'
      });
    }
  };

  const handleDownload = async (letter) => {
    if (downloadingId) return;
    
    try {
      setDownloadingId(letter.id);
      
      const response = await api.get(`/letters/${letter.id}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
  
      // Create blob and URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in new tab
      const newWindow = window.open(url, '_blank');
      
      if (newWindow === null) {
        Swal.fire({
          icon: 'warning',
          title: 'Pop-up Diblokir',
          text: 'Mohon izinkan pop-up untuk melihat surat'
        });
      }
  
      // Cleanup URL after delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
  
    } catch (error) {
      console.error('Error opening letter:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal membuka surat'
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
    fetchHistory();
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchHistory();
    setShowFilter(false);
  };

  const handleResetFilter = () => {
    setFilters(prev => ({
      ...prev,
      startDate: '',
      endDate: '',
      templateId: ''
    }));
    setCurrentPage(1);
    fetchHistory();
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value && key !== 'search'
    ).length;
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
        id: 'date',
        header: 'Tanggal',
        accessorKey: 'created_at',
        size: 150,
        cell: ({ row }) => format(
          new Date(row.original.created_at), 
          'dd MMM yyyy HH:mm', 
          { locale: id }
        ),
      },
      {
        id: 'template',
        header: 'Jenis Surat',
        accessorKey: 'template_name',
        size: 200,
      },
      {
        id: 'nik',
        header: 'NIK',
        accessorKey: 'nik',
        size: 150,
      },
      {
        id: 'name',
        header: 'Nama',
        accessorKey: 'full_name',
        size: 200,
      },
      {
        id: 'printed_by',
        header: 'Dicetak Oleh',
        accessorKey: 'printed_by_name',
        size: 150,
      },
      {
        id: 'actions',
        header: 'Aksi',
        size: 100,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDownload(row.original)}
              disabled={downloadingId === row.original.id}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg
                       text-blue-600 hover:bg-blue-50/50 transition-colors
                       disabled:opacity-50 disabled:cursor-wait`}
              title="Lihat Surat"
            >
              {downloadingId === row.original.id ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>
        ),
      },
    ],
    [currentPage, pageSize, downloadingId]
  );

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">History Surat</h1>
        <div className="w-full sm:w-72">
          <SearchFilter
            value={filters.search}
            onSearch={handleSearch}
            placeholder="Cari NIK atau nama..."
          />
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Button
          variant="secondary"
          onClick={() => setShowFilter(prev => !prev)}
          className="w-full flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-none border-none"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            Filter Lanjutan
          </span>
          <span className="text-xs text-gray-500">
            {getActiveFiltersCount()} filter aktif
          </span>
        </Button>

        {showFilter && (
          <div className="p-4 space-y-4 bg-white border-t">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Jenis Surat
                </label>
                <select
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                            focus:outline-none focus:ring-1 focus:ring-blue-500
                            bg-white text-gray-900"
                  value={filters.templateId}
                  onChange={(e) => setFilters(prev => ({ ...prev, templateId: e.target.value }))}
                >
                  <option value="">Semua Jenis Surat</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                            focus:outline-none focus:ring-1 focus:ring-blue-500
                            bg-white text-gray-900"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                            focus:outline-none focus:ring-1 focus:ring-blue-500
                            bg-white text-gray-900"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={handleResetFilter}
                size="sm"
                className="text-sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                onClick={handleFilter}
                variant="primary"
                size="sm"
                className="text-sm"
              >
                Terapkan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table
          columns={columns}
          data={history.data || []}
          pageCount={history.pagination?.totalPages || 1}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalItems={history.pagination?.totalItems || 0}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default LetterHistory;