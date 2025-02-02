const XLSX = require('xlsx');
const path = require('path');

const parseExcel = async (filePath) => {
    try {
      console.log('Reading Excel file from:', filePath);
      const workbook = XLSX.readFile(filePath, {
        cellDates: true,  // Ini akan mengkonversi Excel date ke JS Date
        dateNF: 'dd/mm/yyyy'
      });
  
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Pastikan date diproses sebagai date objects
      const data = XLSX.utils.sheet_to_json(worksheet, {
        cellDates: true,
        raw: false
      });
      
      const processedData = data.map((row, index) => {
        try {
          // Tangani tanggal dari Excel
          let tanggal_lahir = null;
          const rawDate = row['Tanggal Lahir'];
          
          if (rawDate) {
            // Jika rawDate adalah Date object (dari Excel date)
            if (rawDate instanceof Date) {
              const day = String(rawDate.getDate()).padStart(2, '0');
              const month = String(rawDate.getMonth() + 1).padStart(2, '0');
              const year = rawDate.getFullYear();
              tanggal_lahir = `${year}-${month}-${day}`; // Langsung format YYYY-MM-DD untuk database
            }
            // Jika dalam format string DD/MM/YYYY
            else if (typeof rawDate === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
              const [day, month, year] = rawDate.split('/');
              tanggal_lahir = `${year}-${month}-${day}`; // Konversi ke YYYY-MM-DD
            }
            // Jika serial number Excel
            else if (typeof rawDate === 'number') {
              const dateObj = XLSX.SSF.parse_date_code(rawDate);
              tanggal_lahir = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
            }
          }

          console.log(`Row ${index + 1} date processing:`, {
            raw: rawDate,
            type: typeof rawDate,
            isDate: rawDate instanceof Date,
            processed: tanggal_lahir
          });

          return {
            no_kk: String(row['No KK'] || '').trim(),
            nik: String(row['NIK'] || '').trim(),
            nama: String(row['Nama Lengkap'] || '').trim(),
            tempat_lahir: String(row['Tempat Lahir'] || '').trim(),
            tanggal_lahir: tanggal_lahir, // Sudah dalam format YYYY-MM-DD
            status_perkawinan: String(row['Status Perkawinan (B/S/P)'] || '').trim(),
            jenis_kelamin: String(row['Jenis Kelamin (L/P)'] || '').trim(),
            dusun: String(row['Dusun'] || '').trim(),
            rt: String(row['RT'] || '').trim(),
            nama_ibu: String(row['Nama Ibu Kandung'] || '').trim(),
            nama_ayah: String(row['Nama Ayah Kandung'] || '').trim(),
            status_hubungan_keluarga: String(row['Status Hubungan Keluarga'] || '').trim(),
            agama: String(row['Agama'] || '').trim(),
            pendidikan: String(row['Pendidikan'] || '').trim(),
            pekerjaan: String(row['Pekerjaan'] || '').trim(),
            status_mandiri: row['Status Mandiri'] === 'Ya',
            status_pt: row['Status PT'] === 'Ya',
            status_belum: row['Status Belum'] === 'Ya'
          };
        } catch (error) {
          console.error(`Error processing row ${index + 1}:`, error);
          throw error;
        }
      });
  
      return processedData;
    } catch (error) {
      console.error('Error in parseExcel:', error);
      throw new Error(`Error processing Excel file: ${error.message}`);
    }
};

