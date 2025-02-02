import React, { useState } from 'react';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ImportPreview = ({ data, onConfirm, onCancel, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return dateString || '-';
  };

  const columns = [
    { header: 'No KK', key: 'no_kk' },
    { header: 'NIK', key: 'nik' },
    { header: 'Nama', key: 'nama' },
    { header: 'Tempat Lahir', key: 'tempat_lahir' },
    { header: 'Tanggal Lahir', key: 'tanggal_lahir', format: formatDate },
    { 
      header: 'Status', 
      key: 'status_perkawinan',
      format: value => {
        const status = {
          'B': 'Belum Kawin',
          'S': 'Sudah Kawin',
          'P': 'Pernah Kawin'
        };
        return status[value] || value || '-';
      }
    },
    { 
      header: 'JK', 
      key: 'jenis_kelamin',
      format: value => {
        const gender = {
          'L': 'Laki-laki',
          'P': 'Perempuan'
        };
        return gender[value] || value || '-';
      }
    },
    { header: 'Dusun', key: 'dusun' },
    { header: 'RT', key: 'rt' },
    { header: 'Nama Ibu', key: 'nama_ibu' },
    { header: 'Nama Ayah', key: 'nama_ayah' },
    { header: 'Status Hub. Keluarga', key: 'status_hubungan_keluarga' },
    { header: 'Agama', key: 'agama' },
    { header: 'Pendidikan', key: 'pendidikan' },
    { header: 'Pekerjaan', key: 'pekerjaan' },
    { 
      header: 'Status Mandiri', 
      key: 'status_mandiri',
      format: value => value ? 'Ya' : 'Tidak'
    },
    { 
      header: 'Status PT', 
      key: 'status_pt',
      format: value => value ? 'Ya' : 'Tidak'
    },
    { 
      header: 'Status Belum', 
      key: 'status_belum',
      format: value => value ? 'Ya' : 'Tidak'
    }
  ];

  // Menghitung data untuk halaman saat ini
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data?.slice(startIndex, endIndex) || [];
  const totalPages = Math.ceil((data?.length || 0) / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="w-full">
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-medium text-yellow-800">Periksa data dengan teliti</h3>
          <p className="text-sm text-yellow-700">
            Pastikan semua data sudah sesuai sebelum melakukan import.
            Data yang sudah diimport tidak dapat dibatalkan.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Preview Data Import
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {data?.length || 0} data akan diimport
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                    >
                      {column.format 
                        ? column.format(row[column.key])
                        : row[column.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-sm text-center text-gray-500"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {[5, 10, 20, 30, 50].map(size => (
                  <option key={size} value={size}>
                    {size} baris per halaman
                  </option>
                ))}
              </select>

              <span className="text-sm text-gray-700">
                <span className="font-medium">{startIndex + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(endIndex, data?.length || 0)}
                </span>
                {' '}dari{' '}
                <span className="font-medium">{data?.length || 0}</span> data
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                {'<<'}
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                {'<'}
              </Button>
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                {currentPage}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
              >
                {'>'}
              </Button>
              <Button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
              >
                {'>>'}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              Konfirmasi Import
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPreview;