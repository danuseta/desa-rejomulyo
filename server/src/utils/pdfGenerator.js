const fs = require('fs').promises;
const path = require('path');
const docProcessor = require('./docProcessor');
const libre = require('libreoffice-convert');
const util = require('util');
const libreConvert = util.promisify(libre.convert);
const mammoth = require('mammoth'); // Tetap gunakan mammoth untuk preview HTML

const pdfGenerator = {
    async generatePreview(template, citizen, villageInfo) {  // Tambah parameter villageInfo
        try {
            const docBuffer = await docProcessor.processTemplate(
                path.join(__dirname, '../..', template.template_path), 
                {
                    ...citizen,
                    village_info: villageInfo  // Tambah village_info ke data
                }
            );
    
            const extOut = '.pdf';
            const pdfBuffer = await libreConvert(docBuffer, extOut, undefined);
            
            return `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
        } catch (error) {
            console.error('Preview generation error:', error);
            throw new Error('Failed to generate preview');
        }
    },
    
    async generatePDF(template, citizen, villageInfo) {  // Tambah parameter villageInfo
        try {
            // Generate docx terlebih dahulu
            const docBuffer = await docProcessor.processTemplate(
                path.join(__dirname, '../..', template.template_path),
                {
                    ...citizen,
                    village_info: villageInfo  // Tambah village_info ke data
                }
            );

            // Set format yang diinginkan
            const extOut = '.pdf';
            
            // Konversi ke PDF menggunakan libreoffice-convert
            const pdfBuffer = await libreConvert(docBuffer, extOut, undefined);

            return pdfBuffer;

        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error('Failed to generate PDF: ' + error.message);
        }
    }
};

module.exports = pdfGenerator;