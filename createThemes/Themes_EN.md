# MWKEYS Mass 80 Theme Creation Guide

## 1. Theme Directory Structure

Each theme is a folder under `/sdcard/themes/<theme_name>/`, containing the following contents:

```
/sdcard/themes/MyTheme/
├── home_page_style.json        # Home page style (Required)
├── music_page_style.json       # Music page style (Required)
├── clock_page_style.json       # Timer page style (Required)
├── clock_timeup_style.json     # Timer end page style (Required)
├── monitor_page_style.json     # Performance monitor page style (Required)
├── key_page_style.json         # Virtual keys page style (Required)
├── dock_style.json             # Bottom navigation bar style (Required)
├── home/                       # Home page image resources
├── music/                      # Music page image resources
├── clock/                      # Timer page image resources
├── monitor/                    # Monitor page image resources
├── dock/                       # Navigation bar image resources
└── fonts/                      # Theme specific fonts
```

A preview image named `<theme_name>.jpg` with a size of 320*320 is also required in `/sdcard/themes/setting_theme/` for the theme selection page.

Also, `/sdcard/themes/pin_<theme_name>.bin` is needed as a preview image when connecting via PogoPin (480×480 RGB565 BIN).

---

## 2. Image Resource Format (.bin)

Use the `Cover Maker` (`封面制作`) tool to convert PNG/GIF to BIN format.

### BIN File Header (12 bytes)

| Offset | Size | Description                                 |
| ------ | ---- | ------------------------------------------- |
| 0x00   | 4B   | Magic: `ARG8` (ARGB8888) or `RGB5` (RGB565) |
| 0x04   | 2B   | Width (uint16)                              |
| 0x06   | 2B   | Height (uint16)                             |
| 0x08   | 2B   | Number of frames (uint16)                   |
| 0x0A   | 2B   | Reserved                                    |

The header is immediately followed by 4 bytes of delay + pixel data.

- **RGB565**: 2 bytes per pixel, suitable for images without transparency such as backgrounds.
- **ARGB8888**: 4 bytes per pixel, suitable for icons that require transparency.

### MJPEG Video (.avi)

Supports MJPEG video wrapped in a standard AVI container, used for dynamic wallpapers. Decoded as RGB565.

---

## 3. Font Resources (.bin)

Use the `lv_font_conv` tool to generate an LVGL compatible binary font file:

```bash
lv_font_conv --bpp 4 --size 32 --font MyFont.ttf \
  -r 0x20-0x7E --format bin -o myfont-32.bin
```

---

## 4. General JSON File Structure

The JSON file for each page follows a unified format:

```json
{
    "comment": "Page description (Optional, does not affect rendering)",
    "main_cont": {
        "bg_color": "0x000000"
    },
    "image_assets": [ ... ],
    "font_assets": [ ... ],
    "elements": [ ... ]
}
```

### 4.1 `main_cont` (Reserved field)

Currently only for recording purposes; the actual background color is controlled by the background image in `elements`.

### 4.2 `image_assets` — Image resource declaration

```json
{
    "name": "Resource reference name",
    "src": "/sdcard/themes/MyTheme/home/bg.bin"
}
```

- `name`: Referenced in `elements` by this name
- `src`: Absolute path on the SD card, supports `.bin` and `.avi`

### 4.3 `font_assets` — Font resource declaration

```json
{
    "name": "Font reference name",
    "src": "/sdcard/themes/MyTheme/fonts/myfont-32.bin"
}
```

### 4.4 `elements` — UI elements array

An ordered array of all UI elements, **elements later in the array are drawn on top of earlier elements** (z-order).

---

## 5. Common Properties (Shared by all element types)

| Property       | Type   | Required | Description                                                                               |
| -------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| `name`         | string | ✅        | Unique identifier for the element (the system uses this name to find and update elements) |
| `type`         | string | ✅        | Element type                                                                              |
| `width`        | number | No       | Width (pixels)                                                                            |
| `height`       | number | No       | Height (pixels)                                                                           |
| `offset_x`     | number | No       | X offset                                                                                  |
| `offset_y`     | number | No       | Y offset                                                                                  |
| `layout_align` | string | No       | Alignment, defaults to `TOP_LEFT`                                                         |
| `rotation`     | number | No       | Rotation angle (in 0.1°, e.g., 900=90°)                                                   |
| `x`            | number | No       | translate_x translation offset                                                            |
| `y`            | number | No       | translate_y translation offset                                                            |

### `layout_align` Options

`TOP_LEFT` `TOP_MID` `TOP_RIGHT` `LEFT_MID` `CENTER` `RIGHT_MID` `BOTTOM_LEFT` `BOTTOM_MID` `BOTTOM_RIGHT`

