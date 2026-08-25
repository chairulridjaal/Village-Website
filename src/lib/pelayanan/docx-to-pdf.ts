import { convertToPdf, ConvertError } from 'docx-to-pdf-wasm';
import { safeDownloadFilename } from './docx-fill';
import { prepareDocxForWasmPdf } from './docx-prepare-pdf';
import wasmModule from './docx-to-pdf.wasm';

export async function docxBytesToPdf(
  docx: ArrayBuffer | Uint8Array,
  _opts?: { origin?: string; bucket?: R2Bucket; filename?: string }
): Promise<Uint8Array> {
  const input = docx instanceof Uint8Array ? docx : new Uint8Array(docx);
  const prepared = prepareDocxForWasmPdf(input);
  try {
    return await convertToPdf(wasmModule, prepared);
  } catch (e) {
    if (e instanceof ConvertError) {
      throw new Error(`Konversi DOCX→PDF gagal: ${e.message}`);
    }
    throw e;
  }
}

export function safePdfFilename(nomor: string, jenisNama: string): string {
  return safeDownloadFilename(nomor, jenisNama, 'pdf');
}
