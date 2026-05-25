import type { ThemePage, ThemeElement, Asset } from '../types/theme';
import { parseColor } from '../utils/color';
import { resolveFont, resolveFontByName, getDefaultText, formatCurrentTime, formatCurrentWeek } from '../utils/font';
import { calcPosition, styleToCSS, type PositionStyle } from '../utils/position';

interface AssetMap {
  images: Record<string, Asset>;
  fonts: Record<string, Asset>;
}

export function buildAssetMap(page: ThemePage): AssetMap {
  const images: Record<string, Asset> = {};
  const fonts: Record<string, Asset> = {};
  for (const a of page.image_assets || []) images[a.name] = a;
  for (const a of page.font_assets || []) fonts[a.name] = a;
  return { images, fonts };
}

export function binToPng(src: string): string {
  if (!src) return '';
  let p = src.replace(/^\/sdcard\//, '');
  p = p.replace(/\.bin$/i, '.png');
  p = p.replace(/\.mjpeg\.avi$/i, '.png');
  return p;
}

export function renderPage(
  container: HTMLElement,
  page: ThemePage,
  options?: {
    selectedElement?: string | null;
    showBounds?: boolean;
    onElementClick?: (el: ThemeElement, index: number) => void;
  }
): void {
  container.innerHTML = '';
  container.style.background = parseColor(page.main_cont?.bg_color) || '#000';

  const assets = buildAssetMap(page);
  let elemCount = 0;

  for (let idx = 0; idx < (page.elements || []).length; idx++) {
    const el = page.elements[idx];
    const dom = renderElement(el, assets, idx, options);
    if (dom) {
      container.appendChild(dom);
      elemCount++;
    }
  }
}

function renderElement(
  el: ThemeElement,
  assets: AssetMap,
  idx: number,
  options?: {
    selectedElement?: string | null;
    showBounds?: boolean;
    onElementClick?: (el: ThemeElement, index: number) => void;
  }
): HTMLElement | null {
  const type = el.type;
  if (!type) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'theme-element';
  wrapper.dataset.name = el.name || '';
  wrapper.dataset.type = type;
  wrapper.dataset.index = String(idx);

  const pos = calcPosition(el, assets);
  wrapper.style.cssText = styleToCSS(pos);
  wrapper.style.zIndex = String(idx + 1);

  if (options?.onElementClick) {
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      options.onElementClick!(el, idx);
    });
  }

  // Selection highlight
  if (options?.selectedElement === el.name) {
    wrapper.style.outline = '2px solid #4dabf7';
    wrapper.style.outlineOffset = '-1px';
  }

  switch (type) {
    case 'img': renderImg(wrapper, el, assets); break;
    case 'label': renderLabel(wrapper, el, assets); break;
    case 'imgbtn': renderImgBtn(wrapper, el, assets); break;
    case 'bar': renderBar(wrapper, el); break;
    case 'slider': renderSlider(wrapper, el); break;
    case 'arc': renderArc(wrapper, el); break;
    case 'clock': renderClock(wrapper, el); break;
    case 'clock_strip': renderClockStrip(wrapper, el); break;
    case 'mjpeg': renderMjpeg(wrapper, el, assets); break;
    case 'container': renderContainer(wrapper, el, assets); break;
    default:
      wrapper.style.background = '#333';
      wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-size:10px;text-align:center;padding:4px;">${type}<br>${el.name || ''}</div>`;
  }

  return wrapper;
}

