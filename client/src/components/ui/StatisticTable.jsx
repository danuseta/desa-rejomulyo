import React from 'react';

const StatisticTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th rowSpan="2" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
              KRITERIA
            </th>
            {data.dusun.map((dusun, idx) => (
              <th key={idx} colSpan="3" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {dusun}
              </th>
            ))}
            <th colSpan="3" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
              TOTAL
            </th>
          </tr>
          <tr>
            {[...data.dusun, 'TOTAL'].map((_, idx) => (
              <React.Fragment key={idx}>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">L</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">P</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">JML</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row, idx) => (
            <tr key={idx} className={row.isTotal ? 'bg-gray-50 font-medium' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border">
                {row.kriteria}
              </td>
              {row.values.map((val, valIdx) => (
                <React.Fragment key={valIdx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border">{val.L}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border">{val.P}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border">{val.JML}</td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatisticTable;