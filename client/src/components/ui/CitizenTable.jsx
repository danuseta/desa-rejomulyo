import React from 'react';
import { Link } from 'react-router-dom';
import Table from './Table';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';

const CitizenTable = ({ data, onDelete }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const columns = React.useMemo(
    () => [
      {
        Header: 'No KK',
        accessor: 'no_kk',
      },
      {
        Header: 'NIK',
        accessor: 'nik',
      },
      {
        Header: 'Nama',
        accessor: 'nama',
      },
      {
        Header: 'TTL',
        accessor: (row) => (
          `${row.tempat_lahir}, ${new Date(row.tanggal_lahir).toLocaleDateString('id-ID')}`
        ),
      },
      {
        Header: 'Alamat',
        accessor: (row) => (
          `Dusun ${row.dusun} RT ${row.rt}`
        ),
      },
      {
        Header: 'Status',
        accessor: 'status_perkawinan',
        Cell: ({ value }) => {
          const status = {
            'B': 'Belum Kawin',
            'S': 'Sudah Kawin',
            'P': 'Pernah Kawin'
          };
          return status[value] || value;
        }
      },
      {
        Header: 'Jenis Kelamin',
        accessor: 'jenis_kelamin',
        Cell: ({ value }) => value === 'L' ? 'Laki-laki' : 'Perempuan'
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link to={`/admin/citizens/${row.original.id}`}>
              <Button size="sm" variant="secondary">
                Detail
              </Button>
            </Link>
            {isSuperAdmin && (
              <>
                <Link to={`/admin/citizens/edit/${row.original.id}`}>
                  <Button size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(row.original.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [onDelete, isSuperAdmin]
  );

  return <Table columns={columns} data={data} />;
};

export default CitizenTable;