function renderImg(wrapper: HTMLElement, el: ThemeElement, assets: AssetMap) {
  const img = el as { src: string; name: string };
  const srcRef = img.src;
  if (!srcRef) {
    wrapper.style.background = '#222';
    wrapper.style.border = '1px dashed #444';
    wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:10px;">img:${img.name}</div>`;
    return;
  }
  const asset = assets.images[srcRef];
  if (asset) {
    const imgEl = document.createElement('img');
    imgEl.src = binToPng(asset.src);
    imgEl.style.cssText = 'width:100%;height:100%;object-fit:fill;display:block;';
    imgEl.onerror = function () {
      this.style.display = 'none';
      wrapper.style.background = '#1a1a1a';
      wrapper.style.border = '1px dashed #444';
      wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:9px;text-align:center;padding:2px;">${srcRef}</div>`;
    };
    wrapper.appendChild(imgEl);
  } else {
    wrapper.style.background = '#222';
    wrapper.style.border = '1px dashed #444';
    wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:10px;">${srcRef}</div>`;
  }
}

function renderLabel(wrapper: HTMLElement, el: ThemeElement, assets: AssetMap) {
  const label = el as { font: string; color: string; text?: string; text_align?: string; name: string };
  const color = parseColor(label.color || '0xFFFFFF');
  const text = label.text || label.name || '';
  const fontAsset = assets.fonts[label.font || ''];
  const fontInfo = fontAsset ? resolveFont(fontAsset.src) : resolveFontByName(label.font || '');
  const textAlign = (label.text_align || 'LEFT').toLowerCase();

  wrapper.style.color = color;
  wrapper.style.fontSize = fontInfo.size + 'px';
  wrapper.style.fontFamily = fontInfo.family;
  wrapper.style.fontWeight = String(fontInfo.weight);
  wrapper.style.whiteSpace = 'nowrap';
  wrapper.style.lineHeight = '1.2';
  wrapper.style.overflow = 'hidden';

  if (label.width && typeof label.width === 'number') wrapper.style.width = label.width + 'px';
  if (label.height && typeof label.height === 'number') wrapper.style.height = label.height + 'px';
  if (textAlign === 'center') wrapper.style.textAlign = 'center';
  if (textAlign === 'right') wrapper.style.textAlign = 'right';

  let displayText = text || getDefaultText(el.name);

  if (el.name === 'time_label') {
    displayText = formatCurrentTime();
    wrapper.classList.add('live-time');
  } else if (el.name === 'week_label') {
    displayText = formatCurrentWeek();
    wrapper.classList.add('live-week');
  }

  wrapper.textContent = displayText;
}

function renderImgBtn(wrapper: HTMLElement, el: ThemeElement, assets: AssetMap) {
  const btn = el as {
    states: { released: string; pressed?: string; checked?: string };
    on_click?: string;
    elements?: ThemeElement[];
    width?: number | string;
    height?: number | string;
    name: string;
  };
  const srcName = btn.states?.released || '';
  const asset = assets.images[srcName];

  if (btn.width && typeof btn.width === 'number') wrapper.style.width = btn.width + 'px';
  if (btn.height && typeof btn.height === 'number') wrapper.style.height = btn.height + 'px';

  if (asset) {
    const imgEl = document.createElement('img');
    imgEl.src = binToPng(asset.src);
    imgEl.style.cssText = 'width:100%;height:100%;object-fit:fill;display:block;';
    imgEl.onerror = function () {
      this.style.display = 'none';
      renderBtnPlaceholder(wrapper, btn, srcName);
    };
    wrapper.appendChild(imgEl);
  } else {
    renderBtnPlaceholder(wrapper, btn, srcName);
  }

  if (btn.elements) {
    for (let ci = 0; ci < btn.elements.length; ci++) {
      const child = btn.elements[ci];
      const childDom = renderElement(child, assets, ci);
      if (childDom) {
        childDom.style.position = 'absolute';
        const cpos = calcPosition(child, assets);
        childDom.style.cssText += ';' + styleToCSS(cpos);
        childDom.style.zIndex = String(ci + 1);
        wrapper.appendChild(childDom);
      }
    }
  }
}

