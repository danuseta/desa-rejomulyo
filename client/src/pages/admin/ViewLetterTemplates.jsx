import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const ViewLetterTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/letter-templates');
      setTemplates(response.data);
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

  const columns = React.useMemo(
    () => [
      {
        Header: 'Nama Template',
        accessor: 'name',
      },
      {
        Header: 'Logo',
        accessor: 'logo_path',
        Cell: ({ value }) => value ? (
          <img 
            src={`${import.meta.env.VITE_API_URL}${value}`}
            alt="Logo"
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span className="text-gray-400">Tidak ada logo</span>
        ),
      },
      {
        Header: 'Terakhir Diupdate',
        accessor: 'updated_at',
        Cell: ({ value }) => new Date(value).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      }
    ],
    []
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Template Surat</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={templates}
          loading={loading}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default ViewLetterTemplates;