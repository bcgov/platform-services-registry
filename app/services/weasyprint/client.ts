import axios, { Axios } from 'axios';
import { WEASYPRINT_URL } from '@/config';

export class WeasyPrint {
  private _instance: Axios;

  constructor() {
    this._instance = axios.create({
      baseURL: WEASYPRINT_URL,
    });
  }

  async generatePdf({ html, css = '', filename = 'download.pdf' }: { html: string; css?: string; filename?: string }) {
    const response = await this._instance.post('/pdf', { html, css, filename }, { responseType: 'arraybuffer' });
    const fileData = Buffer.from(response.data, 'binary');
    return fileData;
  }
}