function renderBtnPlaceholder(wrapper: HTMLElement, btn: { states?: { checked?: string }; on_click?: string; name: string }, srcName: string) {
  wrapper.style.cssText += ';background:#2a2a2a;border:1px solid #555;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  const label = srcName || btn.name || 'btn';
  wrapper.innerHTML = `<span style="color:#999;font-size:10px;text-align:center;padding:2px;">${label}</span>`;
  if (btn.states?.checked) {
    const indicator = document.createElement('div');
    indicator.style.cssText = 'position:absolute;bottom:1px;right:1px;width:6px;height:6px;background:#e94560;border-radius:50%;';
    wrapper.appendChild(indicator);
  }
  if (btn.on_click) {
    const badge = document.createElement('div');
    badge.style.cssText = 'position:absolute;top:1px;left:1px;background:#e94560;color:white;font-size:7px;padding:1px 3px;border-radius:2px;';
    badge.textContent = btn.on_click.replace('on', '').substring(0, 6);
    wrapper.appendChild(badge);
  }
}

function renderBar(wrapper: HTMLElement, el: ThemeElement) {
  const bar = el as {
    width: number; height: number;
    range_min: number; range_max: number; value: number;
    direction: string;
    main_color: string; indic_color: string;
    radius: number; padding: number;
  };
  const w = bar.width || 100;
  const h = bar.height || 20;
  const pct = (bar.value - bar.range_min) / (bar.range_max - bar.range_min);
  const dir = bar.direction || 'horizontal';
  const mainColor = parseColor(bar.main_color || '0x333333');
  const indicColor = parseColor(bar.indic_color || '0xFFFFFF');
  const radius = bar.radius || 0;
  const padding = bar.padding || 0;

  const bg = document.createElement('div');
  bg.style.cssText = `position:absolute;inset:0;background:${mainColor};border-radius:${radius}px;`;
  wrapper.appendChild(bg);

  const indic = document.createElement('div');
  if (dir === 'vertical') {
    const indicH = Math.max(0, (h - padding * 2) * pct);
    indic.style.cssText = `position:absolute;bottom:${padding}px;left:${padding}px;width:${Math.max(0, w - padding * 2)}px;height:${indicH}px;background:${indicColor};border-radius:${Math.max(0, radius - padding / 2)}px;`;
  } else {
    const indicW = Math.max(0, (w - padding * 2) * pct);
    indic.style.cssText = `position:absolute;top:${padding}px;left:${padding}px;width:${indicW}px;height:${Math.max(0, h - padding * 2)}px;background:${indicColor};border-radius:${Math.max(0, radius - padding / 2)}px;`;
  }
  wrapper.appendChild(indic);
}

function renderSlider(wrapper: HTMLElement, el: ThemeElement) {
  const sl = el as {
    width: number; height: number;
    range_min: number; range_max: number; value: number;
    main_color: string; indic_color: string;
    radius: number; knob_visible: boolean;
  };
  const w = sl.width || 100;
  const h = sl.height || 8;
  const pct = (sl.value - sl.range_min) / (sl.range_max - sl.range_min);
  const mainColor = parseColor(sl.main_color || '0xD9D9D9');
  const indicColor = parseColor(sl.indic_color || '0xFFFFFF');
  const radius = sl.radius || 5;

  const bg = document.createElement('div');
  bg.style.cssText = `position:absolute;inset:0;background:${mainColor};border-radius:${radius}px;`;
  wrapper.appendChild(bg);

  const indic = document.createElement('div');
  indic.style.cssText = `position:absolute;top:0;left:0;width:${w * pct}px;height:${h}px;background:${indicColor};border-radius:${radius}px;`;
  wrapper.appendChild(indic);

  if (sl.knob_visible !== false) {
    const knob = document.createElement('div');
    knob.style.cssText = `position:absolute;top:50%;left:${w * pct}px;width:${h + 4}px;height:${h + 4}px;background:${indicColor};border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 1px 3px rgba(0,0,0,0.3);`;
    wrapper.appendChild(knob);
  }
}