const createTemplate = () => {
  // Buat workbook baru
  const workbook = XLSX.utils.book_new();

  // Definisi header dan metadata
  const headers = [
    { header: 'No KK', width: 20, note: '16 digit angka' },
    { header: 'NIK', width: 20, note: '16 digit angka' },
    { header: 'Nama Lengkap', width: 30 },
    { header: 'Tempat Lahir', width: 25 },
    { header: 'Tanggal Lahir', width: 15, note: 'Format: DD/MM/YYYY' },
    { header: 'Status Perkawinan (B/S/P)', width: 25, note: 'B=Belum, S=Sudah, P=Pernah' },
    { header: 'Jenis Kelamin (L/P)', width: 20, note: 'L=Laki-laki, P=Perempuan' },
    { header: 'Dusun', width: 20, note: 'DUSUN 001/002/003/004' },
    { header: 'RT', width: 10, note: 'Nomor RT' },
    { header: 'Nama Ibu Kandung', width: 30 },
    { header: 'Nama Ayah Kandung', width: 30 },
    { header: 'Status Hubungan Keluarga', width: 25, 
      note: 'KEPALA KELUARGA/ISTRI/ANAK/CUCU/ORANG TUA/MERTUA/FAMILI LAIN' },
    { header: 'Agama', width: 15, 
      note: 'ISLAM/KRISTEN/KATOLIK/HINDU/BUDDHA/KONGHUCU' },
    { header: 'Pendidikan', width: 20, 
      note: 'TIDAK SEKOLAH/SD/SLTP/SLTA/DIPLOMA/SARJANA/PASCASARJANA' },
    { header: 'Pekerjaan', width: 25 },
    { header: 'Status Mandiri', width: 15, note: 'Ya/Tidak' },
    { header: 'Status PT', width: 15, note: 'Ya/Tidak' },
    { header: 'Status Belum', width: 15, note: 'Ya/Tidak' }
  ];

  // Buat worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers.map(h => h.header)]);

  // Set lebar kolom
  const colWidths = {};
  headers.forEach((h, i) => {
    colWidths[XLSX.utils.encode_col(i)] = { width: h.width };
  });
  worksheet['!cols'] = Object.values(colWidths);

  // Tambah catatan pada sel header
  headers.forEach((h, i) => {
    if (h.note) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!worksheet[cellRef].c) worksheet[cellRef].c = [];
      worksheet[cellRef].c.push({ t: h.note, a: "Panduan Pengisian:" });
    }
  });

  // Tambah contoh data
  const sampleData = [
    {
      'No KK': '3522251234567890',
      'NIK': '3522251234567891',
      'Nama Lengkap': 'BUDI SANTOSO',
      'Tempat Lahir': 'SURABAYA',
      'Tanggal Lahir': '01/01/1990',
      'Status Perkawinan (B/S/P)': 'S',
      'Jenis Kelamin (L/P)': 'L',
      'Dusun': 'DUSUN 001',
      'RT': '001',
      'Nama Ibu Kandung': 'SITI AMINAH',
      'Nama Ayah Kandung': 'ABDUL RAHMAN',
      'Status Hubungan Keluarga': 'KEPALA KELUARGA',
      'Agama': 'ISLAM',
      'Pendidikan': 'SLTA',
      'Pekerjaan': 'WIRASWASTA',
      'Status Mandiri': 'Ya',
      'Status PT': 'Tidak',
      'Status Belum': 'Tidak'
    }
  ];

  XLSX.utils.sheet_add_json(worksheet, sampleData, { 
    origin: 'A2',
    skipHeader: true
  });

  // Tambah worksheet ke workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');

  // Buat sheet panduan
  const guideHeaders = ['Kolom', 'Keterangan', 'Contoh/Pilihan Valid'];
  const guideData = headers.map(h => [
    h.header,
    h.note || 'Isi sesuai data',
    h.header === 'No KK' ? '3522251234567890' :
    h.header === 'NIK' ? '3522251234567891' :
    h.note || '-'
  ]);

  const guideWorksheet = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideData]);
  XLSX.utils.book_append_sheet(workbook, guideWorksheet, 'Panduan');

  // Simpan template
  const templatePath = path.join(__dirname, '../templates/citizen_import_template.xlsx');
  XLSX.writeFile(workbook, templatePath);
  
  return templatePath;
};

module.exports = {
  parseExcel,
  createTemplate
};