---

## 6. Element Types Explained

### 6.1 `img` — Image

Displays a static image.

| Property | Type   | Description                                                                |
| -------- | ------ | -------------------------------------------------------------------------- |
| `src`    | string | References name in `image_assets`; empty string `""` acts as a placeholder |
| `width`  | number | Display width (can override BIN header size)                               |
| `height` | number | Display height                                                             |

```json
{
    "name": "homebg",
    "type": "img",
    "src": "homebg",
    "width": 480,
    "height": 480,
    "offset_x": 0,
    "offset_y": 0
}
```

### 6.2 `label` — Text Label

| Property         | Type   | Description                                                                            |
| ---------------- | ------ | -------------------------------------------------------------------------------------- |
| `font`           | string | Font name (references name in `font_assets` or a built-in font name)                   |
| `color`          | string | Text color, `"0xFFFFFF"` or `"#FFFFFF"`                                                |
| `text`           | string | Default text                                                                           |
| `text_align`     | string | Text alignment: `LEFT` / `CENTER` / `RIGHT`                                            |
| `width`          | number | Text area width (pixels), used to control the base width for `text_align` center/right |
| `height`         | number | Text area height (pixels)                                                              |
| `split_by_space` | bool   | Whether to split into two lines by space (e.g., `"Page Up"` → two lines)               |
| `time_format`    | string | Only valid when name=`time_label`, custom time format string                           |

**Built-in font names** (no need to declare in `font_assets`): `montserrat_8` `montserrat_10` `montserrat_12` `montserrat_14` `montserrat_16` `montserrat_18` `montserrat_20` `montserrat_22` `montserrat_24` `montserrat_28` `montserrat_32` `montserrat_36` `montserrat_40` `montserrat_48`

> Note: Text automatically truncates by character when overflowing (`LV_LABEL_LONG_CLIP`), without line wrapping. Label does not respond to clicks by default, events will penetrate to the underlying layer.

```json
{
    "name": "time_label",
    "type": "label",
    "font": "timefont",
    "color": "0xFFFFFF",
    "layout_align": "TOP_RIGHT",
    "offset_x": -16,
    "offset_y": 21
}
```

### 6.3 `imgbtn` — Image Button

| Property                 | Type   | Description                                                                          |
| ------------------------ | ------ | ------------------------------------------------------------------------------------ |
| `states`                 | object | Images for each state                                                                |
| `states.released`        | string | Default state image resource name                                                    |
| `states.pressed`         | string | Pressed state image resource name (Optional)                                         |
| `states.checked`         | string | Checked state image resource name (Optional, automatically enables checkable if set) |
| `runing_states`          | object | Running state images (Optional)                                                      |
| `runing_states.released` | string | Default image while running                                                          |
| `runing_states.checked`  | string | Checked image while running                                                          |
| `on_click`               | string | Click event callback name                                                            |
| `indexData`              | number | Index data passed to the callback                                                    |
| `elements`               | array  | Child elements array (Optional, e.g., overlaying a label on the button)              |

Width and height are automatically determined by the image, `width`/`height` in JSON will be ignored.

```json
{
    "name": "play_btn",
    "type": "imgbtn",
    "width": 84,
    "height": 84,
    "offset_x": 380,
    "offset_y": 16,
    "states": {
        "released": "btn_play",
        "checked": "btn_pause"
    },
    "on_click": "switchPlayPause"
}
```

### 6.4 `bar` — Progress Bar

| Property         | Type   | Description                                              |
| ---------------- | ------ | -------------------------------------------------------- |
| `range_min`      | number | Minimum value                                            |
| `range_max`      | number | Maximum value                                            |
| `value`          | number | Current value                                            |
| `direction`      | string | `"horizontal"` (default) or `"vertical"`                 |
| `main_color`     | string | Background color (`"transparent"` for fully transparent) |
| `indic_color`    | string | Indicator color (`"transparent"` for fully transparent)  |
| `radius`         | number | Border radius                                            |
| `padding`        | number | Padding                                                  |
| `reversed_value` | bool   | Whether to reverse value direction                       |
| `on_change`      | string | Value change event callback name                         |

```json
{
    "name": "volume_bar",
    "type": "bar",
    "width": 160,
    "height": 408,
    "offset_x": 160,
    "offset_y": 16,
    "range_min": 0,
    "range_max": 100,
    "value": 50,
    "direction": "vertical",
    "main_color": "0x161616",
    "indic_color": "0x3F3F3F",
    "radius": 20,
    "padding": 8,
    "on_change": "onVolumeBarChange"
}
```

