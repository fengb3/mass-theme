// Ported from previewer.html FONT_MAP
const FONT_MAP: [RegExp, string, number][] = [
  [/flynnmono/, "'JetBrains Mono', monospace", 700],
  [/alexandria.*bold/, "'Alexandria', sans-serif", 700],
  [/alexandria.*medium/, "'Alexandria', sans-serif", 500],
  [/alexandria.*light/, "'Alexandria', sans-serif", 300],
  [/alexandria.*regular/, "'Alexandria', sans-serif", 400],
  [/alexandria/, "'Alexandria', sans-serif", 400],
  [/jetbrainsmono.*light/, "'JetBrains Mono', monospace", 300],
  [/jetbrainsmono.*regular/, "'JetBrains Mono', monospace", 400],
  [/jetbrainsmono/, "'JetBrains Mono', monospace", 400],
  [/oswald.*medium/, "'Oswald', sans-serif", 500],
  [/oswald.*light/, "'Oswald', sans-serif", 300],
  [/oswald/, "'Oswald', sans-serif", 400],
  [/bigshouldersstencildisplay/, "'Big Shoulders Stencil Display', sans-serif", 400],
  [/montserrat/, "'Montserrat', sans-serif", 500],
  [/sourcehan.*cn/, "'Noto Sans SC', sans-serif", 700],
  [/technology/, "'Big Shoulders Stencil Display', monospace", 400],
  [/music/, "'Noto Sans SC', sans-serif", 400],
  [/^24-all/, "'Noto Sans SC', sans-serif", 400],
  [/^36-all/, "'Noto Sans SC', sans-serif", 400],
];

export interface FontInfo {
  family: string;
  size: number;
  weight: number;
}

export function resolveFont(binSrc: string): FontInfo {
  if (!binSrc) return { family: 'sans-serif', size: 16, weight: 400 };
  const m = binSrc.match(/([^/]+)\.bin$/i);
  const name = m ? m[1].toLowerCase() : '';
  const sizeM = name.match(/[-_](\d+)/);
  const size = sizeM ? parseInt(sizeM[1]) : 16;
  for (const [re, family, weight] of FONT_MAP) {
    if (re.test(name)) return { family, size, weight };
  }
  return { family: 'sans-serif', size, weight: 400 };
}

export function resolveFontByName(name: string): FontInfo {
  if (!name) return { family: 'sans-serif', size: 16, weight: 400 };
  const sizeM = name.match(/(\d+)/);
  const size = sizeM ? parseInt(sizeM[1]) : 16;
  const lower = name.toLowerCase();
  for (const [re, family, weight] of FONT_MAP) {
    if (re.test(lower)) return { family, size, weight };
  }
  return { family: 'sans-serif', size, weight: 400 };
}

const DEFAULT_TEXT_MAP: Record<string, string> = {
  time_label: '12:30',
  week_label: 'WED',
  volume_percent_label: '50%',
  volume_label: 'VOLUME',
  light_percent_label: '50%',
  light_label: 'LIGHT',
  song_title: 'Song Title',
  artist_name: 'Artist Name',
  time_clock_label: '05:00',
  timeup_time: '00:00',
  timeup_text: "Time's Up!",
  cpu_percent_label: '65%',
  cpu_temp_label: '50°C',
  cpu_clock_label: '5500MHz',
  memory_label: '75%',
  network_up_label: '0.0 KB/s',
  network_down_label: '0.0 KB/s',
  dock_clock_label: '00:00',
};

export function getDefaultText(name: string): string {
  return DEFAULT_TEXT_MAP[name] || `[${name}]`;
}

export function formatCurrentTime(): string {
  const now = new Date();
  return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

export function formatCurrentWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}
