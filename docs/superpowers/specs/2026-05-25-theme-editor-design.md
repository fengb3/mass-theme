# MASS 80 Theme Editor Design

## Overview

A React-based theme editor for the MWKEYS Mass 80 keyboard screen (480x480). Supports importing, previewing, editing, and exporting themes. Browser-first with future Electron migration path.

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Storage**: Dexie (IndexedDB)
- **ZIP**: JSZip (import/export)
- **UI Language**: Chinese

## Project Structure

```
web/
├── src/
│   ├── App.tsx                  # Main layout
│   ├── main.tsx
│   ├── index.css
│   │
│   ├── store/
│   │   ├── theme-store.ts       # Theme data, element CRUD, undo/redo
│   │   └── ui-store.ts          # Selected element, current page, UI state
│   │
│   ├── canvas/
│   │   ├── renderer.ts          # Main renderer — iterates elements, delegates to draw functions
│   │   ├── elements/            # Per-type draw functions
│   │   │   ├── img.ts
│   │   │   ├── label.ts
│   │   │   ├── imgbtn.ts
│   │   │   ├── bar.ts
│   │   │   ├── slider.ts
│   │   │   ├── arc.ts
│   │   │   ├── clock.ts
│   │   │   ├── clock-strip.ts
│   │   │   ├── mjpeg.ts
│   │   │   └── container.ts
│   │   └── hit-test.ts          # Reverse z-order hit testing
│   │
│   ├── components/
│   │   ├── CanvasPreview.tsx     # 480x480 canvas + click events
│   │   ├── Sidebar.tsx           # Theme list + page tabs
│   │   ├── PropertyPanel.tsx     # Selected element property form
│   │   ├── ElementTree.tsx       # Element list with z-order controls
│   │   ├── AssetManager.tsx      # Image/font asset management
│   │   └── editors/              # Per-element-type property editors
│   │
│   ├── db/
│   │   ├── index.ts             # Dexie initialization
│   │   ├── themes.ts            # Theme CRUD
│   │   ├── pages.ts             # Page CRUD
│   │   ├── elements.ts          # Element CRUD
│   │   └── assets.ts            # Binary asset storage
│   │
│   ├── utils/
│   │   ├── theme-import.ts      # ZIP import parsing
│   │   ├── theme-export.ts      # ZIP export (original files)
│   │   ├── bin-converter.ts     # Original → BIN (future, install only)
│   │   └── color.ts             # Color format conversion
│   │
│   └── types/
│       ├── theme.ts             # Theme, page, element types
│       └── assets.ts            # Asset types
│
├── public/
├── package.json
└── vite.config.ts
```

## Data Model (IndexedDB)

### `themes` table

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Theme name |
| createdAt | number | Timestamp |
| updatedAt | number | Timestamp |
| thumbnail | Blob | 320x320 JPEG preview |

### `pages` table

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key |
| themeId | string | FK → themes |
| pageType | string | `"home" \| "music" \| "clock" \| "clock_timeup" \| "monitor" \| "key" \| "dock"` |
| comment | string? | Page description |
| main_cont | object? | Reserved field (bg_color etc.) |
| updatedAt | number | Timestamp |

### `elements` table

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key |
| pageId | string | FK → pages |
| name | string | Element identifier (e.g. "homebg", "play_btn") |
| type | string | `"img" \| "label" \| "imgbtn" \| "bar" \| "slider" \| "arc" \| "clock" \| "clock_strip" \| "mjpeg" \| "container"` |
| order | number | Z-order index (higher = rendered on top) |
| visible | boolean | Editor visibility toggle |
| offset_x | number | X offset |
| offset_y | number | Y offset |
| layout_align | string | Alignment, default "TOP_LEFT" |
| rotation | number? | Rotation in 0.1° units |
| x | number? | Translate X |
| y | number? | Translate Y |
| props | object | Type-specific properties (see below) |
| updatedAt | number | Timestamp |

**`props` by element type:**

| Type | props fields |
|------|-------------|
| `img` | `src` (asset name), `width`, `height` |
| `label` | `font` (asset name), `color`, `text`, `text_align`, `width`, `height`, `split_by_space`, `time_format` |
| `imgbtn` | `states` {released, pressed, checked}, `runing_states`, `on_click`, `indexData`, `elements` (children) |
| `bar` | `range_min`, `range_max`, `value`, `direction`, `main_color`, `indic_color`, `radius`, `padding`, `reversed_value`, `on_change` |
| `slider` | `range_min`, `range_max`, `value`, `main_color`, `indic_color`, `radius`, `knob_visible`, `on_change` |
| `arc` | `range_min`, `range_max`, `value`, `bg_start_angle`, `bg_end_angle`, `rotation`, `arc_width`, `arc_color`, `bg_arc_color` |
| `clock` | `width`, `height`, `marking_color`, `marking_color_opa`, `marking_length`, `marking_width` |
| `clock_strip` | `marking_color`, `marking_color_opa`, `marking_spacing`, `big_width`, `big_height`, `small_width`, `small_height`, `big_loop`, `step` |
| `mjpeg` | `src` (asset name), `width`, `height` |
| `container` | `width`, `height`, `layout`, `flex_direction`, `flex_align`, `flex_gap`, `bg_img`, `bg_color`, `bg_opa`, `radius`, `elements` (children) |

Elements reference assets by `name` through `props.src` (img/imgbtn/mjpeg) or `props.font` (label).

### `assets` table

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key |
| themeId | string | FK → themes |
| name | string | Reference name (e.g. "homebg") |
| type | string | `"image" \| "font" \| "video"` |
| mimeType | string | `"image/png" \| "image/gif" \| "font/ttf" \| "video/avi"` |
| file | Blob | Original file binary |
| updatedAt | number | Timestamp |

