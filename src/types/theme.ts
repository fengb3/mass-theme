// ─── Theme ───
export interface Theme {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  thumbnail: Blob | null
}

// ─── Page ───
export type PageType =
  | 'home'
  | 'music'
  | 'clock'
  | 'clock_timeup'
  | 'monitor'
  | 'key'
  | 'dock'

export const PAGE_TYPES: PageType[] = [
  'home', 'music', 'clock', 'clock_timeup', 'monitor', 'key', 'dock',
]

export const PAGE_LABELS: Record<PageType, string> = {
  home: '首页',
  music: '音乐',
  clock: '计时器',
  clock_timeup: '计时结束',
  monitor: '监控',
  key: '按键',
  dock: '导航栏',
}

export const PAGE_FILENAMES: Record<PageType, string> = {
  home: 'home_page_style.json',
  music: 'music_page_style.json',
  clock: 'clock_page_style.json',
  clock_timeup: 'clock_timeup_style.json',
  monitor: 'monitor_page_style.json',
  key: 'key_page_style.json',
  dock: 'dock_style.json',
}

export interface Page {
  id: string
  themeId: string
  pageType: PageType
  comment: string | null
  main_cont: { bg_color?: string } | null
  updatedAt: number
}

// ─── Element ───
export type ElementType =
  | 'img' | 'label' | 'imgbtn' | 'bar' | 'slider' | 'arc'
  | 'clock' | 'clock_strip' | 'mjpeg' | 'container'

export type LayoutAlign =
  | 'TOP_LEFT' | 'TOP_MID' | 'TOP_RIGHT'
  | 'LEFT_MID' | 'CENTER' | 'RIGHT_MID'
  | 'BOTTOM_LEFT' | 'BOTTOM_MID' | 'BOTTOM_RIGHT'

export interface ImgProps {
  src: string
  width: number
  height: number
}

export interface LabelProps {
  font: string
  color: string
  text: string
  text_align: 'LEFT' | 'CENTER' | 'RIGHT'
  width: number
  height: number
  split_by_space: boolean
  time_format: string
}

export interface ImgbtnProps {
  states: {
    released: string
    pressed?: string
    checked?: string
  }
  runing_states?: {
    released?: string
    checked?: string
  }
  on_click?: string
  indexData?: number
  elements?: ThemeElement[]
}

export interface BarProps {
  range_min: number
  range_max: number
  value: number
  direction: 'horizontal' | 'vertical'
  main_color: string
  indic_color: string
  radius: number
  padding: number
  reversed_value: boolean
  on_change?: string
}

export interface SliderProps {
  range_min: number
  range_max: number
  value: number
  main_color: string
  indic_color: string
  radius: number
  knob_visible: boolean
  on_change?: string
}

export interface ArcProps {
  range_min: number
  range_max: number
  value: number
  bg_start_angle: number
  bg_end_angle: number
  rotation: number
  arc_width: number
  arc_color: string
  bg_arc_color: string
}

export interface ClockProps {
  width: number
  height: number
  marking_color: string
  marking_color_opa: number
  marking_length: number
  marking_width: number
}

export interface ClockStripProps {
  marking_color: string
  marking_color_opa: number
  marking_spacing: number
  big_width: number
  big_height: number
  small_width: number
  small_height: number
  big_loop: number
  step: number
}

export interface MjpegProps {
  src: string
  width: number
  height: number
}

export interface ContainerProps {
  width: number | 'content'
  height: number | 'content'
  layout: 'flex'
  flex_direction: 'row' | 'column' | 'row_wrap'
  flex_align: 'start' | 'center' | 'end' | 'space_between' | 'space_around' | 'space_evenly'
  flex_gap: number
  bg_img?: string
  bg_color?: string
  bg_opa?: number
  radius?: number
  elements: ThemeElement[]
}

export type ElementProps =
  | ImgProps | LabelProps | ImgbtnProps | BarProps | SliderProps
  | ArcProps | ClockProps | ClockStripProps | MjpegProps | ContainerProps

export interface ThemeElement {
  id: string
  pageId: string
  name: string
  type: ElementType
  order: number
  visible: boolean
  offset_x: number
  offset_y: number
  layout_align: LayoutAlign
  rotation: number
  x: number
  y: number
  props: ElementProps
  updatedAt: number
}

// ─── Asset ───
export type AssetType = 'image' | 'font' | 'video'

export interface Asset {
  id: string
  themeId: string
  name: string
  type: AssetType
  mimeType: string
  file: Blob
  updatedAt: number
}

// ─── JSON format (keyboard) ───
export interface ThemeJsonImageAsset {
  name: string
  src: string
}

export interface ThemeJsonFontAsset {
  name: string
  src: string
}

export interface ThemeJsonPage {
  comment?: string
  main_cont?: { bg_color?: string }
  image_assets: ThemeJsonImageAsset[]
  font_assets: ThemeJsonFontAsset[]
  elements: ThemeJsonElement[]
}

export interface ThemeJsonElement {
  name: string
  type: string
  width?: number
  height?: number
  offset_x?: number
  offset_y?: number
  layout_align?: string
  rotation?: number
  x?: number
  y?: number
  [key: string]: unknown
}
