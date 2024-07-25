import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import pdfLib from '@salesforce/resourceUrl/pdfLib';

export default class PdfPasswordCheck extends LightningElement {
    @track resultMessage = '';
    selectedFile;
    password = '';
    pdfLibInitialized = false;

    connectedCallback() {
        this.loadPdfLib();
    }

    loadPdfLib() {
        loadScript(this, pdfLib + '/pdf-lib.min.js')
            .then(() => {
                this.pdfLibInitialized = true;
            })
            .catch(error => {
                console.error('Error loading pdf-lib', error);
            });
    }

    handleFileChange(event) {
        this.selectedFile = event.target.files[0];
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    async checkPassword() {
        if (!this.pdfLibInitialized) {
            this.resultMessage = 'PDF library is not loaded yet.';
            return;
        }

        if (!this.selectedFile) {
            this.resultMessage = 'Please select a file.';
            return;
        }

        if (!this.password) {
            this.resultMessage = 'Please enter a password.';
            return;
        }

        try {
            const arrayBuffer = await this.readFileAsArrayBuffer(this.selectedFile);
            await PDFLib.PDFDocument.load(arrayBuffer, { password: this.password });

            this.resultMessage = 'Password is correct!';
        } catch (error) {
            if (error.message.includes('Password required or incorrect')) {
                this.resultMessage = 'Password is incorrect!';
            } else {
                this.resultMessage = `An error occurred: ${error.message}`;
            }
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}
