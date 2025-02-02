import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const Table = ({
  columns,
  data = [],
  pageSize: initialPageSize = 10,
  onPageSizeChange,
  currentPage = 1,
  onPageChange,
  pageCount: controlledPageCount = 1,
  totalItems = 0,
  isLoading = false,
}) => {
  const pageSizeOptions = [5, 10, 20, 30, 50];

  const table = useReactTable({
    data,
    columns,
    pageCount: controlledPageCount,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: initialPageSize,
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
  });

  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      className="group px-6 py-3.5 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider select-none"
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        cursor: canSort ? 'pointer' : 'default'
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <div className="flex flex-col">
                            <ChevronUpIcon 
                              className={`h-3 w-3 ${
                                header.column.getIsSorted() === 'asc'
                                  ? 'text-blue-600'
                                  : 'text-gray-400'
                              }`}
                            />
                            <ChevronDownIcon 
                              className={`h-3 w-3 -mt-1 ${
                                header.column.getIsSorted() === 'desc'
                                  ? 'text-blue-600'
                                  : 'text-gray-400'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="hover:bg-blue-50/50 transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
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
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <select
              value={initialPageSize}
              onChange={e => {
                const newSize = Number(e.target.value);
                if (onPageSizeChange) {
                  onPageSizeChange(newSize);
                }
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} baris per halaman
                </option>
              ))}
            </select>

            <span className="text-sm text-gray-700">
              <span className="font-medium">{((currentPage - 1) * initialPageSize) + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(currentPage * initialPageSize, totalItems)}
              </span>
              {' '}dari{' '}
              <span className="font-medium">{totalItems}</span> data
            </span>
          </div>

          <div className="flex gap-1.5">
            <Button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
              className="px-2"
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
              className="px-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              {currentPage}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === controlledPageCount}
              variant="secondary"
              size="sm"
              className="px-2"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handlePageChange(controlledPageCount)}
              disabled={currentPage === controlledPageCount}
              variant="secondary"
              size="sm"
              className="px-2"
            >
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;