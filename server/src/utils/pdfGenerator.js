const fs = require('fs').promises;
const path = require('path');
const docProcessor = require('./docProcessor');
const axios = require('axios');
const FormData = require('form-data');

const ZAMZAR_API_KEY = process.env.ZAMZAR_API_KEY;
const ZAMZAR_ENDPOINT = 'https://api.zamzar.com/v1';

const pdfGenerator = {
    async generatePreview(template, citizen, villageInfo) {
        try {
            const docBuffer = await docProcessor.processTemplate(
                path.join(__dirname, '../..', template.template_path),
                {
                    ...citizen,
                    village_info: villageInfo
                }
            );

            const formData = new FormData();
            formData.append('source_file', docBuffer, {
                filename: 'document.docx',
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            formData.append('target_format', 'pdf');

            const conversionResponse = await axios.post(`${ZAMZAR_ENDPOINT}/jobs`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const jobId = conversionResponse.data.id;

            let isCompleted = false;
            let attempts = 0;
            const maxAttempts = 10;
            let lastJobStatus = null;

            while (!isCompleted && attempts < maxAttempts) {
                const statusResponse = await axios.get(`${ZAMZAR_ENDPOINT}/jobs/${jobId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                    }
                });
                
                lastJobStatus = statusResponse.data;

                if (lastJobStatus.status === 'successful') {
                    isCompleted = true;
                } else if (lastJobStatus.status === 'failed') {
                    throw new Error('Conversion failed');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000)); 
                    attempts++;
                }
            }

            if (!isCompleted) {
                throw new Error('Conversion timeout');
            }

            const fileId = lastJobStatus.target_files[0].id;

            const downloadResponse = await axios.get(`${ZAMZAR_ENDPOINT}/files/${fileId}/content`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                },
                responseType: 'arraybuffer'
            });

            await axios.delete(`${ZAMZAR_ENDPOINT}/files/${fileId}`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                }
            });

            return `data:application/pdf;base64,${Buffer.from(downloadResponse.data).toString('base64')}`;

        } catch (error) {
            console.error('Preview generation error:', error.response?.data || error);
            throw new Error('Failed to generate preview');
        }
    },

    async generatePDF(template, citizen, villageInfo) {
        try {
            const docBuffer = await docProcessor.processTemplate(
                path.join(__dirname, '../..', template.template_path),
                {
                    ...citizen,
                    village_info: villageInfo
                }
            );

            const formData = new FormData();
            formData.append('source_file', docBuffer, {
                filename: 'document.docx',
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            formData.append('target_format', 'pdf');

            const conversionResponse = await axios.post(`${ZAMZAR_ENDPOINT}/jobs`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const jobId = conversionResponse.data.id;

            let isCompleted = false;
            let attempts = 0;
            const maxAttempts = 10;
            let lastJobStatus = null;

            while (!isCompleted && attempts < maxAttempts) {
                const statusResponse = await axios.get(`${ZAMZAR_ENDPOINT}/jobs/${jobId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                    }
                });
                
                lastJobStatus = statusResponse.data;

                if (lastJobStatus.status === 'successful') {
                    isCompleted = true;
                } else if (lastJobStatus.status === 'failed') {
                    throw new Error('Conversion failed');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000)); 
                    attempts++;
                }
            }

            if (!isCompleted) {
                throw new Error('Conversion timeout');
            }

            const fileId = lastJobStatus.target_files[0].id;

            const downloadResponse = await axios.get(`${ZAMZAR_ENDPOINT}/files/${fileId}/content`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                },
                responseType: 'arraybuffer'
            });

            await axios.delete(`${ZAMZAR_ENDPOINT}/files/${fileId}`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(ZAMZAR_API_KEY + ':').toString('base64')}`
                }
            });

            return Buffer.from(downloadResponse.data);

        } catch (error) {
            console.error('PDF generation error:', error.response?.data || error);
            throw new Error('Failed to generate PDF: ' + error.message);
        }
    }
};

module.exports = pdfGenerator;