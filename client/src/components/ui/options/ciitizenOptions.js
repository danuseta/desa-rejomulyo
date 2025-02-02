// src/components/ui/options/citizenOptions.js

// Mapping untuk normalisasi value
const PENDIDIKAN_ALIASES = {
    'TIDAK/BELUM SEKOLAH || TIDAK/BLM SEKOLAH || TDK/BLM SEKOLAH || BLM SEKOLAH || TIDAK SEKOLAH': 'TIDAK/BELUM SEKOLAH',
    'BELUM TAMAT SD/SEDERAJAT || BLM TAMAT SD/SEDERAJAT || BELUM TAMAT SD SEDERAJAT || BLM TAMAT SD SEDERAJAT || TIDAK TAMAT SD': 'BELUM TAMAT SD/SEDERAJAT',
    'TAMAT SD/SEDERAJAT || SD/SEDERAJAT || SD SEDERAJAT || LULUS SD': 'TAMAT SD/SEDERAJAT',
    'SLTP/SEDERAJAT || SLTP SEDERAJAT || SMP/SEDERAJAT || SMP SEDERAJAT || TAMAT SMP': 'SLTP/SEDERAJAT',
    'SLTA/SEDERAJAT || SLTA SEDERAJAT || SMA/SEDERAJAT || SMA SEDERAJAT || TAMAT SMA': 'SLTA/SEDERAJAT',
    'DIPLOMA I/II || D1/D2 || D1 || D2': 'DIPLOMA I/II',
    'AKADEMI/DIPLOMA III/SARJANA MUDA || AKADEMI/DIPLOMA III/S.MUDA || D3/SARJANA MUDA || D3 || DIPLOMA III': 'AKADEMI/DIPLOMA III/SARJANA MUDA',
    'DIPLOMA IV/STRATA I || DIPLOMA IV/STRATA 1 || D4/S1 || S1 || SARJANA || DIPLOMA IV': 'DIPLOMA IV/STRATA I',
    'STRATA II || STRATA 2 || S2 || MAGISTER': 'STRATA II',
    'STRATA III || STRATA 3 || S3 || DOKTOR': 'STRATA III'
  };
  
  const PEKERJAAN_ALIASES = {
    'BELUM/TIDAK BEKERJA || BELUM BEKERJA || TIDAK BEKERJA || BLM BEKERJA || TDK BEKERJA': 'BELUM/TIDAK BEKERJA',
    'MENGURUS RUMAH TANGGA || IBU RUMAH TANGGA || IRT': 'MENGURUS RUMAH TANGGA',
    'PELAJAR/MAHASISWA || PELAJAR || MAHASISWA || SISWA': 'PELAJAR/MAHASISWA',
    'PENSIUNAN || PURNAWIRAWAN': 'PENSIUNAN',
    'PEGAWAI NEGERI SIPIL || PNS || PEGAWAI NEGERI': 'PEGAWAI NEGERI SIPIL',
    'TENTARA NASIONAL INDONESIA || TNI || TENTARA': 'TENTARA NASIONAL INDONESIA',
    'KEPOLISIAN RI || POLRI || POLISI': 'KEPOLISIAN RI',
    'PERDAGANGAN || PEDAGANG || DAGANG': 'PERDAGANGAN',
    'PETANI/PEKEBUN || PETANI || PEKEBUN': 'PETANI/PEKEBUN',
    'PETERNAK || BETERNAK': 'PETERNAK',
    'NELAYAN/PERIKANAN || NELAYAN': 'NELAYAN/PERIKANAN',
    'INDUSTRI || PERINDUSTRIAN': 'INDUSTRI',
    'KONSTRUKSI || PEKERJA KONSTRUKSI': 'KONSTRUKSI',
    'TRANSPORTASI || PENGANGKUTAN': 'TRANSPORTASI',
    'KARYAWAN SWASTA || PEGAWAI SWASTA || KARYAWAN': 'KARYAWAN SWASTA',
    'KARYAWAN BUMN || PEGAWAI BUMN': 'KARYAWAN BUMN',
    'KARYAWAN BUMD || PEGAWAI BUMD': 'KARYAWAN BUMD',
    'KARYAWAN HONORER || HONORER': 'KARYAWAN HONORER',
    'BURUH HARIAN LEPAS || BURUH LEPAS || BURUH HARIAN': 'BURUH HARIAN LEPAS',
    'BURUH TANI/PERKEBUNAN || BURUH TANI || BURUH PERKEBUNAN': 'BURUH TANI/PERKEBUNAN',
    'BURUH NELAYAN/PERIKANAN || BURUH NELAYAN': 'BURUH NELAYAN/PERIKANAN',
    'BURUH PETERNAKAN || BURUH TERNAK': 'BURUH PETERNAKAN',
    'PEMBANTU RUMAH TANGGA || PRT': 'PEMBANTU RUMAH TANGGA',
    'TUKANG CUKUR || TUKANG PANGKAS': 'TUKANG CUKUR',
    'TUKANG LISTRIK || TUKANG ELEKTRONIK': 'TUKANG LISTRIK',
    'TUKANG BATU || TUKANG BANGUNAN': 'TUKANG BATU',
    'TUKANG KAYU || PENGRAJIN KAYU': 'TUKANG KAYU',
    'TUKANG SOL SEPATU || TUKANG SEPATU': 'TUKANG SOL SEPATU',
    'TUKANG LAS/PANDAI BESI || TUKANG LAS || PANDAI BESI': 'TUKANG LAS/PANDAI BESI',
    'TUKANG JAHIT || PENJAHIT': 'TUKANG JAHIT',
    'TUKANG GIGI || AHLI GIGI': 'TUKANG GIGI',
    'PENATA RIAS || TUKANG RIAS || MUA': 'PENATA RIAS',
    'PENATA BUSANA || STYLISH': 'PENATA BUSANA',
    'PENATA RAMBUT || TUKANG RAMBUT': 'PENATA RAMBUT',
    'MEKANIK || MONTIR': 'MEKANIK',
    'SENIMAN || ARTIS || PELUKIS': 'SENIMAN',
    'TABIB || PENGOBATAN ALTERNATIF': 'TABIB',
    'PARAJI || DUKUN BAYI': 'PARAJI',
    'PERANCANG BUSANA || DESIGNER': 'PERANCANG BUSANA',
    'PENTERJEMAH || PENERJEMAH': 'PENTERJEMAH',
    'IMAM MASJID || IMAM': 'IMAM MASJID',
    'PENDETA || PASTOR': 'PENDETA',
    'WARTAWAN || JURNALIS': 'WARTAWAN',
    'USTADZ/MUBALIGH || USTADZ || MUBALIGH || PENCERAMAH': 'USTADZ/MUBALIGH',
    'JURU MASAK || KOKI || CHEF': 'JURU MASAK',
    'PROMOTOR ACARA || EVENT ORGANIZER || EO': 'PROMOTOR ACARA',
    'ANGGOTA DPR-RI || ANGGOTA DPR': 'ANGGOTA DPR-RI',
    'ANGGOTA DPD || ANGGOTA DPRD': 'ANGGOTA DPD',
    'PRESIDEN || WAKIL PRESIDEN': 'PRESIDEN',
    'GUBERNUR || WAKIL GUBERNUR': 'GUBERNUR',
    'BUPATI || WAKIL BUPATI': 'BUPATI',
    'WALIKOTA || WAKIL WALIKOTA': 'WALIKOTA',
    'DOSEN || PENGAJAR': 'DOSEN',
    'GURU || PENGAJAR || TENAGA PENGAJAR': 'GURU',
    'PILOT || PENERBANG': 'PILOT',
    'PENGACARA || ADVOKAT || PENGALAM': 'PENGACARA',
    'NOTARIS || PPAT': 'NOTARIS',
    'ARSITEK || ARSITEKTUR': 'ARSITEK',
    'AKUNTAN || AKUNTING': 'AKUNTAN',
    'KONSULTAN || KONSULTAN PAJAK || KONSULTAN HUKUM': 'KONSULTAN',
    'DOKTER || DOKTER UMUM || DOKTER SPESIALIS': 'DOKTER',
    'BIDAN || TENAGA KESEHATAN': 'BIDAN',
    'PERAWAT || SUSTER': 'PERAWAT',
    'APOTEKER || FARMASI': 'APOTEKER',
    'PSIKIATER/PSIKOLOG || PSIKIATER || PSIKOLOG': 'PSIKIATER/PSIKOLOG',
    'PENYIAR RADIO || PENYIAR': 'PENYIAR RADIO',
    'PELAUT || PELAYAR': 'PELAUT',
    'PENELITI || RISET': 'PENELITI',
    'SOPIR || PENGEMUDI': 'SOPIR',
    'WIRASWASTA || PENGUSAHA || WIRAUSAHA': 'WIRASWASTA'
  };
  
  // Generate mapping dari aliases
  export const PENDIDIKAN_MAPPING = Object.entries(PENDIDIKAN_ALIASES).reduce((acc, [aliases, standardValue]) => {
    aliases.split(' || ').forEach(alias => {
      acc[alias.trim()] = standardValue;
    });
    return acc;
  }, {});
  
  export const PEKERJAAN_MAPPING = Object.entries(PEKERJAAN_ALIASES).reduce((acc, [aliases, standardValue]) => {
    aliases.split(' || ').forEach(alias => {
      acc[alias.trim()] = standardValue;
    });
    return acc;
  }, {});
  
  // Options yang akan ditampilkan di dropdown (hanya nilai standar)
  export const PENDIDIKAN_OPTIONS = [
    { value: 'TIDAK/BELUM SEKOLAH', label: 'Tidak/Belum Sekolah' },
    { value: 'BELUM TAMAT SD/SEDERAJAT', label: 'Belum Tamat SD/Sederajat' },
    { value: 'TAMAT SD/SEDERAJAT', label: 'Tamat SD/Sederajat' },
    { value: 'SLTP/SEDERAJAT', label: 'SLTP/Sederajat' },
    { value: 'SLTA/SEDERAJAT', label: 'SLTA/Sederajat' },
    { value: 'DIPLOMA I/II', label: 'Diploma I/II' },
    { value: 'AKADEMI/DIPLOMA III/SARJANA MUDA', label: 'Akademi/Diploma III/Sarjana Muda' },
    { value: 'DIPLOMA IV/STRATA I', label: 'Diploma IV/Strata I' },
    { value: 'STRATA II', label: 'Strata II' },
    { value: 'STRATA III', label: 'Strata III' }
  ];
  
  // Helper function untuk mendapatkan normalized value
  export function getNormalizedValue(type, value) {
    if (!value) return value;
    
    // Ubah ke uppercase dan hilangkan spasi berlebih
    const normalizedValue = value.toUpperCase().trim();
    
    const mapping = type === 'pendidikan' ? PENDIDIKAN_MAPPING : PEKERJAAN_MAPPING;
    return mapping[normalizedValue] || normalizedValue;
  }
  
  // Helper function untuk mendapatkan label dari value
  export function getOptionLabel(type, value) {
    if (!value) return '';
    
    // Normalize value terlebih dahulu
    const normalizedValue = getNormalizedValue(type, value);
    
    const options = type === 'pendidikan' ? PENDIDIKAN_OPTIONS : PEKERJAAN_OPTIONS;
    const option = options.find(opt => opt.value === normalizedValue);
    
    if (option) {
      return option.label;
    }
    
    // Jika tidak ditemukan di options, convert ke Title Case
    return normalizedValue.split('/')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('/');
  }
  
  // Helper function untuk validasi value
  export function isValidValue(type, value) {
    if (!value) return false;
    
    const normalizedValue = getNormalizedValue(type, value);
    const options = type === 'pendidikan' ? PENDIDIKAN_OPTIONS : PEKERJAAN_OPTIONS;
    return options.some(opt => opt.value === normalizedValue);
  }
  
  export const PEKERJAAN_OPTIONS = [
    { value: 'BELUM/TIDAK BEKERJA', label: 'Belum/Tidak Bekerja' },
    { value: 'MENGURUS RUMAH TANGGA', label: 'Mengurus Rumah Tangga' },
    { value: 'PELAJAR/MAHASISWA', label: 'Pelajar/Mahasiswa' },
    { value: 'PENSIUNAN', label: 'Pensiunan' },
    { value: 'PEGAWAI NEGERI SIPIL', label: 'Pegawai Negeri Sipil' },
    { value: 'TENTARA NASIONAL INDONESIA', label: 'Tentara Nasional Indonesia' },
    { value: 'KEPOLISIAN RI', label: 'Kepolisian RI' },
    { value: 'PERDAGANGAN', label: 'Perdagangan' },
    { value: 'PETANI/PEKEBUN', label: 'Petani/Pekebun' },
    { value: 'PETERNAK', label: 'Peternak' },
    { value: 'NELAYAN/PERIKANAN', label: 'Nelayan/Perikanan' },
    { value: 'INDUSTRI', label: 'Industri' },
    { value: 'KONSTRUKSI', label: 'Konstruksi' },
    { value: 'TRANSPORTASI', label: 'Transportasi' },
    { value: 'KARYAWAN SWASTA', label: 'Karyawan Swasta' },
    { value: 'KARYAWAN BUMN', label: 'Karyawan BUMN' },
    { value: 'KARYAWAN BUMD', label: 'Karyawan BUMD' },
    { value: 'KARYAWAN HONORER', label: 'Karyawan Honorer' },
    { value: 'BURUH HARIAN LEPAS', label: 'Buruh Harian Lepas' },
    { value: 'BURUH TANI/PERKEBUNAN', label: 'Buruh Tani/Perkebunan' },
    { value: 'BURUH NELAYAN/PERIKANAN', label: 'Buruh Nelayan/Perikanan' },
    { value: 'BURUH PETERNAKAN', label: 'Buruh Peternakan' },
    { value: 'PEMBANTU RUMAH TANGGA', label: 'Pembantu Rumah Tangga' },
    { value: 'TUKANG CUKUR', label: 'Tukang Cukur' },
    { value: 'TUKANG LISTRIK', label: 'Tukang Listrik' },
    { value: 'TUKANG BATU', label: 'Tukang Batu' },
    { value: 'TUKANG KAYU', label: 'Tukang Kayu' },
    { value: 'TUKANG SOL SEPATU', label: 'Tukang Sol Sepatu' },
    { value: 'TUKANG LAS/PANDAI BESI', label: 'Tukang Las/Pandai Besi' },
    { value: 'TUKANG JAHIT', label: 'Tukang Jahit' },
    { value: 'TUKANG GIGI', label: 'Tukang Gigi' },
    { value: 'PENATA RIAS', label: 'Penata Rias' },
    { value: 'PENATA BUSANA', label: 'Penata Busana' },
    { value: 'PENATA RAMBUT', label: 'Penata Rambut' },
    { value: 'MEKANIK', label: 'Mekanik' },
    { value: 'SENIMAN', label: 'Seniman' },
    { value: 'TABIB', label: 'Tabib' },
    { value: 'PARAJI', label: 'Paraji' },
    { value: 'PERANCANG BUSANA', label: 'Perancang Busana' },
    { value: 'PENTERJEMAH', label: 'Penterjemah' },
    { value: 'IMAM MASJID', label: 'Imam Masjid' },
    { value: 'PENDETA', label: 'Pendeta' },
    { value: 'WARTAWAN', label: 'Wartawan' },
    { value: 'USTADZ/MUBALIGH', label: 'Ustadz/Mubaligh' },
    { value: 'JURU MASAK', label: 'Juru Masak' },
    { value: 'PROMOTOR ACARA', label: 'Promotor Acara' },
    { value: 'ANGGOTA DPR-RI', label: 'Anggota DPR-RI' },
    { value: 'ANGGOTA DPD', label: 'Anggota DPD' },
    { value: 'PRESIDEN', label: 'Presiden' },
    { value: 'GUBERNUR', label: 'Gubernur' },
    { value: 'BUPATI', label: 'Bupati' },
    { value: 'WALIKOTA', label: 'Walikota' },
    { value: 'DOSEN', label: 'Dosen' },
    { value: 'GURU', label: 'Guru' },
    { value: 'PILOT', label: 'Pilot' },
    { value: 'PENGACARA', label: 'Pengacara' },
    { value: 'NOTARIS', label: 'Notaris' },
    { value: 'ARSITEK', label: 'Arsitek' },
    { value: 'AKUNTAN', label: 'Akuntan' },
    { value: 'KONSULTAN', label: 'Konsultan' },
    { value: 'DOKTER', label: 'Dokter' },
    { value: 'BIDAN', label: 'Bidan' },
    { value: 'PERAWAT', label: 'Perawat' },
    { value: 'APOTEKER', label: 'Apoteker' },
    { value: 'PSIKIATER/PSIKOLOG', label: 'Psikiater/Psikolog' },
    { value: 'PENYIAR RADIO', label: 'Penyiar Radio' },
    { value: 'PELAUT', label: 'Pelaut' },
    { value: 'PENELITI', label: 'Peneliti' },
    { value: 'SOPIR', label: 'Sopir' },
    { value: 'WIRASWASTA', label: 'Wiraswasta' }
  ];