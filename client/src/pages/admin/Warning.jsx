// src/pages/admin/Warning.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Table from '../../components/ui/Table';
import SearchFilter from '../../components/ui/SearchFilter';
import api from '../../utils/api';
import debounce from 'lodash/debounce';

const Warning = () => {
    const [warningData, setWarningData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();

    const columns = [
        {
            header: 'No',
            cell: ({ row }) => {
                return <div className="text-center">{row.index + 1 + (page - 1) * pageSize}</div>;
            },
            size: 70,
        },
        {
            header: 'Nama',
            accessorKey: 'nama',
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">{row.original.nama}</div>
            ),
            size: 200,
        },
        {
            header: 'NIK',
            accessorKey: 'nik',
            size: 160,
        },
        {
            header: 'Alamat',
            accessorKey: 'dusun',
            cell: ({ row }) => (
                <div className="whitespace-nowrap">{`${row.original.dusun}, RT ${row.original.rt}`}</div>
            ),
            size: 180,
        },
        {
            header: 'Warning',
            accessorKey: 'all_warnings',
            cell: ({ row }) => (
                <div className="min-w-[300px] max-w-[400px] overflow-x-auto">
                    <div className="inline-flex flex-wrap gap-1 py-2">
                        {row.original.all_warnings.split(', ').map((warning, index) => (
                            <span 
                                key={index} 
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 whitespace-nowrap"
                            >
                                {warning}
                            </span>
                        ))}
                    </div>
                </div>
            ),
            size: 400,
        },
        {
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="whitespace-nowrap text-center">
                    <button
                        onClick={() => navigate(`/admin/citizens/${row.original.id}`)}
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Lihat Detail
                    </button>
                </div>
            ),
            size: 120,
        },
    ];

    useEffect(() => {
        fetchWarningData();
    }, [page, pageSize, searchTerm]);

    const fetchWarningData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/citizens/warning/data', {
                params: {
                    page,
                    limit: pageSize,
                    search: searchTerm
                }
            });

            setWarningData(response.data.data);
            setTotalItems(response.data.pagination.total);
        } catch (error) {
            console.error('Error fetching warning data:', error);
            setError('Gagal memuat data warning');
        } finally {
            setLoading(false);
        }
    };

    // Debounce search function
    const debouncedSearch = debounce((value) => {
        setSearchTerm(value);
        setPage(1); // Reset page when searching
    }, 
);

    const handleSearch = (value) => {
        debouncedSearch(value);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setPage(1);
        fetchWarningData();
    };

    if (error) {
        return (
            <div className="min-h-[40vh] flex flex-col items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Terjadi Kesalahan</h3>
                    <p className="mt-1 text-sm text-gray-500">{error}</p>
                    <div className="mt-6">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Warning</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Total {totalItems} data memerlukan perhatian
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <SearchFilter
                        value={searchTerm}
                        onSearch={handleSearch}
                        placeholder="Cari berdasarkan nama/nik..."
                        className="w-full sm:w-72"
                    />
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-50"
                        title="Refresh Data"
                    >
                        <svg 
                            className="h-5 w-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Halaman ini menampilkan daftar penduduk yang memiliki data tidak lengkap.
                            Klik "Lihat Detail" untuk melengkapi data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table
                    columns={columns}
                    data={warningData}
                    isLoading={loading}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    currentPage={page}
                    onPageChange={setPage}
                    pageCount={Math.ceil(totalItems / pageSize)}
                    totalItems={totalItems}
                />
            </div>
        </div>
    );
};

export default Warning;