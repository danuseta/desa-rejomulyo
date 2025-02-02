const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs').promises;
const path = require('path');

const docProcessor = {
  async processTemplate(templatePath, data) {
    try {
      const content = await fs.readFile(templatePath);
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      });

      // Mengasumsikan village_info bisa datang sebagai nested object atau sebagai properti langsung
      const villageInfo = data.village_info || data;

      const templateData = {
        // Basic Info
        nik: data.nik || '',
        no_kk: data.no_kk || '',
        nama: data.nama || '',
        tempat_lahir: data.tempat_lahir || '',
        tempat_tanggal_lahir: `${data.tempat_lahir}, ${data.tanggal_lahir ? new Date(data.tanggal_lahir).toLocaleDateString('id-ID') : ''}`,
        pekerjaan_orang_tua: data.pekerjaan_orang_tua || '',
        tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir).toLocaleDateString('id-ID') : '',
        umur: data.umur || '',
        
        // Gender dan Status
        jenis_kelamin: data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        status_perkawinan: this.getStatusPerkawinan(data.status_perkawinan),
        
        // Alamat
        dusun: data.dusun || '',
        rt: data.rt || '',
        alamat: `${data.dusun} RT ${data.rt}`,
        
        // Keluarga
        nama_ibu: data.nama_ibu || '',
        nama_ayah: data.nama_ayah || '',
        nama_orang_tua: `${data.nama_ayah} / ${data.nama_ibu}`,
        status_hubungan_keluarga: data.status_hubungan_keluarga || '',
        
        // Info Pribadi
        agama: data.agama || '',
        pendidikan: data.pendidikan || '',
        pekerjaan: data.pekerjaan || '',
        
        // Status Tambahan
        status_mandiri: data.status_mandiri ? 'Ya' : 'Tidak',
        status_pt: data.status_pt ? 'Ya' : 'Tidak',
        status_belum: data.status_belum ? 'Ya' : 'Tidak',
        
        // Timestamps
        created_at: data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID') : '',
        updated_at: data.updated_at ? new Date(data.updated_at).toLocaleDateString('id-ID') : '',
        
        // Nomor Surat
        nomor_surat: data.nomor_surat || '',
        
        // Tanggal Surat
        tanggal_surat: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),

        // Village Info (Uppercase)
        village_name: (villageInfo.village_name || '').toUpperCase(),
        address: villageInfo.address || '',
        district_name: (villageInfo.district_name || '').toUpperCase(),
        regency_name: (villageInfo.regency_name || '').toUpperCase(),
        village_address: (villageInfo.address || '').toUpperCase(),
        village_phone: villageInfo.phone || '',
        village_email: villageInfo.email || '',
        head_name: (villageInfo.head_name || '').toUpperCase(),
        head_position: (villageInfo.head_position || '').toUpperCase(),
        signature_path: villageInfo.signature_path || ''
      };

      // Debug: log village info values
      console.log('Village Info Values:', {
        village_name: templateData.village_name,
        district_name: templateData.district_name,
        regency_name: templateData.regency_name
      });

      doc.render(templateData);

      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
      });

      return buffer;
    } catch (error) {
      console.error('Error processing template:', error);
      
      if (error.properties && error.properties.errors) {
        const errorMessages = error.properties.errors
          .map(error => `Template error: ${error.message}`)
          .join('\n');
        console.error('Detailed template errors:', errorMessages);
      }

      throw new Error('Failed to process document template: ' + error.message);
    }
  },

  getStatusPerkawinan(status) {
    const statusMap = {
      'B': 'Belum Kawin',
      'S': 'Sudah Kawin',
      'P': 'Pernah Kawin'
    };
    return statusMap[status] || status;
  }
};

module.exports = docProcessor;