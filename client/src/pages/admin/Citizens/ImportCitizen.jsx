import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import Button from '../../../components/ui/Button';
import ImportPreview from '../../../components/ui/ImportPreview';
import api from '../../../utils/api';
import { ArrowLeft, FileSpreadsheet, Upload } from 'lucide-react';

const ImportCitizen = () => {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { 
          type: 'array',
          cellDates: true,
          raw: true,
          dateNF: 'yyyy-mm-dd'
        });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
          cellDates: true
        });
        
        console.log('Raw Excel data:', data[0]);
        
        const processedData = processExcel(data);
        
        console.log('Processed data:', processedData[0]);
        
        // Validasi data dan kumpulkan warning
        const warnings = [];
        processedData.forEach((row, index) => {
          if (!row.no_kk || row.no_kk.length !== 16) {
            warnings.push(`Baris ${index + 1}: Nomor KK harus 16 digit`);
          }
          if (!row.nik || row.nik.length !== 16) {
            warnings.push(`Baris ${index + 1}: NIK harus 16 digit`);
          }
          if (!row.nama || row.nama.length < 3) {
            warnings.push(`Baris ${index + 1}: Nama minimal 3 karakter`);
          }
          if (!row.status_perkawinan || !['B', 'S', 'P'].includes(row.status_perkawinan)) {
            warnings.push(`Baris ${index + 1}: Status perkawinan harus B/S/P`);
          }
          if (!row.jenis_kelamin || !['L', 'P'].includes(row.jenis_kelamin)) {
            warnings.push(`Baris ${index + 1}: Jenis kelamin harus L/P`);
          }
          if (!row.rt) {
            warnings.push(`Baris ${index + 1}: RT harus diisi`);
          }
          if (!row.tanggal_lahir) {
            warnings.push(`Baris ${index + 1}: Tanggal lahir harus diisi`);
          }
        });

        setWarnings(warnings);
        setPreviewData(processedData);

        // Tampilkan warning jika ada, tapi tetap lanjut
        if (warnings.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Peringatan Data',
            html: `
              <div class="text-left">
                <p class="mb-2">Ditemukan beberapa data yang tidak sesuai format:</p>
                <div class="max-h-60 overflow-y-auto">
                  ${warnings.join('<br>')}
                </div>
                <p class="mt-2 text-sm">Data tetap dapat diimport, namun mohon periksa kembali kebenarannya.</p>
              </div>
            `,
            confirmButtonText: 'Lanjutkan'
          });
        }

      } catch (error) {
        console.error('Error reading Excel:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal membaca file Excel: ' + error.message
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processExcel = (data) => {
    return data.map(row => {
      let tanggalLahir = row['Tanggal Lahir'];
      
      console.log('Processing date:', {
        original: tanggalLahir,
        type: typeof tanggalLahir,
        isDate: tanggalLahir instanceof Date
      });
      
      if (tanggalLahir instanceof Date) {
        const year = tanggalLahir.getFullYear();
        const month = String(tanggalLahir.getMonth() + 1).padStart(2, '0');
        const day = String(tanggalLahir.getDate()).padStart(2, '0');
        tanggalLahir = `${year}-${month}-${day}`;
      }
      
      let dusun = String(row['Dusun'] || '').trim().toUpperCase();
      if (dusun && !dusun.startsWith('DUSUN')) {
        dusun = `DUSUN ${dusun.padStart(3, '0')}`;
      }

      return {
        no_kk: String(row['No KK'] || '').trim(),
        nik: String(row['NIK'] || '').trim(),
        nama: String(row['Nama Lengkap'] || '').trim().toUpperCase(),
        tempat_lahir: String(row['Tempat Lahir'] || '').trim().toUpperCase(),
        tanggal_lahir: tanggalLahir,
        status_perkawinan: String(row['Status Perkawinan (B/S/P)'] || '').trim().toUpperCase(),
        jenis_kelamin: String(row['Jenis Kelamin (L/P)'] || '').trim().toUpperCase(),
        dusun: dusun,
        rt: String(row['RT'] || '').trim().padStart(3, '0'),
        nama_ibu: String(row['Nama Ibu Kandung'] || '').trim().toUpperCase(),
        nama_ayah: String(row['Nama Ayah Kandung'] || '').trim().toUpperCase(),
        status_hubungan_keluarga: String(row['Status Hubungan Keluarga'] || '').trim().toUpperCase(),
        agama: String(row['Agama'] || '').trim().toUpperCase(),
        pendidikan: String(row['Pendidikan'] || '').trim().toUpperCase(),
        pekerjaan: String(row['Pekerjaan'] || '').trim().toUpperCase(),
        status_mandiri: row['Status Mandiri']?.toUpperCase() === 'YA',
        status_pt: row['Status PT']?.toUpperCase() === 'YA',
        status_belum: row['Status Belum']?.toUpperCase() === 'YA'
      };
    });
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Jika ada warnings, tampilkan konfirmasi terlebih dahulu
      if (warnings.length > 0) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Konfirmasi Import',
          html: `
            <div class="text-left">
              <p>Terdapat ${warnings.length} peringatan pada data. Apakah Anda yakin ingin melanjutkan import?</p>
              <p class="text-sm text-gray-500 mt-2">Data yang tidak sesuai format mungkin tidak akan tersimpan dengan benar.</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Ya, Import',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        });

        if (!result.isConfirmed) {
          setLoading(false);
          return;
        }
      }
      
      const response = await api.post('/citizens/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Data berhasil diimport'
      });
      navigate('/admin/citizens');
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || 'Gagal import data';
      const errorDetails = error.response?.data?.errors;
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: errorDetails ? errorDetails.join('<br>') : errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/citizens/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_import_penduduk.xlsx');
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download template error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mendownload template'
      });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Import Data Penduduk</h1>
            <p className="text-sm text-gray-500 mt-0.5">Import data penduduk menggunakan file Excel</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {!previewData ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Download Template Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                  Template Excel
                </h2>
                <p className="text-sm text-gray-500">
                  Download template untuk memastikan format data yang sesuai
                </p>
              </div>
              <Button
                onClick={handleDownloadTemplate}
                variant="secondary"
                className="w-full md:w-auto"
              >
                Download Template
              </Button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Upload File
              </h2>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    transition-all cursor-pointer
                  "
                />
                <p className="mt-2 text-sm text-gray-500">
                  Format yang didukung: .xlsx, .xls
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ImportPreview
            data={previewData}
            onConfirm={handleConfirmImport}
            onCancel={() => {
              setPreviewData(null);
              setFile(null);
              setWarnings([]);
            }}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default ImportCitizen;