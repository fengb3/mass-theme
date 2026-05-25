import type { ThemeElement, LabelElement, LayoutAlign } from '../types/theme';
import { resolveFont, resolveFontByName, getDefaultText } from './font';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../types/theme';

export interface PositionStyle {
  position: 'absolute' | 'relative';
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
  width?: string;
  height?: string;
  transform?: string;
  transformOrigin?: string;
  overflow?: string;
}

interface AssetMap {
  images: Record<string, { name: string; src: string }>;
  fonts: Record<string, { name: string; src: string }>;
}

export function calcPosition(el: ThemeElement, assets?: AssetMap): PositionStyle {
  let w: number = typeof el.width === 'number' ? el.width : 0;
  let h: number = typeof el.height === 'number' ? el.height : 0;

  // For labels without explicit size, estimate from font + text
  if (el.type === 'label' && (!w || !h)) {
    const label = el as LabelElement;
    let fontSize = 16;
    if (assets?.fonts && label.font) {
      const fontAsset = assets.fonts[label.font];
      if (fontAsset?.src) {
        const sizeMatch = fontAsset.src.match(/[-_](\d+)/);
        if (sizeMatch) fontSize = parseInt(sizeMatch[1]);
      }
    }
    if (fontSize === 16) {
      const fontInfo = resolveFontByName(label.font || '');
      fontSize = fontInfo.size;
    }
    const text = label.text || getDefaultText(el.name) || el.name || '';
    const estimatedWidth = Math.ceil(text.length * fontSize * 0.6);
    if (!w) w = estimatedWidth;
    if (!h) h = fontSize;
  }

  const align: string = (el.layout_align || 'TOP_LEFT').toUpperCase();
  const ox = el.offset_x || 0;
  const oy = el.offset_y || 0;

  const style: PositionStyle = { position: 'absolute', overflow: 'hidden' };
  if (w) style.width = w + 'px';
  if (h) style.height = h + 'px';

  const CX = SCREEN_WIDTH / 2;
  const CY = SCREEN_HEIGHT / 2;

  let baseX: number, baseY: number;
  switch (align) {
    case 'TOP_LEFT':     baseX = 0;    baseY = 0;    break;
    case 'TOP_MID':      baseX = CX;   baseY = 0;    break;
    case 'TOP_RIGHT':    baseX = SCREEN_WIDTH;  baseY = 0;    break;
    case 'LEFT_MID':     baseX = 0;    baseY = CY;   break;
    case 'CENTER':       baseX = CX;   baseY = CY;   break;
    case 'RIGHT_MID':    baseX = SCREEN_WIDTH;  baseY = CY;   break;
    case 'BOTTOM_LEFT':  baseX = 0;    baseY = SCREEN_HEIGHT;  break;
    case 'BOTTOM_MID':   baseX = CX;   baseY = SCREEN_HEIGHT;  break;
    case 'BOTTOM_RIGHT': baseX = SCREEN_WIDTH;  baseY = SCREEN_HEIGHT;  break;
    default:             baseX = 0;    baseY = 0;    break;
  }

  const anchorX = baseX + ox;
  const anchorY = baseY + oy;

  switch (align) {
    case 'TOP_LEFT':     style.left = anchorX + 'px';       style.top = anchorY + 'px';       break;
    case 'TOP_MID':      style.left = (anchorX - w / 2) + 'px'; style.top = anchorY + 'px';       break;
    case 'TOP_RIGHT':    style.left = (anchorX - w) + 'px';   style.top = anchorY + 'px';       break;
    case 'LEFT_MID':     style.left = anchorX + 'px';       style.top = (anchorY - h / 2) + 'px'; break;
    case 'CENTER':       style.left = (anchorX - w / 2) + 'px'; style.top = (anchorY - h / 2) + 'px'; break;
    case 'RIGHT_MID':    style.left = (anchorX - w) + 'px';   style.top = (anchorY - h / 2) + 'px'; break;
    case 'BOTTOM_LEFT':  style.left = anchorX + 'px';       style.top = (anchorY - h) + 'px';   break;
    case 'BOTTOM_MID':   style.left = (anchorX - w / 2) + 'px'; style.top = (anchorY - h) + 'px';   break;
    case 'BOTTOM_RIGHT': style.left = (anchorX - w) + 'px';   style.top = (anchorY - h) + 'px';   break;
    default:             style.left = anchorX + 'px';       style.top = anchorY + 'px';       break;
  }

  if (el.rotation) {
    style.transform = `rotate(${el.rotation / 10}deg)`;
    style.transformOrigin = 'center center';
  }

  return style;
}

export function styleToCSS(s: PositionStyle): string {
  return Object.entries(s)
    .map(([k, v]) => {
      if (v === undefined) return '';
      const kebab = k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
      return `${kebab}:${v}`;
    })
    .filter(Boolean)
    .join(';');
}
