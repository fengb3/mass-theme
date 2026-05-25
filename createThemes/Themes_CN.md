# MWKEYS Mass 80主题制作指南

## 一、主题目录结构

每个主题是 `/sdcard/themes/<主题名>/` 下的一个文件夹，包含以下内容：

```
/sdcard/themes/MyTheme/
├── home_page_style.json        # 首页样式（必需）
├── music_page_style.json       # 音乐页样式（必需）
├── clock_page_style.json       # 计时器页样式（必需）
├── clock_timeup_style.json     # 计时结束页样式（必需）
├── monitor_page_style.json     # 性能监控页样式（必需）
├── key_page_style.json         # 虚拟按键页样式（必需）
├── dock_style.json             # 底部导航栏样式（必需）
├── home/                       # 首页图片资源
├── music/                      # 音乐页图片资源
├── clock/                      # 计时器页图片资源
├── monitor/                    # 监控页图片资源
├── dock/                       # 导航栏图片资源
└── fonts/                      # 主题专用字体
```

还需要在 `/sdcard/themes/setting_theme/` 放一张 `<主题名>.jpg` 作为主题选择页的预览图，大小为320*320

以及 `/sdcard/themes/pin_<主题名>.bin` 作为 PogoPin 连接时的预览图（480×480 RGB565 BIN）。

---

## 二、图片资源格式 (.bin)

使用 `封面制作` 工具将 PNG/GIF 转换为 BIN 格式。

### BIN 文件头（12字节）

| 偏移 | 大小 | 说明                                      |
| ---- | ---- | ----------------------------------------- |
| 0x00 | 4B   | Magic: `ARG8`(ARGB8888) 或 `RGB5`(RGB565) |
| 0x04 | 2B   | 宽度 (uint16)                             |
| 0x06 | 2B   | 高度 (uint16)                             |
| 0x08 | 2B   | 帧数 (uint16)                             |
| 0x0A | 2B   | 保留                                      |

头部之后紧跟 4 字节 delay + 像素数据。

- **RGB565**: 每像素 2 字节，适合背景等不需要透明度的图片
- **ARGB8888**: 每像素 4 字节，适合需要透明度的图标

### MJPEG 视频 (.avi)

支持标准 AVI 容器封装的 MJPEG 视频，用于动态壁纸。解码为 RGB565。

---

## 三、字体资源 (.bin)

使用 `lv_font_conv` 工具生成 LVGL 兼容的二进制字体文件：

```bash
lv_font_conv --bpp 4 --size 32 --font MyFont.ttf \
  -r 0x20-0x7E --format bin -o myfont-32.bin
```

## 四、JSON 文件通用结构

每个页面的 JSON 文件遵循统一格式：

```json
{
    "comment": "页面说明（可选，不影响渲染）",
    "main_cont": {
        "bg_color": "0x000000"
    },
    "image_assets": [ ... ],
    "font_assets": [ ... ],
    "elements": [ ... ]
}
```

### 4.1 `main_cont`（预留字段）

目前仅做记录用途，实际背景色由 `elements` 中的背景图控制。

### 4.2 `image_assets` — 图片资源声明

```json
{
    "name": "资源引用名",
    "src": "/sdcard/themes/MyTheme/home/bg.bin"
}
```

- `name`: 在 `elements` 中通过此名称引用
- `src`: SD卡上的绝对路径，支持 `.bin` 和 `.avi`

### 4.3 `font_assets` — 字体资源声明

```json
{
    "name": "字体引用名",
    "src": "/sdcard/themes/MyTheme/fonts/myfont-32.bin"
}
```

### 4.4 `elements` — UI 元素数组

所有 UI 元素的有序数组，**后面的元素绘制在前面元素之上**（z-order）。

---

## 五、通用属性（所有元素类型共享）