### 6.5 `slider` — Slider

| Property       | Type   | Description                              |
| -------------- | ------ | ---------------------------------------- |
| `range_min`    | number | Minimum value                            |
| `range_max`    | number | Maximum value                            |
| `value`        | number | Current value                            |
| `main_color`   | string | Track background color                   |
| `indic_color`  | string | Indicator color                          |
| `radius`       | number | Border radius                            |
| `knob_visible` | bool   | Whether to show the knob (false to hide) |
| `on_change`    | string | Value change event callback name         |

```json
{
    "name": "musicSlider",
    "type": "slider",
    "range_min": 0,
    "range_max": 100,
    "value": 0,
    "knob_visible": false,
    "main_color": "0xD9D9D9",
    "indic_color": "0xFFFFFF",
    "radius": 10,
    "width": 448,
    "height": 12,
    "offset_x": 16,
    "offset_y": 372,
    "on_change": "onMusicSliderChange"
}
```

### 6.6 `arc` — Arc

| Property         | Type   | Description                |
| ---------------- | ------ | -------------------------- |
| `range_min`      | number | Minimum value              |
| `range_max`      | number | Maximum value              |
| `value`          | number | Current value              |
| `bg_start_angle` | number | Background arc start angle |
| `bg_end_angle`   | number | Background arc end angle   |
| `rotation`       | number | Rotation offset angle      |
| `arc_width`      | number | Arc line width             |
| `arc_color`      | string | Indicator arc color        |
| `bg_arc_color`   | string | Background arc color       |

The knob is hidden by default and cannot be clicked.

```json
{
    "name": "cpu_percent_arc",
    "type": "arc",
    "width": 150,
    "height": 150,
    "offset_x": 35,
    "offset_y": 33,
    "range_min": 0,
    "range_max": 100,
    "value": 90,
    "bg_start_angle": 0,
    "bg_end_angle": 360,
    "arc_width": 10,
    "arc_color": "0xFFFFFF",
    "bg_arc_color": "0x3f3f3f"
}
```

### 6.7 `clock` — Circular Scale Dial

Used for circular rotating scales on the timer page.

| Property            | Type   | Default Value | Description                      |
| ------------------- | ------ | ------------- | -------------------------------- |
| `width`             | number | 480           | Dial area width                  |
| `height`            | number | 480           | Dial area height                 |
| `marking_color`     | string | `"0xFFFFFF"`  | Scale color                      |
| `marking_color_opa` | number | 50            | Scale opacity (0-100 percentage) |
| `marking_length`    | number | 100           | Scale line length                |
| `marking_width`     | number | 6             | Scale line width                 |

Automatically generates 24 equidistant scale lines that can be rotated via code.

### 6.8 `clock_strip` — Horizontal Strip Scale

Used for horizontal scrolling scales on the timer page.

| Property            | Type   | Default Value | Description                                |
| ------------------- | ------ | ------------- | ------------------------------------------ |
| `marking_color`     | string | `"0xFFFFFF"`  | Scale color                                |
| `marking_color_opa` | number | 50            | Opacity (0-100%)                           |
| `marking_spacing`   | number | 22            | Scale spacing                              |
| `big_width`         | number | 59            | Big scale width                            |
| `big_height`        | number | 2             | Big scale height                           |
| `small_width`       | number | 30            | Small scale width                          |
| `small_height`      | number | 2             | Small scale height                         |
| `big_loop`          | number | 6             | A big scale appears every few small scales |
| `step`              | number | 6             | Pixels scrolled per second                 |

The default alignment is `CENTER` (vertically centered).

### 6.9 `mjpeg` — MJPEG Video Playback

| Property | Type   | Description                                                                                   |
| -------- | ------ | --------------------------------------------------------------------------------------------- |
| `src`    | string | References AVI resource name in `image_assets` (empty or omitted will create an empty canvas) |
| `width`  | number | Display width (default to AVI metadata or 480)                                                |
| `height` | number | Display height (default to AVI metadata or 480)                                               |

```json
{
    "name": "homebg_mjpeg",
    "type": "mjpeg",
    "src": "homebg_mjpeg",
    "width": 480,
    "height": 480,
    "offset_x": 0,
    "offset_y": 0
}
```

### 6.10 `container` — Flex Container

Used to organize multiple child elements into a Flex layout.

