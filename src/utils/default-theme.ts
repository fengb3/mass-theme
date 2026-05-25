import { v4 as uuid } from 'uuid'
import type { ElementType, ElementProps, LayoutAlign, PageType, ThemeElement } from '../types/theme'
import * as dbElements from '../db/elements'
import * as dbAssets from '../db/assets'

interface DefaultElement {
  name: string
  type: ElementType
  props: ElementProps
  offset_x?: number
  offset_y?: number
  layout_align?: LayoutAlign
  rotation?: number
  x?: number
  y?: number
}

const FONT = 'default_font'
const WHITE_IMG = 'white_bg'

function lbl(text: string, w: number, h: number, extra?: Partial<DefaultElement>): DefaultElement {
  return {
    name: '',
    type: 'label',
    props: { font: FONT, color: '0x000000', text, text_align: 'CENTER' as const, width: w, height: h, split_by_space: false, time_format: '' },
    ...extra,
  }
}

function imgBtn(name: string, extra?: Partial<DefaultElement>): DefaultElement {
  return {
    name,
    type: 'imgbtn',
    props: { states: { released: WHITE_IMG } },
    ...extra,
  }
}

const HOME_ELEMENTS: DefaultElement[] = [
  { name: 'homebg', type: 'img', props: { src: WHITE_IMG, width: 480, height: 480 } },
  { name: 'homebg_mjpeg', type: 'mjpeg', props: { src: '', width: 480, height: 480 } },
  { name: 'time_label', type: 'label', props: { font: FONT, color: '0x000000', text: '00:00', text_align: 'CENTER', width: 240, height: 60, split_by_space: false, time_format: '' }, layout_align: 'CENTER', offset_x: 0, offset_y: -60 },
  { name: 'week_label', type: 'label', props: { font: FONT, color: '0x666666', text: 'MONDAY', text_align: 'CENTER', width: 200, height: 30, split_by_space: false, time_format: '' }, layout_align: 'CENTER', offset_x: 0, offset_y: 0 },
  { name: 'homebg_blur', type: 'img', props: { src: WHITE_IMG, width: 480, height: 480 } },
  { name: 'volume_bar', type: 'bar', props: { range_min: 0, range_max: 100, value: 50, direction: 'horizontal', main_color: '0xDDDDDD', indic_color: '0x888888', radius: 4, padding: 2, reversed_value: false }, offset_x: 120, offset_y: 400 },
  { name: 'volume_percent_label', ...lbl('50%', 60, 20), name: 'volume_percent_label', offset_x: 340, offset_y: 400 },
  { name: 'volume_label', ...lbl('VOLUME', 100, 20), name: 'volume_label', offset_x: 120, offset_y: 425 },
  { name: 'light_bar', type: 'bar', props: { range_min: 0, range_max: 100, value: 50, direction: 'horizontal', main_color: '0xDDDDDD', indic_color: '0x888888', radius: 4, padding: 2, reversed_value: false }, offset_x: 120, offset_y: 445 },
  { name: 'light_percent_label', ...lbl('50%', 60, 20), name: 'light_percent_label', offset_x: 340, offset_y: 445 },
  { name: 'light_label', ...lbl('LIGHT', 100, 20), name: 'light_label', offset_x: 120, offset_y: 465 },
]

const MUSIC_ELEMENTS: DefaultElement[] = [
  { name: 'cover', type: 'img', props: { src: WHITE_IMG, width: 240, height: 240 }, layout_align: 'TOP_MID', offset_x: 0, offset_y: 40 },
  { name: 'song_title', type: 'label', props: { font: FONT, color: '0x000000', text: 'Song Title', text_align: 'CENTER', width: 400, height: 30, split_by_space: false, time_format: '' }, offset_x: 40, offset_y: 310 },
  { name: 'artist_name', type: 'label', props: { font: FONT, color: '0x666666', text: 'Artist', text_align: 'CENTER', width: 400, height: 24, split_by_space: false, time_format: '' }, offset_x: 40, offset_y: 345 },
  { name: 'play_btn', type: 'imgbtn', props: { states: { released: WHITE_IMG }, on_click: 'switchPlayPause' }, offset_x: 200, offset_y: 390 },
  { name: 'musicSlider', type: 'slider', props: { range_min: 0, range_max: 100, value: 0, main_color: '0xDDDDDD', indic_color: '0x888888', radius: 6, knob_visible: false }, offset_x: 16, offset_y: 370 },
]