| 属性           | 类型   | 必需 | 说明                                           |
| -------------- | ------ | ---- | ---------------------------------------------- |
| `name`         | string | ✅    | 元素唯一标识名（系统通过此名称查找和更新元素） |
| `type`         | string | ✅    | 元素类型                                       |
| `width`        | number | 否   | 宽度（像素）                                   |
| `height`       | number | 否   | 高度（像素）                                   |
| `offset_x`     | number | 否   | X 偏移量                                       |
| `offset_y`     | number | 否   | Y 偏移量                                       |
| `layout_align` | string | 否   | 对齐方式，默认 `TOP_LEFT`                      |
| `rotation`     | number | 否   | 旋转角度（单位 0.1°，如 900=90°）              |
| `x`            | number | 否   | translate_x 平移偏移                           |
| `y`            | number | 否   | translate_y 平移偏移                           |

### `layout_align` 可选值

`TOP_LEFT` `TOP_MID` `TOP_RIGHT` `LEFT_MID` `CENTER` `RIGHT_MID` `BOTTOM_LEFT` `BOTTOM_MID` `BOTTOM_RIGHT`

---

## 六、元素类型详解

### 6.1 `img` — 图片

显示静态图片。

| 属性     | 类型   | 说明                                                  |
| -------- | ------ | ----------------------------------------------------- |
| `src`    | string | 引用 `image_assets` 中的 name；空字符串 `""` 表示占位 |
| `width`  | number | 显示宽度（可覆盖 BIN 头部尺寸）                       |
| `height` | number | 显示高度                                              |

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

### 6.2 `label` — 文本标签

| 属性             | 类型   | 说明                                                              |
| ---------------- | ------ | ----------------------------------------------------------------- |
| `font`           | string | 字体名（引用 `font_assets` 的 name 或内置字体名）                 |
| `color`          | string | 文字颜色，`"0xFFFFFF"` 或 `"#FFFFFF"`                             |
| `text`           | string | 默认文本                                                          |
| `text_align`     | string | 文本对齐：`LEFT` / `CENTER` / `RIGHT`                             |
| `width`          | number | 文本区域宽度（像素），用于 `text_align` 居中/右对齐时控制基准宽度 |
| `height`         | number | 文本区域高度（像素）                                              |
| `split_by_space` | bool   | 是否按空格拆分为双行（如 `"Page Up"` → 两行显示）                 |
| `time_format`    | string | 仅 name=`time_label` 时有效，自定义时间格式字符串                 |

> 注意：文本溢出时自动按字符截断（`LV_LABEL_LONG_CLIP`），不会换行。Label 默认不响应点击，事件会穿透到下层。

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

### 6.3 `imgbtn` — 图片按钮

| 属性                     | 类型   | 说明                                                 |
| ------------------------ | ------ | ---------------------------------------------------- |
| `states`                 | object | 各状态图片                                           |
| `states.released`        | string | 默认状态图片资源名                                   |
| `states.pressed`         | string | 按下状态图片资源名（可选）                           |
| `states.checked`         | string | 选中状态图片资源名（可选，设置后自动启用 checkable） |
| `runing_states`          | object | 运行态图片（可选）                                   |
| `runing_states.released` | string | 运行中默认图片                                       |
| `runing_states.checked`  | string | 运行中选中图片                                       |
| `on_click`               | string | 点击事件回调名                                       |
| `indexData`              | number | 传给回调的索引数据                                   |
| `elements`               | array  | 子元素数组（可选，如在按钮上叠加 label）             |

宽高由图片自动决定，JSON 中的 `width`/`height` 会被忽略。

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

### 6.4 `bar` — 进度条

| 属性             | 类型   | 说明                                   |
| ---------------- | ------ | -------------------------------------- |
| `range_min`      | number | 最小值                                 |
| `range_max`      | number | 最大值                                 |
| `value`          | number | 当前值                                 |
| `direction`      | string | `"horizontal"`（默认）或 `"vertical"`  |
| `main_color`     | string | 背景颜色（`"transparent"` 表示透明）   |
| `indic_color`    | string | 指示器颜色（`"transparent"` 表示透明） |
| `radius`         | number | 圆角半径                               |
| `padding`        | number | 内边距                                 |
| `reversed_value` | bool   | 是否反向值传递                         |
| `on_change`      | string | 值变化事件回调名                       |

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

### 6.5 `slider` — 滑块

