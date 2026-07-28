/** Browser photo crop modal before final upload. No external deps. */

export type CropAspect = 'free' | '1:1' | '4:3' | '16:9';

export interface CropResult {
  display: Blob;
  thumb: Blob;
  alt: string;
}

interface CropOptions {
  aspect?: CropAspect;
  title?: string;
  defaultAlt?: string;
  askAlt?: boolean;
}

const ASPECT_MAP: Record<Exclude<CropAspect, 'free'>, number> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
};

export function openPhotoEditor(file: File, opts: CropOptions = {}): Promise<CropResult | null> {
  return new Promise((resolve) => {
    const aspect = opts.aspect ?? 'free';
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const root = buildModal(img, {
        aspect,
        title: opts.title ?? 'Sesuaikan foto',
        defaultAlt: opts.defaultAlt ?? '',
        askAlt: opts.askAlt !== false,
        fileName: file.name,
        onCancel: () => {
          cleanup();
          resolve(null);
        },
        onConfirm: async (crop, alt) => {
          try {
            const display = await rasterize(img, crop, 1600);
            const thumb = await rasterize(img, crop, 400);
            cleanup();
            resolve({ display, thumb, alt });
          } catch (e) {
            console.error(e);
            alert('Gagal memproses gambar. Coba lagi.');
          }
        },
      });
      document.body.appendChild(root);

      function cleanup() {
        URL.revokeObjectURL(url);
        root.remove();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('File gambar tidak bisa dibaca.');
      resolve(null);
    };
    img.src = url;
  });
}

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildModal(
  img: HTMLImageElement,
  cfg: {
    aspect: CropAspect;
    title: string;
    defaultAlt: string;
    askAlt: boolean;
    fileName: string;
    onCancel: () => void;
    onConfirm: (crop: CropRect, alt: string) => void;
  }
) {
  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(10,20,30,.72);display:flex;align-items:center;justify-content:center;padding:1rem;';

  const panel = document.createElement('div');
  panel.style.cssText =
    'background:#fff;border-radius:1rem;max-width:40rem;width:100%;max-height:95vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:system-ui,sans-serif;';

  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  // View box size
  const viewW = Math.min(520, window.innerWidth - 48);
  const viewH = Math.min(420, window.innerHeight - 220);

  // Fit image in view
  const fit = Math.min(viewW / natW, viewH / natH);
  let scale = fit;
  let panX = (viewW - natW * scale) / 2;
  let panY = (viewH - natH * scale) / 2;

  // Crop frame in view coordinates (centered)
  let cropAspect =
    cfg.aspect === 'free' ? natW / natH : ASPECT_MAP[cfg.aspect];
  let frameW = Math.min(viewW * 0.85, viewH * 0.85 * cropAspect);
  let frameH = frameW / cropAspect;
  if (frameH > viewH * 0.85) {
    frameH = viewH * 0.85;
    frameW = frameH * cropAspect;
  }
  let frameX = (viewW - frameW) / 2;
  let frameY = (viewH - frameH) / 2;

  panel.innerHTML = `
    <div style="padding:1rem 1.25rem;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;gap:.5rem;">
      <div>
        <p style="margin:0;font-weight:700;color:#0A3650;font-size:1rem;">${escapeHtml(cfg.title)}</p>
        <p style="margin:.15rem 0 0;font-size:.75rem;color:#64748b;">Geser foto · zoom · bingkai = hasil akhir</p>
      </div>
      <button type="button" data-x style="border:none;background:transparent;font-size:1.25rem;cursor:pointer;line-height:1;color:#64748b;" aria-label="Tutup">×</button>
    </div>
    <div style="padding:1rem 1.25rem;">
      <div data-stage style="position:relative;width:${viewW}px;max-width:100%;height:${viewH}px;margin:0 auto;background:#0f172a;border-radius:.75rem;overflow:hidden;touch-action:none;cursor:grab;user-select:none;">
        <canvas data-canvas width="${viewW}" height="${viewH}" style="display:block;width:100%;height:100%;"></canvas>
        <div data-frame style="position:absolute;border:2px solid #fff;box-shadow:0 0 0 9999px rgba(0,0,0,.45);pointer-events:none;border-radius:2px;"></div>
      </div>
      <div style="margin-top:.75rem;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;">
        <label style="font-size:.75rem;color:#64748b;display:flex;align-items:center;gap:.35rem;flex:1;min-width:10rem;">
          Zoom
          <input data-zoom type="range" min="10" max="300" value="100" style="flex:1;" />
        </label>
        <select data-aspect style="font-size:.75rem;border:1px solid #e2e8f0;border-radius:.5rem;padding:.35rem .5rem;">
          <option value="free">Bebas</option>
          <option value="1:1">Persegi 1:1 (foto pejabat)</option>
          <option value="4:3">4:3</option>
          <option value="16:9">16:9 (sampul lebar)</option>
        </select>
        <button type="button" data-reset style="font-size:.75rem;border:1px solid #e2e8f0;border-radius:.5rem;padding:.35rem .6rem;cursor:pointer;background:#f8fafc;">Reset</button>
      </div>
      ${
        cfg.askAlt
          ? `<label style="display:block;margin-top:.75rem;font-size:.8rem;font-weight:600;color:#0A3650;">Keterangan foto (opsional)
        <input data-alt type="text" value="${escapeHtml(cfg.defaultAlt)}" placeholder="cth. Gotong royong warga"
          style="display:block;width:100%;margin-top:.35rem;border:1px solid #e2e8f0;border-radius:.5rem;padding:.55rem .75rem;font-size:.875rem;box-sizing:border-box;" />
      </label>`
          : ''
      }
    </div>
    <div style="padding:1rem 1.25rem;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:.5rem;">
      <button type="button" data-cancel style="border:1px solid #e2e8f0;background:#fff;border-radius:.5rem;padding:.55rem 1rem;font-size:.875rem;cursor:pointer;font-weight:600;">Batal</button>
      <button type="button" data-ok style="border:none;background:#0E9AA7;color:#fff;border-radius:.5rem;padding:.55rem 1.1rem;font-size:.875rem;cursor:pointer;font-weight:700;">Pakai foto ini</button>
    </div>
  `;

  overlay.appendChild(panel);

  const stage = panel.querySelector('[data-stage]') as HTMLElement;
  const canvas = panel.querySelector('[data-canvas]') as HTMLCanvasElement;
  const frameEl = panel.querySelector('[data-frame]') as HTMLElement;
  const zoomEl = panel.querySelector('[data-zoom]') as HTMLInputElement;
  const aspectEl = panel.querySelector('[data-aspect]') as HTMLSelectElement;
  const altEl = panel.querySelector('[data-alt]') as HTMLInputElement | null;
  const ctx = canvas.getContext('2d')!;

  aspectEl.value = cfg.aspect;

  const minScale = fit * 0.5;
  const maxScale = fit * 4;

  function setFrameFromAspect(a: CropAspect) {
    cropAspect = a === 'free' ? frameW / frameH : ASPECT_MAP[a];
    const maxW = viewW * 0.9;
    const maxH = viewH * 0.9;
    frameW = Math.min(maxW, maxH * cropAspect);
    frameH = frameW / cropAspect;
    if (frameH > maxH) {
      frameH = maxH;
      frameW = frameH * cropAspect;
    }
    frameX = (viewW - frameW) / 2;
    frameY = (viewH - frameH) / 2;
  }

  function draw() {
    ctx.clearRect(0, 0, viewW, viewH);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.drawImage(img, panX, panY, natW * scale, natH * scale);
    frameEl.style.left = `${(frameX / viewW) * 100}%`;
    frameEl.style.top = `${(frameY / viewH) * 100}%`;
    frameEl.style.width = `${(frameW / viewW) * 100}%`;
    frameEl.style.height = `${(frameH / viewH) * 100}%`;
    zoomEl.value = String(Math.round((scale / fit) * 100));
  }

  function currentCrop(): CropRect {
    // Map frame rect from view space → image natural pixels
    const x = (frameX - panX) / scale;
    const y = (frameY - panY) / scale;
    const w = frameW / scale;
    const h = frameH / scale;
    return {
      x: clamp(x, 0, natW - 1),
      y: clamp(y, 0, natH - 1),
      w: clamp(w, 1, natW - Math.max(0, x)),
      h: clamp(h, 1, natH - Math.max(0, y)),
    };
  }

  // Drag to pan
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  stage.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    stage.setPointerCapture(e.pointerId);
    stage.style.cursor = 'grabbing';
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    panX += e.clientX - lastX;
    panY += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
  });
  stage.addEventListener('pointerup', () => {
    dragging = false;
    stage.style.cursor = 'grab';
  });
  stage.addEventListener('pointercancel', () => {
    dragging = false;
    stage.style.cursor = 'grab';
  });

  stage.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.92 : 1.08;
      const prev = scale;
      scale = clamp(scale * delta, minScale, maxScale);
      // zoom toward cursor
      const rect = stage.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * viewW;
      const cy = ((e.clientY - rect.top) / rect.height) * viewH;
      panX = cx - ((cx - panX) * scale) / prev;
      panY = cy - ((cy - panY) * scale) / prev;
      draw();
    },
    { passive: false }
  );

  zoomEl.addEventListener('input', () => {
    const prev = scale;
    scale = clamp(fit * (Number(zoomEl.value) / 100), minScale, maxScale);
    const cx = viewW / 2;
    const cy = viewH / 2;
    panX = cx - ((cx - panX) * scale) / prev;
    panY = cy - ((cy - panY) * scale) / prev;
    draw();
  });

  aspectEl.addEventListener('change', () => {
    setFrameFromAspect(aspectEl.value as CropAspect);
    draw();
  });

  panel.querySelector('[data-reset]')?.addEventListener('click', () => {
    scale = fit;
    panX = (viewW - natW * scale) / 2;
    panY = (viewH - natH * scale) / 2;
    setFrameFromAspect(aspectEl.value as CropAspect);
    draw();
  });

  panel.querySelector('[data-x]')?.addEventListener('click', cfg.onCancel);
  panel.querySelector('[data-cancel]')?.addEventListener('click', cfg.onCancel);
  panel.querySelector('[data-ok]')?.addEventListener('click', () => {
    const alt = altEl?.value.trim() ?? cfg.defaultAlt;
    cfg.onConfirm(currentCrop(), alt);
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cfg.onCancel();
  });

  setFrameFromAspect(cfg.aspect);
  draw();
  requestAnimationFrame(() => (panel.querySelector('[data-ok]') as HTMLElement)?.focus());

  return overlay;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function rasterize(img: HTMLImageElement, crop: CropRect, maxPx: number): Promise<Blob> {
  const scale = Math.min(1, maxPx / Math.max(crop.w, crop.h));
  const w = Math.max(1, Math.round(crop.w * scale));
  const h = Math.max(1, Math.round(crop.h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode gagal'))), 'image/webp', 0.85)
  );
}

/** Pick file → crop → return blobs ready for uploadImageBlobs. */
export async function pickAndEditPhoto(opts: CropOptions & { multiple?: boolean } = {}): Promise<CropResult[]> {
  const files = await pickImageFiles(!!opts.multiple);
  const out: CropResult[] = [];
  for (const file of files) {
    const edited = await openPhotoEditor(file, opts);
    if (edited) out.push(edited);
  }
  return out;
}

function pickImageFiles(multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = multiple;
    input.onchange = () => resolve([...(input.files ?? [])]);
    input.click();
  });
}