const CLOCK_ELEMENTS: DefaultElement[] = [
  { name: 'clockpage_bg', type: 'img', props: { src: WHITE_IMG, width: 480, height: 480 } },
  { name: 'clock_scale', type: 'clock', props: { width: 360, height: 360, marking_color: '0x000000', marking_color_opa: 50, marking_length: 100, marking_width: 6 }, layout_align: 'CENTER' },
  { name: 'time_clock_label', type: 'label', props: { font: FONT, color: '0x000000', text: '25:00', text_align: 'CENTER', width: 200, height: 50, split_by_space: false, time_format: '' }, layout_align: 'CENTER' },
  { name: 'play_btn', type: 'imgbtn', props: { states: { released: WHITE_IMG }, on_click: 'switchClockPause' }, layout_align: 'BOTTOM_MID', offset_x: 0, offset_y: -40 },
]

const CLOCK_TIMEUP_ELEMENTS: DefaultElement[] = [
  { name: 'timeup_time', type: 'label', props: { font: FONT, color: '0x000000', text: '00:00', text_align: 'CENTER', width: 300, height: 60, split_by_space: false, time_format: '' }, layout_align: 'CENTER', offset_x: 0, offset_y: -40 },
  { name: 'timeup_text', type: 'label', props: { font: FONT, color: '0x666666', text: 'Time is up!', text_align: 'CENTER', width: 300, height: 30, split_by_space: false, time_format: '' }, layout_align: 'CENTER', offset_x: 0, offset_y: 20 },
  { name: 'timeup_goback', type: 'imgbtn', props: { states: { released: WHITE_IMG }, on_click: 'goBackToClockPage' }, layout_align: 'BOTTOM_MID', offset_x: 0, offset_y: -60 },
]

const MONITOR_ELEMENTS: DefaultElement[] = [
  { name: 'cpu_percent_arc', type: 'arc', props: { range_min: 0, range_max: 100, value: 0, bg_start_angle: 0, bg_end_angle: 360, rotation: 0, arc_width: 10, arc_color: '0x000000', bg_arc_color: '0xDDDDDD' }, offset_x: 30, offset_y: 30 },
  { name: 'cpu_percent_label', ...lbl('0%', 120, 24), name: 'cpu_percent_label', offset_x: 200, offset_y: 60 },
  { name: 'cpu_temp_bar', type: 'bar', props: { range_min: 0, range_max: 100, value: 0, direction: 'horizontal', main_color: '0xDDDDDD', indic_color: '0x888888', radius: 4, padding: 2, reversed_value: false }, offset_x: 30, offset_y: 210 },
  { name: 'cpu_temp_label', ...lbl('0°C', 120, 20), name: 'cpu_temp_label', offset_x: 200, offset_y: 210 },
  { name: 'cpu_clock_bar', type: 'bar', props: { range_min: 0, range_max: 100, value: 0, direction: 'horizontal', main_color: '0xDDDDDD', indic_color: '0x888888', radius: 4, padding: 2, reversed_value: false }, offset_x: 30, offset_y: 250 },
  { name: 'cpu_clock_label', ...lbl('0 MHz', 120, 20), name: 'cpu_clock_label', offset_x: 200, offset_y: 250 },
  { name: 'memory_bar', type: 'bar', props: { range_min: 0, range_max: 100, value: 0, direction: 'horizontal', main_color: '0xDDDDDD', indic_color: '0x888888', radius: 4, padding: 2, reversed_value: false }, offset_x: 30, offset_y: 310 },
  { name: 'memory_label', ...lbl('0%', 120, 20), name: 'memory_label', offset_x: 200, offset_y: 310 },
  { name: 'network_up_icon', type: 'img', props: { src: WHITE_IMG, width: 24, height: 24 }, offset_x: 30, offset_y: 370 },
  { name: 'network_up_label', ...lbl('0 KB/s', 150, 20), name: 'network_up_label', offset_x: 60, offset_y: 372 },
  { name: 'network_down_icon', type: 'img', props: { src: WHITE_IMG, width: 24, height: 24 }, offset_x: 240, offset_y: 370 },
  { name: 'network_down_label', ...lbl('0 KB/s', 150, 20), name: 'network_down_label', offset_x: 270, offset_y: 372 },
]

const KEY_ELEMENTS: DefaultElement[] = (() => {
  const elements: DefaultElement[] = []
  const cols = 3, rows = 3, gap = 10
  const btnW = 140, btnH = 120
  const startX = (480 - cols * btnW - (cols - 1) * gap) / 2
  const startY = (480 - rows * btnH - (rows - 1) * gap) / 2
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / cols), col = i % cols
    const x = startX + col * (btnW + gap)
    const y = startY + row * (btnH + gap)
    elements.push({
      name: `key${i + 1}`,
      type: 'imgbtn',
      props: { states: { released: WHITE_IMG }, on_click: 'onVirtualKeyClick', indexData: i },
      offset_x: x,
      offset_y: y,
    })
    elements.push({
      name: `key${i + 1}_title`,
      type: 'label',
      props: { font: FONT, color: '0x000000', text: `Key ${i + 1}`, text_align: 'CENTER', width: btnW, height: 24, split_by_space: false, time_format: '' },
      offset_x: x,
      offset_y: y + btnH + 4,
    })
  }
  return elements
})()