| 属性           | 类型   | 说明                       |
| -------------- | ------ | -------------------------- |
| `range_min`    | number | 最小值                     |
| `range_max`    | number | 最大值                     |
| `value`        | number | 当前值                     |
| `main_color`   | string | 轨道背景色                 |
| `indic_color`  | string | 指示器颜色                 |
| `radius`       | number | 圆角半径                   |
| `knob_visible` | bool   | 是否显示旋钮（false 隐藏） |
| `on_change`    | string | 值变化事件回调名           |

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

### 6.6 `arc` — 圆弧

| 属性             | 类型   | 说明           |
| ---------------- | ------ | -------------- |
| `range_min`      | number | 最小值         |
| `range_max`      | number | 最大值         |
| `value`          | number | 当前值         |
| `bg_start_angle` | number | 背景弧起始角度 |
| `bg_end_angle`   | number | 背景弧结束角度 |
| `rotation`       | number | 旋转偏移角度   |
| `arc_width`      | number | 弧线宽度       |
| `arc_color`      | string | 指示器弧颜色   |
| `bg_arc_color`   | string | 背景弧颜色     |

旋钮默认隐藏，不可点击。

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

### 6.7 `clock` — 圆环刻度表盘

用于计时器页面的圆环旋转刻度。

| 属性                | 类型   | 默认值       | 说明                       |
| ------------------- | ------ | ------------ | -------------------------- |
| `width`             | number | 480          | 表盘区域宽度               |
| `height`            | number | 480          | 表盘区域高度               |
| `marking_color`     | string | `"0xFFFFFF"` | 刻度颜色                   |
| `marking_color_opa` | number | 50           | 刻度透明度（0-100 百分比） |
| `marking_length`    | number | 100          | 刻度线长度                 |
| `marking_width`     | number | 6            | 刻度线宽度                 |

自动生成 24 条等距刻度线，可通过代码旋转。

### 6.8 `clock_strip` — 横向条形刻度

用于计时器页面的水平滚动刻度。

| 属性                | 类型   | 默认值       | 说明                       |
| ------------------- | ------ | ------------ | -------------------------- |
| `marking_color`     | string | `"0xFFFFFF"` | 刻度颜色                   |
| `marking_color_opa` | number | 50           | 透明度（0-100%）           |
| `marking_spacing`   | number | 22           | 刻度间距                   |
| `big_width`         | number | 59           | 大刻度宽度                 |
| `big_height`        | number | 2            | 大刻度高度                 |
| `small_width`       | number | 30           | 小刻度宽度                 |
| `small_height`      | number | 2            | 小刻度高度                 |
| `big_loop`          | number | 6            | 每几个小刻度出现一个大刻度 |
| `step`              | number | 6            | 每秒滚动像素数             |

默认对齐方式为 `CENTER`（垂直居中）。

### 6.9 `mjpeg` — MJPEG 视频播放

| 属性     | 类型   | 说明                                                           |
| -------- | ------ | -------------------------------------------------------------- |
| `src`    | string | 引用 `image_assets` 中的 AVI 资源名（空或缺省则创建空 canvas） |
| `width`  | number | 显示宽度（默认取 AVI 元数据或 480）                            |
| `height` | number | 显示高度（默认取 AVI 元数据或 480）                            |

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

### 6.10 `container` — Flex 容器

用于将多个子元素组织为 Flex 布局。

| 属性             | 类型          | 说明                                                                             |
| ---------------- | ------------- | -------------------------------------------------------------------------------- |
| `width`          | number/string | 宽度，可为数字或 `"content"`                                                     |
| `height`         | number/string | 高度，可为数字或 `"content"`                                                     |
| `layout`         | string        | 布局模式，目前仅支持 `"flex"`                                                    |
| `flex_direction` | string        | `"row"` / `"column"` / `"row_wrap"`                                              |
| `flex_align`     | string        | `"start"` `"center"` `"end"` `"space_between"` `"space_around"` `"space_evenly"` |
| `flex_gap`       | number        | 子元素间距                                                                       |
| `bg_img`         | string        | 背景图片资源名（平铺显示）                                                       |
| `bg_color`       | string        | 背景色（无 bg_img 时生效）                                                       |
| `bg_opa`         | number        | 背景透明度 (0-255)，有 bg_color 时默认 255                                       |
| `radius`         | number        | 圆角半径（无 bg_img 时生效）                                                     |
| `elements`       | array         | 子元素数组                                                                       |

