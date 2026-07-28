// Shared admin contenteditable editor + image upload helpers.

import { openPhotoEditor, type CropAspect } from './photo-editor';

export function initEditor(editor: HTMLElement, hidden: HTMLInputElement) {
  document.execCommand('defaultParagraphSeparator', false, 'p');
  if (!editor.innerHTML.trim()) editor.innerHTML = '<p><br></p>';

  enhanceExistingImages(editor);

  editor.addEventListener('input', () => {
    hidden.value = editor.innerHTML;
  });

  editor.addEventListener('click', (e) => {
    const t = e.target as HTMLElement | null;
    if (t?.tagName === 'IMG') {
      e.preventDefault();
      selectImage(editor, t as HTMLImageElement);
      return;
    }
    clearImageSelection(editor);
  });

  editor.addEventListener('keydown', (e) => {
    const selected = editor.querySelector('img.editor-img--selected') as HTMLImageElement | null;
    if (selected && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      removeImage(selected);
      hidden.value = editor.innerHTML;
    }
  });

  const toolbar = editor.previousElementSibling as HTMLElement | null;
  const root = toolbar?.matches?.('[data-editor-toolbar], .border.rounded-t-lg')
    ? toolbar
    : editor.parentElement;
  const buttons = root
    ? root.querySelectorAll<HTMLElement>('[data-cmd]')
    : document.querySelectorAll<HTMLElement>('[data-cmd]');

  buttons.forEach((btn) => {
    if ((btn as HTMLElement & { _edBound?: boolean })._edBound) return;
    (btn as HTMLElement & { _edBound?: boolean })._edBound = true;

    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', async () => {
      const cmd = btn.dataset.cmd ?? '';
      editor.focus();
      if (cmd === 'image') {
        await insertInlineImage(editor);
      } else if (cmd === 'removeImage') {
        const selected = editor.querySelector('img.editor-img--selected') as HTMLImageElement | null;
        if (selected) removeImage(selected);
        else alert('Klik gambar di isi dulu, lalu tekan Hapus gambar (atau tombol Delete).');
      } else if (cmd.startsWith('formatBlock-')) {
        const tag = cmd.split('-')[1];
        const current = document.queryCommandValue('formatBlock').toLowerCase();
        document.execCommand('formatBlock', false, current === tag ? '<p>' : `<${tag}>`);
      } else {
        document.execCommand(cmd, false);
      }
      hidden.value = editor.innerHTML;
    });
  });

  const form = editor.closest('form');
  form?.addEventListener('submit', () => {
    clearImageSelection(editor);
    hidden.value = editor.innerHTML;
  });
}

function enhanceExistingImages(editor: HTMLElement) {
  editor.querySelectorAll('img').forEach((img) => {
    img.setAttribute('contenteditable', 'false');
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.cursor = 'pointer';
    img.style.borderRadius = '0.5rem';
    if (!img.title) img.title = 'Klik untuk memilih, lalu Delete untuk menghapus';
  });
}

function clearImageSelection(editor: HTMLElement) {
  editor.querySelectorAll('img.editor-img--selected').forEach((img) => {
    img.classList.remove('editor-img--selected');
    (img as HTMLImageElement).style.outline = '';
  });
}

function selectImage(editor: HTMLElement, img: HTMLImageElement) {
  clearImageSelection(editor);
  img.classList.add('editor-img--selected');
  img.style.outline = '3px solid var(--color-accent, #0E9AA7)';
  img.style.outlineOffset = '2px';
}

function removeImage(img: HTMLImageElement) {
  const parent = img.parentElement;
  img.remove();
  if (parent && parent.tagName === 'P' && !parent.textContent?.trim() && parent.querySelectorAll('img').length === 0) {
    parent.innerHTML = '<br>';
  }
}

export interface Uploaded { id: number; url: string; thumbUrl: string }

export async function uploadImageBlobs(
  display: Blob,
  thumb: Blob,
  alt: string,
  extra: Record<string, string> = {}
): Promise<Uploaded> {
  const fd = new FormData();
  fd.set('display', display, 'display.webp');
  fd.set('thumb', thumb, 'thumb.webp');
  fd.set('alt', alt);
  for (const [k, v] of Object.entries(extra)) fd.set(k, v);
  const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`upload gagal (${res.status}) ${msg}`.trim());
  }
  return res.json();
}

export async function uploadImage(
  file: File,
  alt: string,
  extra: Record<string, string> = {},
  cropOpts?: { aspect?: CropAspect; title?: string; skipCrop?: boolean }
): Promise<Uploaded> {
  if (cropOpts?.skipCrop) {
    const [display, thumb] = await Promise.all([
      encodeWebpFile(file, 1600),
      encodeWebpFile(file, 400),
    ]);
    return uploadImageBlobs(display, thumb, alt, extra);
  }

  const edited = await openPhotoEditor(file, {
    aspect: cropOpts?.aspect ?? 'free',
    title: cropOpts?.title ?? 'Sesuaikan foto',
    defaultAlt: alt,
    askAlt: true,
  });
  if (!edited) throw new Error('dibatalkan');
  return uploadImageBlobs(edited.display, edited.thumb, edited.alt || alt, extra);
}

async function encodeWebpFile(file: File, maxPx: number): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxPx / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode gagal'))), 'image/webp', 0.8)
  );
}

function pickFiles(multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = multiple;
    input.onchange = () => resolve([...(input.files ?? [])]);
    input.click();
  });
}

async function insertInlineImage(editor: HTMLElement) {
  const sel = window.getSelection();
  const range = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
  const [file] = await pickFiles(false);
  if (!file) return;
  try {
    const edited = await openPhotoEditor(file, {
      aspect: 'free',
      title: 'Sesuaikan gambar di artikel',
      defaultAlt: '',
      askAlt: true,
    });
    if (!edited) return;
    const up = await uploadImageBlobs(edited.display, edited.thumb, edited.alt);
    editor.focus();
    if (range && sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    const safeAlt = edited.alt.replace(/"/g, '&quot;');
    const html = `<p><img src="${up.url}" alt="${safeAlt}" contenteditable="false" style="max-width:100%;height:auto;border-radius:0.5rem;cursor:pointer" title="Klik lalu tekan Delete untuk menghapus"></p>`;
    document.execCommand('insertHTML', false, html);
    enhanceExistingImages(editor);
  } catch (err) {
    if (String(err).includes('dibatalkan')) return;
    console.error(err);
    alert('Upload gambar gagal. Pastikan Anda sudah login dan format/ukuran OK.');
  }
}