const DOCK_ELEMENTS: DefaultElement[] = [
  {
    name: 'dock_container_big',
    type: 'container',
    layout_align: 'BOTTOM_MID',
    props: {
      width: 'content',
      height: 50,
      layout: 'flex',
      flex_direction: 'row',
      flex_align: 'space_evenly',
      flex_gap: 16,
      elements: [
        { ...imgBtn('dock_btn_home', { props: { states: { released: WHITE_IMG }, on_click: 'onDockBtnClick', indexData: 1 } }), id: uuid(), pageId: '', order: 0, visible: true, offset_x: 0, offset_y: 0, layout_align: 'TOP_LEFT', rotation: 0, x: 0, y: 0, updatedAt: 0 } as ThemeElement,
        { ...imgBtn('dock_btn_music', { props: { states: { released: WHITE_IMG }, on_click: 'onDockBtnClick', indexData: 2 } }), id: uuid(), pageId: '', order: 1, visible: true, offset_x: 0, offset_y: 0, layout_align: 'TOP_LEFT', rotation: 0, x: 0, y: 0, updatedAt: 0 } as ThemeElement,
        { ...imgBtn('dock_btn_pomodoro', { props: { states: { released: WHITE_IMG }, on_click: 'onDockBtnClick', indexData: 3 } }), id: uuid(), pageId: '', order: 2, visible: true, offset_x: 0, offset_y: 0, layout_align: 'TOP_LEFT', rotation: 0, x: 0, y: 0, updatedAt: 0 } as ThemeElement,
        { ...imgBtn('dock_btn_performance', { props: { states: { released: WHITE_IMG }, on_click: 'onDockBtnClick', indexData: 4 } }), id: uuid(), pageId: '', order: 3, visible: true, offset_x: 0, offset_y: 0, layout_align: 'TOP_LEFT', rotation: 0, x: 0, y: 0, updatedAt: 0 } as ThemeElement,
        { ...imgBtn('dock_btn_settings', { props: { states: { released: WHITE_IMG }, on_click: 'onDockBtnClick', indexData: 5 } }), id: uuid(), pageId: '', order: 4, visible: true, offset_x: 0, offset_y: 0, layout_align: 'TOP_LEFT', rotation: 0, x: 0, y: 0, updatedAt: 0 } as ThemeElement,
      ],
    },
  },
  {
    name: 'dock_clock_label',
    type: 'label',
    props: { font: FONT, color: '0x000000', text: '25:00', text_align: 'CENTER', width: 80, height: 20, split_by_space: false, time_format: '' },
  },
]

const DEFAULTS: Record<PageType, DefaultElement[]> = {
  home: HOME_ELEMENTS,
  music: MUSIC_ELEMENTS,
  clock: CLOCK_ELEMENTS,
  clock_timeup: CLOCK_TIMEUP_ELEMENTS,
  monitor: MONITOR_ELEMENTS,
  key: KEY_ELEMENTS,
  dock: DOCK_ELEMENTS,
}

export async function populateDefaultElements(
  themeId: string,
  pageIdMap: Map<PageType, string>,
): Promise<void> {
  for (const [pageType, elements] of Object.entries(DEFAULTS) as [PageType, DefaultElement[]][]) {
    const pageId = pageIdMap.get(pageType)
    if (!pageId) continue
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i]
      await dbElements.addElement(pageId, el.name, el.type, el.props as any, {
        offset_x: el.offset_x ?? 0,
        offset_y: el.offset_y ?? 0,
        layout_align: el.layout_align ?? 'TOP_LEFT',
      })
    }
  }
}

// ─── Default assets ───

let cachedWhiteImage: Blob | null = null

function createWhiteImage(): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 480
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 480, 480)
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}

let cachedFont: Blob | null = null

async function downloadFont(): Promise<Blob> {
  if (cachedFont) return cachedFont
  const resp = await fetch('/fonts/NotoSansSC-Regular.ttf')
  cachedFont = await resp.blob()
  return cachedFont
}

export async function createDefaultAssets(themeId: string): Promise<void> {
  // White image
  if (!cachedWhiteImage) {
    cachedWhiteImage = await createWhiteImage()
  }
  const whiteFile = new File([cachedWhiteImage], 'white_bg.png', { type: 'image/png' })
  await dbAssets.addAsset(themeId, WHITE_IMG, whiteFile)

  // Default font (TTF)
  try {
    const fontBlob = await downloadFont()
    const fontFile = new File([fontBlob], 'NotoSansSC-Regular.ttf', { type: 'font/ttf' })
    await dbAssets.addAsset(themeId, FONT, fontFile)
  } catch {
    // Font download failed (offline, etc.) — skip, user can upload later
  }
}