容器内的子元素由 Flex 自动排列，`offset_x`/`offset_y` 会被忽略。

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

## 七、各页面必需元素名

系统通过固定的 `name` 查找和动态更新 UI 元素，以下名称**不可更改**：

### 7.1 `home_page_style.json`

| 元素名                 | 类型  | 用途                                |
| ---------------------- | ----- | ----------------------------------- |
| `homebg`               | img   | 静态壁纸（src 可为空，由系统填充）  |
| `homebg_mjpeg`         | mjpeg | 动态壁纸                            |
| `time_label`           | label | 时间显示（支持 `time_format` 属性） |
| `week_label`           | label | 星期显示                            |
| `muted_icon`           | img   | 静音图标（可选，默认隐藏）          |
| `caps_icon`            | img   | 大写锁定图标（可选，默认隐藏）      |
| `music_icon_home`      | img   | 音乐播放中图标（可选，默认隐藏）    |
| `muted_msg`            | img   | 静音提示图（可选，默认隐藏）        |
| `homebg_blur`          | img   | 模糊背景（音量/亮度调节时显示）     |
| `volume_bar`           | bar   | 音量条                              |
| `volume_icon`          | img   | 音量图标（可选）                    |
| `volume_percent_label` | label | 音量百分比                          |
| `volume_label`         | label | "VOLUME" 标签                       |
| `light_bar`            | bar   | 亮度条                              |
| `light_icon`           | img   | 亮度图标（可选）                    |
| `light_percent_label`  | label | 亮度百分比                          |
| `light_label`          | label | "LIGHT" 标签                        |

#### 互斥状态指示器模式（可选高级特性）

如果在 `elements` 中定义了名为 `status_display` 的 `img` 元素，系统会启用**互斥指示器模式**，用一个位置切换显示不同状态图标，替代多图标分散显示。需在 `image_assets` 中额外声明：

| 图片资源名       | 用途                 |
| ---------------- | -------------------- |
| `status_default` | 默认状态图片         |
| `status_caps`    | 大写锁定时显示的图片 |
| `status_muted`   | 静音时显示的图片     |
| `status_music`   | 音乐播放时显示的图片 |

### 7.2 `music_page_style.json`

| 元素名        | 类型   | 用途                                   |
| ------------- | ------ | -------------------------------------- |
| `cover`       | img    | 专辑封面（src 可为空，由系统动态填充） |
| `play_btn`    | imgbtn | 播放/暂停按钮                          |
| `song_title`  | label  | 歌曲名                                 |
| `artist_name` | label  | 艺术家名                               |
| `musicSlider` | slider | 播放进度条                             |

**可选事件**: `switchPlayPause`, `onMusicSliderChange`, `goPrev`, `goNext`

### 7.3 `clock_page_style.json`

| 元素名                         | 类型              | 用途                 |
| ------------------------------ | ----------------- | -------------------- |
| `clockpage_bg`                 | img               | 计时器页背景图       |
| `clock_scale` 或 `clock_strip` | clock/clock_strip | 计时器刻度（二选一） |
| `time_clock_label`             | label             | 倒计时时间显示       |
| `play_btn`                     | imgbtn            | 开始/暂停按钮        |
| `start_line`                   | img               | 起点标记线（可选）   |

**可选事件**: `switchClockPause`, `on_pomodoro_add_click`, `on_pomodoro_sub_click`

### 7.4 `clock_timeup_style.json`

| 元素名          | 类型   | 用途         |
| --------------- | ------ | ------------ |
| `timeup_time`   | label  | 计时完成时间 |
| `timeup_text`   | label  | 提示文本     |
| `timeup_goback` | imgbtn | 返回按钮     |

**事件**: `goBackToClockPage`

### 7.5 `monitor_page_style.json`

