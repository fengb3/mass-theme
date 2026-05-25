export const SCREEN_WIDTH = 480;
export const SCREEN_HEIGHT = 480;

export type PageName =
  | 'home_page_style'
  | 'music_page_style'
  | 'clock_page_style'
  | 'clock_timeup_style'
  | 'monitor_page_style'
  | 'key_page_style'
  | 'dock_style';

export const PAGE_NAMES: PageName[] = [
  'home_page_style',
  'music_page_style',
  'clock_page_style',
  'clock_timeup_style',
  'monitor_page_style',
  'key_page_style',
  'dock_style',
];

export const PAGE_LABELS: Record<PageName, string> = {
  home_page_style: '首页',
  music_page_style: '音乐',
  clock_page_style: '计时器',
  clock_timeup_style: '计时结束',
  monitor_page_style: '监控',
  key_page_style: '按键',
  dock_style: '导航栏',
};

export const PAGE_FILE_MAP: Record<PageName, string> = {
  home_page_style: 'home_page_style.json',
  music_page_style: 'music_page_style.json',
  clock_page_style: 'clock_page_style.json',
  clock_timeup_style: 'clock_timeup_style.json',
  monitor_page_style: 'monitor_page_style.json',
  key_page_style: 'key_page_style.json',
  dock_style: 'dock_style.json',
};

export type LayoutAlign =
  | 'TOP_LEFT'
  | 'TOP_MID'
  | 'TOP_RIGHT'
  | 'LEFT_MID'
  | 'CENTER'
  | 'RIGHT_MID'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_MID'
  | 'BOTTOM_RIGHT';

export type TextAlign = 'LEFT' | 'CENTER' | 'RIGHT';

export type FlexDirection = 'row' | 'column' | 'row_wrap';
export type FlexAlign = 'start' | 'center' | 'end' | 'space_between' | 'space_around' | 'space_evenly';

export interface Asset {
  name: string;
  src: string;
}

export interface BaseElement {
  name: string;
  type?: string;
  width?: number | string;
  height?: number | string;
  offset_x?: number;
  offset_y?: number;
  layout_align?: LayoutAlign;
  rotation?: number;
  x?: number;
  y?: number;
}

// --- Element types ---

export interface ImageElement extends BaseElement {
  type: 'img';
  src: string;
}

export interface LabelElement extends BaseElement {
  type: 'label';
  font: string;
  color: string;
  text?: string;
  text_align?: TextAlign;
  split_by_space?: boolean;
  time_format?: string;
}

export interface ImageButtonElement extends BaseElement {
  type: 'imgbtn';
  states: {
    released: string;
    pressed?: string;
    checked?: string;
  };
  runing_states?: {
    released?: string;
    checked?: string;
  };
  on_click?: string;
  indexData?: number;
  elements?: ThemeElement[];
}

export interface BarElement extends BaseElement {
  type: 'bar';
  range_min: number;
  range_max: number;
  value: number;
  direction: 'horizontal' | 'vertical';
  main_color: string;
  indic_color: string;
  radius: number;
  padding: number;
  reversed_value?: boolean;
  on_change?: string;
}

export interface SliderElement extends BaseElement {
  type: 'slider';
  range_min: number;
  range_max: number;
  value: number;
  main_color: string;
  indic_color: string;
  radius: number;
  knob_visible: boolean;
  on_change?: string;
}

export interface ArcElement extends BaseElement {
  type: 'arc';
  range_min: number;
  range_max: number;
  value: number;
  bg_start_angle: number;
  bg_end_angle: number;
  rotation?: number;
  arc_width: number;
  arc_color: string;
  bg_arc_color: string;
}

export interface ClockElement extends BaseElement {
  type: 'clock';
  marking_color: string;
  marking_color_opa: number;
  marking_length: number;
  marking_width: number;
}

export interface ClockStripElement extends BaseElement {
  type: 'clock_strip';
  marking_color: string;
  marking_color_opa: number;
  marking_spacing: number;
  big_width: number;
  big_height: number;
  small_width: number;
  small_height: number;
  big_loop: number;
  step: number;
}

export interface MjpegElement extends BaseElement {
  type: 'mjpeg';
  src?: string;
}

export interface ContainerElement extends BaseElement {
  type: 'container';
  layout?: 'flex';
  flex_direction?: FlexDirection;
  flex_align?: FlexAlign;
  flex_gap?: number;
  bg_img?: string;
  bg_color?: string;
  bg_opa?: number;
  radius?: number;
  elements?: ThemeElement[];
}

export type ThemeElement =
  | ImageElement
  | LabelElement
  | ImageButtonElement
  | BarElement
  | SliderElement
  | ArcElement
  | ClockElement
  | ClockStripElement
  | MjpegElement
  | ContainerElement;

export interface ThemePage {
  comment?: string;
  main_cont: { bg_color: string };
  image_assets: Asset[];
  font_assets: Asset[];
  elements: ThemeElement[];
}

export interface Theme {
  name: string;
  pages: Partial<Record<PageName, ThemePage>>;
}

// Required element names per page (from Themes_CN.md section 7)
export const REQUIRED_ELEMENTS: Record<PageName, string[]> = {
  home_page_style: ['homebg', 'time_label', 'week_label'],
  music_page_style: ['cover', 'play_btn', 'song_title', 'artist_name', 'musicSlider'],
  clock_page_style: ['clockpage_bg', 'play_btn'],
  clock_timeup_style: ['timeup_time', 'timeup_text', 'timeup_goback'],
  monitor_page_style: ['cpu_percent_arc', 'cpu_percent_label'],
  key_page_style: [],
  dock_style: ['dock_container_big'],
};

export const EVENT_CALLBACKS = [
  'onDockBtnClick',
  'onVolumeBarChange',
  'onLightBarChange',
  'switchPlayPause',
  'onMusicSliderChange',
  'goPrev',
  'goNext',
  'switchClockPause',
  'goBackToClockPage',
  'on_pomodoro_add_click',
  'on_pomodoro_sub_click',
  'onVirtualKeyClick',
] as const;

export type EventCallback = (typeof EVENT_CALLBACKS)[number];