| Property         | Type          | Description                                                                      |
| ---------------- | ------------- | -------------------------------------------------------------------------------- |
| `width`          | number/string | Width, can be a number or `"content"`                                            |
| `height`         | number/string | Height, can be a number or `"content"`                                           |
| `layout`         | string        | Layout mode, currently only supports `"flex"`                                    |
| `flex_direction` | string        | `"row"` / `"column"` / `"row_wrap"`                                              |
| `flex_align`     | string        | `"start"` `"center"` `"end"` `"space_between"` `"space_around"` `"space_evenly"` |
| `flex_gap`       | number        | Spacing between child elements                                                   |
| `bg_img`         | string        | Background image resource name (tiled display)                                   |
| `bg_color`       | string        | Background color (effective when no bg_img is present)                           |
| `bg_opa`         | number        | Background opacity (0-255), defaults to 255 if bg_color is present               |
| `radius`         | number        | Border radius (effective when no bg_img is present)                              |
| `elements`       | array         | Child elements array                                                             |

Child elements within the container are automatically arranged by Flex, `offset_x`/`offset_y` will be ignored.

```json
{
    "name": "dock_container",
    "type": "container",
    "width": "content",
    "height": 50,
    "layout": "flex",
    "flex_direction": "row",
    "flex_align": "start",
    "flex_gap": 20,
    "bg_img": "dock_bg_mid",
    "elements": [ ... ]
}
```

---

## 7. Required Element Names per Page

The system uses fixed `name`s to find and dynamically update UI elements, the following names **cannot be changed**:

### 7.1 `home_page_style.json`

| Element Name           | Type  | Purpose                                                         |
| ---------------------- | ----- | --------------------------------------------------------------- |
| `homebg`               | img   | Static wallpaper (src can be empty, filled by system)           |
| `homebg_mjpeg`         | mjpeg | Dynamic wallpaper                                               |
| `time_label`           | label | Time display (supports `time_format` property)                  |
| `week_label`           | label | Weekday display                                                 |
| `muted_icon`           | img   | Muted icon (Optional, hidden by default)                        |
| `caps_icon`            | img   | Caps lock icon (Optional, hidden by default)                    |
| `music_icon_home`      | img   | Music playing icon (Optional, hidden by default)                |
| `muted_msg`            | img   | Muted message image (Optional, hidden by default)               |
| `homebg_blur`          | img   | Blurred background (displayed when adjusting volume/brightness) |
| `volume_bar`           | bar   | Volume bar                                                      |
| `volume_icon`          | img   | Volume icon (Optional)                                          |
| `volume_percent_label` | label | Volume percentage                                               |
| `volume_label`         | label | "VOLUME" label                                                  |
| `light_bar`            | bar   | Brightness bar                                                  |
| `light_icon`           | img   | Brightness icon (Optional)                                      |
| `light_percent_label`  | label | Brightness percentage                                           |
| `light_label`          | label | "LIGHT" label                                                   |

#### Mutually Exclusive Status Indicator Mode (Optional Advanced Feature)

If an `img` element named `status_display` is defined in `elements`, the system will enable the **mutually exclusive indicator mode**, using a single position to switch and display different status icons, replacing multiple scattered icons. The following must be additionally declared in `image_assets`:

| Image Resource Name | Purpose                               |
| ------------------- | ------------------------------------- |
| `status_default`    | Default status image                  |
| `status_caps`       | Image displayed when caps lock is on  |
| `status_muted`      | Image displayed when muted            |
| `status_music`      | Image displayed when music is playing |

### 7.2 `music_page_style.json`

| Element Name  | Type   | Purpose                                                      |
| ------------- | ------ | ------------------------------------------------------------ |
| `cover`       | img    | Album cover (src can be empty, dynamically filled by system) |
| `play_btn`    | imgbtn | Play/Pause button                                            |
| `song_title`  | label  | Song title                                                   |
| `artist_name` | label  | Artist name                                                  |
| `musicSlider` | slider | Playback progress bar                                        |

**Optional Events**: `switchPlayPause`, `onMusicSliderChange`, `goPrev`, `goNext`

### 7.3 `clock_page_style.json`

| Element Name                   | Type              | Purpose                      |
| ------------------------------ | ----------------- | ---------------------------- |
| `clockpage_bg`                 | img               | Timer page background image  |
| `clock_scale` or `clock_strip` | clock/clock_strip | Timer scale (Choose one)     |
| `time_clock_label`             | label             | Countdown time display       |
| `play_btn`                     | imgbtn            | Start/Pause button           |
| `start_line`                   | img               | Start marker line (Optional) |

**Optional Events**: `switchClockPause`, `on_pomodoro_add_click`, `on_pomodoro_sub_click`

### 7.4 `clock_timeup_style.json`

| Element Name    | Type   | Purpose               |
| --------------- | ------ | --------------------- |
| `timeup_time`   | label  | Timer completion time |
| `timeup_text`   | label  | Prompt text           |
| `timeup_goback` | imgbtn | Back button           |