| 元素名               | 类型  | 用途           |
| -------------------- | ----- | -------------- |
| `cpu_percent_arc`    | arc   | CPU 使用率圆弧 |
| `cpu_percent_label`  | label | CPU 百分比文字 |
| `cpu_temp_bar`       | bar   | CPU 温度条     |
| `cpu_temp_label`     | label | CPU 温度文字   |
| `cpu_clock_bar`      | bar   | CPU 频率条     |
| `cpu_clock_label`    | label | CPU 频率文字   |
| `memory_bar`         | bar   | 内存使用条     |
| `memory_label`       | label | 内存百分比文字 |
| `network_up_icon`    | img   | 上传图标       |
| `network_up_label`   | label | 上传速度       |
| `network_down_icon`  | img   | 下载图标       |
| `network_down_label` | label | 下载速度       |

### 7.6 `key_page_style.json`

| 元素名                      | 类型   | 用途         |
| --------------------------- | ------ | ------------ |
| `key1` ~ `key9`             | imgbtn | 9 个虚拟按键 |
| `key1_title` ~ `key9_title` | label  | 按键标题文字 |

**事件**: `onVirtualKeyClick`（通过 `indexData` 0-8 区分）

### 7.7 `dock_style.json`

| 元素名                 | 类型      | 用途                                          |
| ---------------------- | --------- | --------------------------------------------- |
| `dock_container_big`   | container | Dock 栏外层容器（系统用于显示/隐藏整个 dock） |
| `dock_btn_home`        | imgbtn    | 首页按钮 (indexData=1)                        |
| `dock_btn_music`       | imgbtn    | 音乐按钮 (indexData=2)                        |
| `dock_btn_pomodoro`    | imgbtn    | 番茄钟按钮 (indexData=3)                      |
| `dock_btn_performance` | imgbtn    | 监控按钮 (indexData=4)                        |
| `dock_btn_settings`    | imgbtn    | 设置按钮 (indexData=5)                        |
| `dock_clock_label`     | label     | 番茄钟倒计时（pomodoro 子元素）               |

**事件**: `onDockBtnClick`

---

## 八、可用事件回调名

| 事件名                  | 触发方式  | 用途              |
| ----------------------- | --------- | ----------------- |
| `onDockBtnClick`        | on_click  | Dock 导航按钮点击 |
| `onVolumeBarChange`     | on_change | 音量条拖动        |
| `onLightBarChange`      | on_change | 亮度条拖动        |
| `switchPlayPause`       | on_click  | 音乐播放/暂停     |
| `onMusicSliderChange`   | on_change | 音乐进度拖动      |
| `goPrev`                | on_click  | 上一曲            |
| `goNext`                | on_click  | 下一曲            |
| `switchClockPause`      | on_click  | 计时器开始/暂停   |
| `goBackToClockPage`     | on_click  | 从计时结束返回    |
| `on_pomodoro_add_click` | on_click  | 增加番茄钟时间    |
| `on_pomodoro_sub_click` | on_click  | 减少番茄钟时间    |
| `onVirtualKeyClick`     | on_click  | 虚拟按键点击      |

---

## 九、颜色格式

支持两种写法：
- `"0xRRGGBB"` — 如 `"0xFF0000"` 红色
- `"#RRGGBB"` — 如 `"#FF0000"` 红色

Bar 的 `main_color`/`indic_color` 还支持 `"transparent"` 表示完全透明。

---

## 十、注意事项

1. **屏幕尺寸**: 480×480 像素方形屏幕
2. **资源名长度限制**: 最大 31 字符
3. **资源数量限制**: 单页最多 64 个资源、100 个元素、32 个事件
4. **imgbtn 数量限制**: 单页最多 32 个图片按钮
5. **MJPEG 播放器限制**: 全局最多 4 个同时播放
6. **元素顺序**: 数组中后面的元素在上层（Z-order 越大越前）
7. **Flex 容器中的定位**: 子元素的 `offset_x`/`offset_y` 会被忽略
8. **字体复用**: 如果路径与系统字体相同，会自动复用不重复加载
9. **所有路径使用 `/sdcard/` 前缀**
10. **key_page_style.json 可跨主题共享**，放在 `/sdcard/themes/key/` 公共目录下
11. **内存控制**: 总内存最大 32M，如果您想要使用更多资源，请留意日志文件中显示的内存使用情况，防止因内存不足导致系统无法分配资源无限重启
12. **主题分类**: 主题分为 “内置主题” 和 “自定义主题”。您创建的仅会出现在 “自定义主题” 中，无法切换到内置主题