function renderArc(wrapper: HTMLElement, el: ThemeElement) {
  const arc = el as {
    width: number; height: number;
    range_min: number; range_max: number; value: number;
    bg_start_angle: number; bg_end_angle: number;
    arc_width: number; arc_color: string; bg_arc_color: string;
  };
  const w = arc.width || 100;
  const h = arc.height || 100;
  const pct = (arc.value - arc.range_min) / (arc.range_max - arc.range_min);
  const bgStart = arc.bg_start_angle || 0;
  const bgEnd = arc.bg_end_angle || 360;
  const arcWidth = arc.arc_width || 8;
  const arcColor = parseColor(arc.arc_color || '0xFFFFFF');
  const bgArcColor = parseColor(arc.bg_arc_color || '0x3f3f3f');

  wrapper.style.width = w + 'px';
  wrapper.style.height = h + 'px';

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.style.cssText = 'width:100%;height:100%;';
  wrapper.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = w / 2, cy = h / 2;
  const r = Math.max(1, Math.min(w, h) / 2 - arcWidth);

  ctx.beginPath();
  ctx.arc(cx, cy, r, (bgStart - 90) * Math.PI / 180, (bgEnd - 90) * Math.PI / 180);
  ctx.strokeStyle = bgArcColor;
  ctx.lineWidth = arcWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  const indicAngle = bgStart + (bgEnd - bgStart) * pct;
  ctx.beginPath();
  ctx.arc(cx, cy, r, (bgStart - 90) * Math.PI / 180, (indicAngle - 90) * Math.PI / 180);
  ctx.strokeStyle = arcColor;
  ctx.lineWidth = arcWidth;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function renderClock(wrapper: HTMLElement, el: ThemeElement) {
  const clock = el as {
    width: number; height: number;
    marking_color: string; marking_color_opa: number;
    marking_length: number; marking_width: number;
  };
  const w = clock.width || 480;
  const h = clock.height || 480;
  const markColor = parseColor(clock.marking_color || '0xFFFFFF');
  const markOpa = (clock.marking_color_opa ?? 50) / 100;
  const markLen = clock.marking_length || 100;
  const markWidth = clock.marking_width || 6;

  wrapper.style.width = w + 'px';
  wrapper.style.height = h + 'px';

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.style.cssText = 'width:100%;height:100%;';
  wrapper.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) / 2;

  ctx.globalAlpha = markOpa;
  ctx.strokeStyle = markColor;
  ctx.lineWidth = markWidth;
  ctx.lineCap = 'round';

  for (let i = 0; i < 24; i++) {
    const angle = (i * 15 - 90) * Math.PI / 180;
    const x1 = cx + Math.cos(angle) * r;
    const y1 = cy + Math.sin(angle) * r;
    const x2 = cx + Math.cos(angle) * (r - markLen);
    const y2 = cy + Math.sin(angle) * (r - markLen);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function renderClockStrip(wrapper: HTMLElement, el: ThemeElement) {
  const strip = el as {
    marking_color: string; marking_color_opa: number;
    marking_spacing: number;
    big_width: number; big_height: number;
    small_width: number; small_height: number;
    big_loop: number; step: number;
  };
  const markColor = parseColor(strip.marking_color || '0xFFFFFF');
  const markOpa = (strip.marking_color_opa ?? 50) / 100;
  const spacing = strip.marking_spacing || 22;
  const bigW = strip.big_width || 59;
  const bigH = strip.big_height || 2;
  const smallW = strip.small_width || 30;
  const smallH = strip.small_height || 2;
  const bigLoop = strip.big_loop || 6;

  wrapper.style.cssText += ';width:100%;overflow:hidden;display:flex;align-items:center;left:0;top:50%;transform:translateY(-50%);height:' + (Math.max(bigH, smallH) + 4) + 'px;';

  const count = 30;
  for (let i = 0; i < count; i++) {
    const isBig = i % bigLoop === 0;
    const tick = document.createElement('div');
    tick.style.cssText = `display:inline-block;width:${isBig ? bigW : smallW}px;height:${isBig ? bigH : smallH}px;background:${markColor};opacity:${markOpa};margin-right:${spacing}px;flex-shrink:0;`;
    wrapper.appendChild(tick);
  }
}

function renderMjpeg(wrapper: HTMLElement, el: ThemeElement, assets: AssetMap) {
  const mj = el as { src?: string; name: string };
  const srcRef = mj.src;
  wrapper.style.cssText += ';background:#111;border:1px dashed #333;';

  if (srcRef) {
    const asset = assets.images[srcRef];
    if (asset) {
      const imgEl = document.createElement('img');
      imgEl.src = binToPng(asset.src);
      imgEl.style.cssText = 'width:100%;height:100%;object-fit:fill;display:block;';
      imgEl.onerror = function () {
        this.style.display = 'none';
        wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:10px;">MJPEG:${srcRef}</div>`;
      };
      wrapper.appendChild(imgEl);
      return;
    }
  }
  wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:10px;">MJPEG:${mj.name || ''}</div>`;
}

function renderContainer(wrapper: HTMLElement, el: ThemeElement, assets: AssetMap) {
  const cont = el as {
    width?: number | string; height?: number | string;
    layout?: string; flex_direction?: string; flex_align?: string; flex_gap?: number;
    bg_img?: string; bg_color?: string; bg_opa?: number; radius?: number;
    elements?: ThemeElement[];
  };
  const w = cont.width;
  const h = cont.height;
  const layout = cont.layout;
  const flexDir = cont.flex_direction || 'row';
  const flexAlign = cont.flex_align || 'start';
  const flexGap = cont.flex_gap || 0;
  const bgColor = cont.bg_color ? parseColor(cont.bg_color) : '';
  const bgImg = cont.bg_img;
  const bgOpa = cont.bg_opa;
  const radius = cont.radius || 0;

  if (w && w !== 'content') wrapper.style.width = w + 'px';
  if (h && h !== 'content') wrapper.style.height = h + 'px';

  const inner = document.createElement('div');
  inner.style.cssText = 'position:relative;width:100%;height:100%;';

  if (bgImg) {
    const asset = assets.images[bgImg];
    if (asset) {
      inner.style.backgroundImage = `url(${binToPng(asset.src)})`;
      inner.style.backgroundRepeat = 'repeat';
    }
  } else if (bgColor) {
    inner.style.background = bgColor;
    if (bgOpa !== undefined) inner.style.opacity = String(bgOpa / 255);
  }
  if (radius) inner.style.borderRadius = radius + 'px';

  if (layout === 'flex') {
    inner.style.display = 'flex';
    inner.style.flexDirection = flexDir === 'row_wrap' ? 'row' : flexDir;
    inner.style.flexWrap = flexDir === 'row_wrap' ? 'wrap' : 'nowrap';
    inner.style.gap = flexGap + 'px';

    const alignMap: Record<string, string> = {
      start: 'flex-start', center: 'center', end: 'flex-end',
      space_between: 'space-between', space_around: 'space-around', space_evenly: 'space-evenly',
    };
    inner.style.justifyContent = alignMap[flexAlign] || 'flex-start';
    inner.style.alignItems = 'center';

    if (w === 'content') {
      inner.style.width = 'auto';
      wrapper.style.width = 'auto';
      inner.style.display = 'inline-flex';
    }
    if (h === 'content') {
      inner.style.height = 'auto';
      wrapper.style.height = 'auto';
    }
  }

  (cont.elements || []).forEach((child, ci) => {
    if (layout === 'flex') {
      const flexChild = renderElement(
        { ...child, offset_x: 0, offset_y: 0, layout_align: 'TOP_LEFT' },
        assets,
        ci
      );
      if (flexChild) {
        flexChild.style.position = 'relative';
        flexChild.style.left = 'auto';
        flexChild.style.top = 'auto';
        inner.appendChild(flexChild);
      }
    } else {
      const childDom = renderElement(child, assets, ci);
      if (childDom) inner.appendChild(childDom);
    }
  });

  wrapper.appendChild(inner);
}