### Key decisions

- Elements stored as individual rows (not nested in page JSON) for direct CRUD
- Elements reference assets by `name` through `props.src` and `props.font`
- Assets are theme-level (shared across pages), not per-page
- Export derives `image_assets`/`font_assets` declarations from elements at write time
- Assets stored as original files (PNG/GIF/TTF/AVI), no conversion in browser
- BIN conversion happens only at install time

## Canvas Renderer

### Render flow

```
elements[] (z-order, drawn last = topmost)
     │
     ▼
renderer.render(ctx, elements, assets, selectedId)
     │
     ├── Iterate elements, call type-specific draw function
     ├── Selected element gets blue dashed border overlay
     └── Container type: compute flex layout, recurse into children
```

### Per-type drawing strategy

| Type | Canvas API |
|------|-----------|
| `img` | `drawImage()`, gray placeholder when no asset |
| `label` | `fillText()`, FontFace API for custom fonts, system font fallback |
| `imgbtn` | Same as img, state-aware (released/pressed/checked) |
| `bar` | `fillRect()` + `roundRect()` for background and indicator |
| `slider` | Same as bar + optional knob |
| `arc` | `arc()` for background arc + indicator arc |
| `clock` | `rotate()` + `fillRect()` for 24 tick marks |
| `clock_strip` | `fillRect()` for horizontal tick marks |
| `mjpeg` | Frame sequence via `requestAnimationFrame` |
| `container` | Flex layout computation, recursive child rendering |

### Hit testing

- Reverse z-order traversal (topmost first)
- Point-in-rect check against element bounds
- Container elements are selectable as a whole
- Returns element `name` on hit, `null` on miss

### Interaction model

- **Click to select**: click element on canvas → blue dashed border → property panel updates
- **No drag**: position changes happen via property panel inputs only
- **Canvas auto-redraws**: on any store change (zustand subscription)

## UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Toolbar: theme name | import | export | undo | redo         │
├──────────────┬─────────────────────────┬─────────────────────┤
│  Sidebar     │  Preview Area (center)  │  Property Panel     │
│  200px       │                         │  300px              │
│              │   ┌───────────────┐     │                     │
│ [Theme List] │   │               │     │  [Element Form]     │
│              │   │   480 × 480   │     │  offset_x: [___]    │
│ ──────────── │   │   Canvas      │     │  offset_y: [___]    │
│ [Page Tabs]  │   │               │     │  width:   [___]     │
│  Home        │   │               │     │  height:  [___]     │
│  Music       │   └───────────────┘     │  color:   [___]     │
│  Timer       │                         │  ...                │
│  Timer End   │   ┌───────────────┐     │                     │
│  Monitor     │   │ Element List  │     │ ──────────────────  │
│  Keys        │   │ □ homebg      │     │  [Asset Manager]    │
│  Dock        │   │ □ time_label  │     │  Image assets       │
│              │   │ ■ play_btn    │     │  Font assets        │
│              │   └───────────────┘     │                     │
└──────────────┴─────────────────────────┴─────────────────────┘
```

### Editing flow

1. Sidebar → select page → loads page metadata + elements from IndexedDB
2. Canvas renders all elements in real-time
3. Click element on canvas → selected, property panel shows type-specific editor
4. Edit property values → store updates → canvas redraws
5. Element list → click to select, toggle visibility, reorder z-index (up/down)

### Page-specific editors

Each page shows relevant element editors based on Themes_CN.md required element names:

- **Home**: bg, time/week labels, volume/light bars, status icons
- **Music**: cover, play button, song/artist labels, progress slider
- **Timer**: bg, clock/clock_strip (pick one), time label, play button
- **Timer End**: time, text, back button
- **Monitor**: CPU/memory/network arcs + bars + labels
- **Keys**: 9 key buttons + title labels
- **Dock**: container + 5 nav buttons + clock label

## Export Format

ZIP structure with unified assets directory:

```
MyTheme.zip
├── home_page_style.json
├── music_page_style.json
├── clock_page_style.json
├── clock_timeup_style.json
├── monitor_page_style.json
├── key_page_style.json
├── dock_style.json
└── assets/
    ├── homebg.png
    ├── play_btn.png
    ├── timefont.ttf
    └── ...
```

JSON asset paths use unified format:
```json
{
  "image_assets": [
    { "name": "homebg", "src": "/sdcard/themes/MyTheme/assets/homebg.png" }
  ]
}
```

## Import

- Accept ZIP file matching the export format above
- Also accept ZIP with original keyboard format (per-page subdirectories)
- Parse JSON: create page rows, flatten elements into elements table, extract assets
- Derive element-asset references from JSON's `image_assets`/`font_assets` + element `src`/`font` fields
- FontFace API loads custom fonts for canvas rendering

## Future: Install to Keyboard

```
User clicks "Install"
  → Select target device (USB/Bluetooth/PogoPin)
  → Convert assets: PNG/GIF → BIN (RGB565/ARGB8888), TTF → lv_font_conv
  → Reorganize into keyboard directory structure (home/, music/, etc.)
  → Generate pin_<name>.bin preview (480×480 RGB565)
  → Generate <name>.jpg thumbnail (320×320)
  → Write to device filesystem
```

## Future: Electron Migration

- **Storage abstraction**: `db/` encapsulates storage interface. IndexedDB now → Node.js filesystem later. Upper layers unchanged.
- **BIN conversion**: `bin-converter.ts` → call `gif_to_bin.py` or native Node implementation
- **Font compilation**: `lv_font_conv` via child_process
- **File access**: Browser File API + JSZip now → direct filesystem access later