**Events**: `goBackToClockPage`

### 7.5 `monitor_page_style.json`

| Element Name         | Type  | Purpose                |
| -------------------- | ----- | ---------------------- |
| `cpu_percent_arc`    | arc   | CPU usage arc          |
| `cpu_percent_label`  | label | CPU percentage text    |
| `cpu_temp_bar`       | bar   | CPU temperature bar    |
| `cpu_temp_label`     | label | CPU temperature text   |
| `cpu_clock_bar`      | bar   | CPU frequency bar      |
| `cpu_clock_label`    | label | CPU frequency text     |
| `memory_bar`         | bar   | Memory usage bar       |
| `memory_label`       | label | Memory percentage text |
| `network_up_icon`    | img   | Upload icon            |
| `network_up_label`   | label | Upload speed           |
| `network_down_icon`  | img   | Download icon          |
| `network_down_label` | label | Download speed         |

### 7.6 `key_page_style.json`

| Element Name                 | Type   | Purpose        |
| ---------------------------- | ------ | -------------- |
| `key1` to `key9`             | imgbtn | 9 virtual keys |
| `key1_title` to `key9_title` | label  | Key title text |

**Events**: `onVirtualKeyClick` (Distinguished by `indexData` 0-8)

### 7.7 `dock_style.json`

| Element Name           | Type      | Purpose                                                                |
| ---------------------- | --------- | ---------------------------------------------------------------------- |
| `dock_container_big`   | container | Dock bar outer container (system uses it to show/hide the entire dock) |
| `dock_btn_home`        | imgbtn    | Home button (indexData=1)                                              |
| `dock_btn_music`       | imgbtn    | Music button (indexData=2)                                             |
| `dock_btn_pomodoro`    | imgbtn    | Pomodoro button (indexData=3)                                          |
| `dock_btn_performance` | imgbtn    | Monitor button (indexData=4)                                           |
| `dock_btn_settings`    | imgbtn    | Settings button (indexData=5)                                          |
| `dock_clock_label`     | label     | Pomodoro countdown (child element of pomodoro)                         |

**Events**: `onDockBtnClick`

---

## 8. Available Event Callback Names

| Event Name              | Trigger   | Purpose                        |
| ----------------------- | --------- | ------------------------------ |
| `onDockBtnClick`        | on_click  | Dock navigation button clicked |
| `onVolumeBarChange`     | on_change | Volume bar dragged             |
| `onLightBarChange`      | on_change | Brightness bar dragged         |
| `switchPlayPause`       | on_click  | Music play/pause               |
| `onMusicSliderChange`   | on_change | Music progress dragged         |
| `goPrev`                | on_click  | Previous track                 |
| `goNext`                | on_click  | Next track                     |
| `switchClockPause`      | on_click  | Timer start/pause              |
| `goBackToClockPage`     | on_click  | Return from timer end          |
| `on_pomodoro_add_click` | on_click  | Increase Pomodoro time         |
| `on_pomodoro_sub_click` | on_click  | Decrease Pomodoro time         |
| `onVirtualKeyClick`     | on_click  | Virtual key clicked            |

---

## 9. Color Formats

Two formats are supported:
- `"0xRRGGBB"` — e.g. `"0xFF0000"` Red
- `"#RRGGBB"` — e.g. `"#FF0000"` Red

Bar's `main_color`/`indic_color` also supports `"transparent"` for fully transparent.

---

## 10. Notes

1. **Screen Size**: 480×480 pixels square screen
2. **Resource Name Length Limit**: Max 31 characters
3. **Resource Quantity Limit**: Max 64 resources, 100 elements, 32 events per page
4. **imgbtn Quantity Limit**: Max 32 image buttons per page
5. **MJPEG Player Limit**: Global max 4 playing simultaneously
6. **Element Order**: Elements later in the array are on top (the larger the Z-order, the more front)
7. **Positioning in Flex Container**: Child element's `offset_x`/`offset_y` will be ignored
8. **Font Reuse**: If the path is the same as a system font, it will automatically be reused and not loaded repeatedly
9. **All paths use `/sdcard/` prefix**
10. **key_page_style.json can be shared across themes**, placed in the `/sdcard/themes/key/` public directory
11. **Memory Control**: The maximum total memory is 32M. If you want to use more resources, please pay attention to the memory usage shown in the log file to prevent infinite system restarts due to insufficient memory rendering it unable to allocate resources
12. **Theme Classification**: Themes are divided into "Built-in Themes" and "Custom Themes". The ones you create will only appear in "Custom Themes", and cannot be switched to built-in themes
