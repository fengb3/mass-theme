# MWKEYS Mass 80 テーマ作成ガイド

## 1. テーマのディレクトリ構造

各テーマは `/sdcard/themes/<テーマ名>/` 下のフォルダであり、以下の内容が含まれます：

```
/sdcard/themes/MyTheme/
├── home_page_style.json        # ホーム画面スタイル（必須）
├── music_page_style.json       # 音楽画面スタイル（必須）
├── clock_page_style.json       # タイマー画面スタイル（必須）
├── clock_timeup_style.json     # タイマー終了画面スタイル（必須）
├── monitor_page_style.json     # パフォーマンスモニター画面スタイル（必須）
├── key_page_style.json         # 仮想キー画面スタイル（必須）
├── dock_style.json             # 下部ナビゲーションバースタイル（必須）
├── home/                       # ホーム画面の画像リソース
├── music/                      # 音楽画面の画像リソース
├── clock/                      # タイマー画面の画像リソース
├── monitor/                    # モニター画面の画像リソース
├── dock/                       # ナビゲーションバーの画像リソース
└── fonts/                      # テーマ専用フォント
```

また、テーマ選択画面のプレビュー画像として、サイズ320*320の `<テーマ名>.jpg` を `/sdcard/themes/setting_theme/` に配置する必要があります。

さらに、PogoPin接続時のプレビュー画像として、`/sdcard/themes/pin_<テーマ名>.bin` （480×480 RGB565 BIN）も必要です。

---

## 2. 画像リソースのフォーマット (.bin)

`封面制作` ツールを使用してPNG/GIFをBINフォーマットに変換します。

### BIN ファイルヘッダー (12バイト)

| オフセット | サイズ | 説明                                                     |
| ---------- | ------ | -------------------------------------------------------- |
| 0x00       | 4B     | マジックナンバー: `ARG8`(ARGB8888) または `RGB5`(RGB565) |
| 0x04       | 2B     | 幅 (uint16)                                              |
| 0x06       | 2B     | 高さ (uint16)                                            |
| 0x08       | 2B     | フレーム数 (uint16)                                      |
| 0x0A       | 2B     | 予約                                                     |

ヘッダーの直後には、4バイトのdelay + ピクセルデータが続きます。

- **RGB565**: 1ピクセルあたり2バイト。背景などの透明度を必要としない画像に適しています。
- **ARGB8888**: 1ピクセルあたり4バイト。透明度を必要とするアイコンに適しています。

### MJPEG 動画 (.avi)

標準のAVIコンテナにラップされたMJPEG動画をサポートし、ダイナミック壁紙として使用します。RGB565にデコードされます。

---

## 3. フォントリソース (.bin)

`lv_font_conv` ツールを使用して、LVGL互換のバイナリフォントファイルを生成します：

```bash
lv_font_conv --bpp 4 --size 32 --font MyFont.ttf \
  -r 0x20-0x7E --format bin -o myfont-32.bin
```

---

## 4. JSON ファイルの汎用構造

各画面のJSONファイルは統一された形式に従います：

```json
{
    "comment": "ページの説明（オプション、レンダリングには影響しません）",
    "main_cont": {
        "bg_color": "0x000000"
    },
    "image_assets": [ ... ],
    "font_assets": [ ... ],
    "elements": [ ... ]
}
```

### 4.1 `main_cont`（予約フィールド）

現在は記録目的にのみ使用され、実際の背景色は `elements` 内の背景画像によって制御されます。

### 4.2 `image_assets` — 画像リソースの宣言

```json
{
    "name": "リソース参照名",
    "src": "/sdcard/themes/MyTheme/home/bg.bin"
}
```

- `name`: `elements` でこの名前を使用して参照します
- `src`: SDカード上の絶対パス。`.bin` および `.avi` をサポートします

### 4.3 `font_assets` — フォントリソースの宣言

```json
{
    "name": "フォント参照名",
    "src": "/sdcard/themes/MyTheme/fonts/myfont-32.bin"
}
```

### 4.4 `elements` — UI 要素配列

すべてのUI要素の順序付き配列であり、**配列の後の要素は前の要素の上に描画されます**（Zオーダー）。

---

## 5. 共通プロパティ（すべての要素タイプで共有）

| プロパティ     | タイプ | 必須 | 説明                                                             |
| -------------- | ------ | ---- | ---------------------------------------------------------------- |
| `name`         | string | ✅    | 要素の一意の識別名（システムはこの名前で要素を検索・更新します） |
| `type`         | string | ✅    | 要素のタイプ                                                     |
| `width`        | number | 否   | 幅（ピクセル）                                                   |
| `height`       | number | 否   | 高さ（ピクセル）                                                 |
| `offset_x`     | number | 否   | X オフセット                                                     |
| `offset_y`     | number | 否   | Y オフセット                                                     |
| `layout_align` | string | 否   | 配置。デフォルトは `TOP_LEFT`                                    |
| `rotation`     | number | 否   | 回転角度（0.1°単位、例: 900=90°）                                |
| `x`            | number | 否   | translate_x 平行移動オフセット                                   |
| `y`            | number | 否   | translate_y 平行移動オフセット                                   |

### `layout_align` のオプション値

`TOP_LEFT` `TOP_MID` `TOP_RIGHT` `LEFT_MID` `CENTER` `RIGHT_MID` `BOTTOM_LEFT` `BOTTOM_MID` `BOTTOM_RIGHT`

---

## 6. 要素タイプの詳細

### 6.1 `img` — 画像

静止画像を表示します。

| プロパティ | タイプ | 説明                                                                        |
| ---------- | ------ | --------------------------------------------------------------------------- |
| `src`      | string | `image_assets` 内のnameを参照；空の文字列 `""` はプレースホルダーを示します |
| `width`    | number | 表示幅（BINヘッダーのサイズを上書き可能）                                   |
| `height`   | number | 表示高さ                                                                    |

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

### 6.2 `label` — テキストラベル

| プロパティ       | タイプ | 説明                                                                                         |
| ---------------- | ------ | -------------------------------------------------------------------------------------------- |
| `font`           | string | フォント名（`font_assets` のnameまたは組み込みフォント名を参照）                             |
| `color`          | string | 文字色、`"0xFFFFFF"` または `"#FFFFFF"`                                                      |
| `text`           | string | デフォルトのテキスト                                                                         |
| `text_align`     | string | テキストの配置：`LEFT` / `CENTER` / `RIGHT`                                                  |
| `width`          | number | テキスト領域の幅（ピクセル）。`text_align` の中央/右配置の基準幅を制御するために使用されます |
| `height`         | number | テキスト領域の高さ（ピクセル）                                                               |
| `split_by_space` | bool   | スペースで2行に分割するかどうか（例: `"Page Up"` → 2行表示）                                 |
| `time_format`    | string | name=`time_label` の場合のみ有効。カスタムの時刻形式文字列                                   |

**組み込みフォント名**（`font_assets` での宣言は不要）: `montserrat_8` `montserrat_10` `montserrat_12` `montserrat_14` `montserrat_16` `montserrat_18` `montserrat_20` `montserrat_22` `montserrat_24` `montserrat_28` `montserrat_32` `montserrat_36` `montserrat_40` `montserrat_48`

> 注意：テキストがオーバーフローした場合、文字ごとに自動で切り捨てられ（`LV_LABEL_LONG_CLIP`）、改行はされません。Labelはデフォルトでクリックに反応せず、イベントは下のレイヤーに透過します。

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

### 6.3 `imgbtn` — 画像ボタン

| プロパティ               | タイプ | 説明                                                                                |
| ------------------------ | ------ | ----------------------------------------------------------------------------------- |
| `states`                 | object | 各状態の画像                                                                        |
| `states.released`        | string | デフォルト状態の画像リソース名                                                      |
| `states.pressed`         | string | 押下状態の画像リソース名（オプション）                                              |
| `states.checked`         | string | 選択状態の画像リソース名（オプション。設定すると自動的にcheckableが有効になります） |
| `runing_states`          | object | 実行状態の画像（オプション）                                                        |
| `runing_states.released` | string | 実行中のデフォルト画像                                                              |
| `runing_states.checked`  | string | 実行中の選択画像                                                                    |
| `on_click`               | string | クリックイベントコールバック名                                                      |
| `indexData`              | number | コールバックに渡されるインデックスデータ                                            |
| `elements`               | array  | 子要素の配列（オプション、ボタン上にラベルを重ねる場合など）                        |

幅と高さは画像から自動的に決定され、JSON内の `width`/`height` は無視されます。

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

### 6.4 `bar` — プログレスバー

| プロパティ       | タイプ | 説明                                                         |
| ---------------- | ------ | ------------------------------------------------------------ |
| `range_min`      | number | 最小値                                                       |
| `range_max`      | number | 最大値                                                       |
| `value`          | number | 現在値                                                       |
| `direction`      | string | `"horizontal"`（デフォルト）または `"vertical"`              |
| `main_color`     | string | 背景色（`"transparent"` は完全な透明を示します）             |
| `indic_color`    | string | インジケーターの色（`"transparent"` は完全な透明を示します） |
| `radius`         | number | 角丸の半径                                                   |
| `padding`        | number | パディング（内側の余白）                                     |
| `reversed_value` | bool   | 値の方向を反転させるかどうか                                 |
| `on_change`      | string | 値変更イベントのコールバック名                               |

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

### 6.5 `slider` — スライダー

| プロパティ     | タイプ | 説明                                    |
| -------------- | ------ | --------------------------------------- |
| `range_min`    | number | 最小値                                  |
| `range_max`    | number | 最大値                                  |
| `value`        | number | 現在値                                  |
| `main_color`   | string | トラックの背景色                        |
| `indic_color`  | string | インジケーターの色                      |
| `radius`       | number | 角丸の半径                              |
| `knob_visible` | bool   | ノブを表示するかどうか（falseで非表示） |
| `on_change`    | string | 値変更イベントのコールバック名          |

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

### 6.6 `arc` — 円弧

| プロパティ       | タイプ | 説明                   |
| ---------------- | ------ | ---------------------- |
| `range_min`      | number | 最小値                 |
| `range_max`      | number | 最大値                 |
| `value`          | number | 現在値                 |
| `bg_start_angle` | number | 背景円弧の開始角度     |
| `bg_end_angle`   | number | 背景円弧の終了角度     |
| `rotation`       | number | 回転オフセット角度     |
| `arc_width`      | number | 円弧の幅               |
| `arc_color`      | string | インジケーター円弧の色 |
| `bg_arc_color`   | string | 背景円弧の色           |

ノブはデフォルトで非表示であり、クリックできません。

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

### 6.7 `clock` — 円形目盛りダイヤル

タイマー画面の円形回転目盛りに使用されます。

| プロパティ          | タイプ | デフォルト値 | 説明                                 |
| ------------------- | ------ | ------------ | ------------------------------------ |
| `width`             | number | 480          | ダイヤル領域の幅                     |
| `height`            | number | 480          | ダイヤル領域の高さ                   |
| `marking_color`     | string | `"0xFFFFFF"` | 目盛りの色                           |
| `marking_color_opa` | number | 50           | 目盛りの不透明度（0〜100パーセント） |
| `marking_length`    | number | 100          | 目盛り線の長さ                       |
| `marking_width`     | number | 6            | 目盛り線の幅                         |

24本の等間隔の目盛り線が自動的に生成され、コードから回転させることができます。

### 6.8 `clock_strip` — 水平ストリップ目盛り

タイマー画面の水平スクロール目盛りに使用されます。

| プロパティ          | タイプ | デフォルト値 | 説明                                       |
| ------------------- | ------ | ------------ | ------------------------------------------ |
| `marking_color`     | string | `"0xFFFFFF"` | 目盛りの色                                 |
| `marking_color_opa` | number | 50           | 不透明度（0-100%）                         |
| `marking_spacing`   | number | 22           | 目盛りの間隔                               |
| `big_width`         | number | 59           | 大目盛りの幅                               |
| `big_height`        | number | 2            | 大目盛りの高さ                             |
| `small_width`       | number | 30           | 小目盛りの幅                               |
| `small_height`      | number | 2            | 小目盛りの高さ                             |
| `big_loop`          | number | 6            | いくつの小目盛りごとに大目盛りを表示するか |
| `step`              | number | 6            | 1秒あたりのスクロールピクセル数            |

デフォルトの配置は `CENTER`（垂直中央）です。

### 6.9 `mjpeg` — MJPEG 動画再生

| プロパティ | タイプ | 説明                                                                           |
| ---------- | ------ | ------------------------------------------------------------------------------ |
| `src`      | string | `image_assets` 内のAVIリソース名を参照（空または省略時は空のキャンバスを作成） |
| `width`    | number | 表示幅（デフォルトはAVIのメタデータまたは480）                                 |
| `height`   | number | 表示高さ（デフォルトはAVIのメタデータまたは480）                               |

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

### 6.10 `container` — Flex コンテナ

複数の子要素をFlexレイアウトとして編成するために使用されます。

| プロパティ       | タイプ        | 説明                                                                             |
| ---------------- | ------------- | -------------------------------------------------------------------------------- |
| `width`          | number/string | 幅。数値または `"content"` を指定可能                                            |
| `height`         | number/string | 高さ。数値または `"content"` を指定可能                                          |
| `layout`         | string        | レイアウトモード。現在は `"flex"` のみサポート                                   |
| `flex_direction` | string        | `"row"` / `"column"` / `"row_wrap"`                                              |
| `flex_align`     | string        | `"start"` `"center"` `"end"` `"space_between"` `"space_around"` `"space_evenly"` |
| `flex_gap`       | number        | 子要素間の間隔                                                                   |
| `bg_img`         | string        | 背景画像リソース名（タイル表示）                                                 |
| `bg_color`       | string        | 背景色（bg_imgがない場合に有効）                                                 |
| `bg_opa`         | number        | 背景の不透明度（0-255）。bg_colorがある場合はデフォルトで255                     |
| `radius`         | number        | 角丸の半径（bg_imgがない場合に有効）                                             |
| `elements`       | array         | 子要素の配列                                                                     |

コンテナ内の子要素はFlexによって自動的に配置され、`offset_x`/`offset_y` は無視されます。

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

## 7. 各画面の必須要素名

システムは固定の `name` を通じてUI要素を検索し動的に更新します。以下の名前は**変更できません**：

### 7.1 `home_page_style.json`

| 要素名                 | タイプ | 用途                                                   |
| ---------------------- | ------ | ------------------------------------------------------ |
| `homebg`               | img    | 静的壁紙（srcは空でも可。システムが自動で埋めます）    |
| `homebg_mjpeg`         | mjpeg  | ダイナミック壁紙                                       |
| `time_label`           | label  | 時間表示（`time_format` プロパティをサポート）         |
| `week_label`           | label  | 曜日表示                                               |
| `muted_icon`           | img    | ミュートアイコン（オプション、デフォルト非表示）       |
| `caps_icon`            | img    | Caps Lockアイコン（オプション、デフォルト非表示）      |
| `music_icon_home`      | img    | 音楽再生中アイコン（オプション、デフォルト非表示）     |
| `muted_msg`            | img    | ミュートメッセージ画像（オプション、デフォルト非表示） |
| `homebg_blur`          | img    | ぼかし背景（音量/明るさ調整時に表示）                  |
| `volume_bar`           | bar    | 音量バー                                               |
| `volume_icon`          | img    | 音量アイコン（オプション）                             |
| `volume_percent_label` | label  | 音量パーセンテージ                                     |
| `volume_label`         | label  | "VOLUME" ラベル                                        |
| `light_bar`            | bar    | 明るさバー                                             |
| `light_icon`           | img    | 明るさアイコン（オプション）                           |
| `light_percent_label`  | label  | 明るさパーセンテージ                                   |
| `light_label`          | label  | "LIGHT" ラベル                                         |

#### 排他的ステータスインジケーターモード（オプションの高度な機能）

`elements` 内に `status_display` という名前の `img` 要素が定義されている場合、システムは**排他的インジケーターモード**を有効にし、複数のアイコンを分散させるのではなく、一つの位置で異なる状態アイコンを切り替えて表示します。`image_assets` で以下を追加宣言する必要があります：

| 画像リソース名   | 用途                        |
| ---------------- | --------------------------- |
| `status_default` | デフォルト状態の画像        |
| `status_caps`    | Caps Lock時に表示される画像 |
| `status_muted`   | ミュート時に表示される画像  |
| `status_music`   | 音楽再生時に表示される画像  |

### 7.2 `music_page_style.json`

| 要素名        | タイプ | 用途                                                      |
| ------------- | ------ | --------------------------------------------------------- |
| `cover`       | img    | アルバムカバー（srcは空でも可。システムが動的に埋めます） |
| `play_btn`    | imgbtn | 再生/一時停止ボタン                                       |
| `song_title`  | label  | 曲名                                                      |
| `artist_name` | label  | アーティスト名                                            |
| `musicSlider` | slider | 再生プログレスバー                                        |

**オプションのイベント**: `switchPlayPause`, `onMusicSliderChange`, `goPrev`, `goNext`

### 7.3 `clock_page_style.json`

| 要素名                             | タイプ            | 用途                               |
| ---------------------------------- | ----------------- | ---------------------------------- |
| `clockpage_bg`                     | img               | タイマー画面の背景画像             |
| `clock_scale` または `clock_strip` | clock/clock_strip | タイマーの目盛り（どちらかを選択） |
| `time_clock_label`                 | label             | カウントダウン時間の表示           |
| `play_btn`                         | imgbtn            | 開始/一時停止ボタン                |
| `start_line`                       | img               | 開始マーカー線（オプション）       |

**オプションのイベント**: `switchClockPause`, `on_pomodoro_add_click`, `on_pomodoro_sub_click`

### 7.4 `clock_timeup_style.json`

| 要素名          | タイプ | 用途               |
| --------------- | ------ | ------------------ |
| `timeup_time`   | label  | タイマー完了時間   |
| `timeup_text`   | label  | プロンプトテキスト |
| `timeup_goback` | imgbtn | 戻るボタン         |

**イベント**: `goBackToClockPage`

### 7.5 `monitor_page_style.json`

| 要素名               | タイプ | 用途                           |
| -------------------- | ------ | ------------------------------ |
| `cpu_percent_arc`    | arc    | CPU使用率の円弧                |
| `cpu_percent_label`  | label  | CPUパーセンテージのテキスト    |
| `cpu_temp_bar`       | bar    | CPU温度バー                    |
| `cpu_temp_label`     | label  | CPU温度のテキスト              |
| `cpu_clock_bar`      | bar    | CPU周波数バー                  |
| `cpu_clock_label`    | label  | CPU周波数のテキスト            |
| `memory_bar`         | bar    | メモリ使用量バー               |
| `memory_label`       | label  | メモリパーセンテージのテキスト |
| `network_up_icon`    | img    | アップロードアイコン           |
| `network_up_label`   | label  | アップロード速度               |
| `network_down_icon`  | img    | ダウンロードアイコン           |
| `network_down_label` | label  | ダウンロード速度               |

### 7.6 `key_page_style.json`

| 要素名                         | タイプ | 用途                   |
| ------------------------------ | ------ | ---------------------- |
| `key1` から `key9`             | imgbtn | 9つの仮想キー          |
| `key1_title` から `key9_title` | label  | キーのタイトルテキスト |

**イベント**: `onVirtualKeyClick`（`indexData` 0〜8で区別）

### 7.7 `dock_style.json`

| 要素名                 | タイプ    | 用途                                                                              |
| ---------------------- | --------- | --------------------------------------------------------------------------------- |
| `dock_container_big`   | container | Dockバーの外側のコンテナ（システムがDock全体を表示/非表示にするために使用します） |
| `dock_btn_home`        | imgbtn    | ホームボタン (indexData=1)                                                        |
| `dock_btn_music`       | imgbtn    | 音楽ボタン (indexData=2)                                                          |
| `dock_btn_pomodoro`    | imgbtn    | ポモドーロボタン (indexData=3)                                                    |
| `dock_btn_performance` | imgbtn    | モニターボタン (indexData=4)                                                      |
| `dock_btn_settings`    | imgbtn    | 設定ボタン (indexData=5)                                                          |
| `dock_clock_label`     | label     | ポモドーロのカウントダウン（pomodoro の子要素）                                   |

**イベント**: `onDockBtnClick`

---

## 8. 利用可能なイベントコールバック名

| イベント名              | トリガー方法 | 用途                               |
| ----------------------- | ------------ | ---------------------------------- |
| `onDockBtnClick`        | on_click     | Dockナビゲーションボタンのクリック |
| `onVolumeBarChange`     | on_change    | 音量バーのドラッグ                 |
| `onLightBarChange`      | on_change    | 明るさバーのドラッグ               |
| `switchPlayPause`       | on_click     | 音楽の再生/一時停止                |
| `onMusicSliderChange`   | on_change    | 音楽プログレスバーのドラッグ       |
| `goPrev`                | on_click     | 前の曲へ                           |
| `goNext`                | on_click     | 次の曲へ                           |
| `switchClockPause`      | on_click     | タイマーの開始/一時停止            |
| `goBackToClockPage`     | on_click     | タイマー終了画面から戻る           |
| `on_pomodoro_add_click` | on_click     | ポモドーロの時間を増やす           |
| `on_pomodoro_sub_click` | on_click     | ポモドーロの時間を減らす           |
| `onVirtualKeyClick`     | on_click     | 仮想キーのクリック                 |

---

## 9. 色の形式

2つの記述方法をサポートしています：
- `"0xRRGGBB"` — 例：`"0xFF0000"`（赤）
- `"#RRGGBB"` — 例：`"#FF0000"`（赤）

Bar の `main_color`/`indic_color` は、完全に透明であることを示す `"transparent"` もサポートしています。

---

## 10. 注意事項

1. **画面サイズ**: 480×480 ピクセルの正方形画面
2. **リソース名の長さ制限**: 最大 31 文字
3. **リソース数の制限**: 1ページあたり最大 64 個のリソース、100 個の要素、32 個のイベント
4. **imgbtn の数制限**: 1ページあたり最大 32 個の画像ボタン
5. **MJPEG プレーヤーの制限**: グローバルで最大 4 つの同時再生
6. **要素の順序**: 配列の後の要素が上のレイヤーになります（Zオーダーが大きいほど手前になります）
7. **Flex コンテナ内の配置**: 子要素の `offset_x`/`offset_y` は無視されます
8. **フォントの再利用**: パスがシステムフォントと同じ場合、自動的に再利用され、重複して読み込まれることはありません
9. **すべてのパスには `/sdcard/` プレフィックスを使用します**
10. **key_page_style.json はテーマ間で共有可能** であり、`/sdcard/themes/key/` 共有ディレクトリに配置されます
11. **メモリ制御**: 最大総メモリは32MBです。より多くのリソースを使用したい場合は、メモリ不足によるシステムリソース割り当て不可と無限再起動を防ぐため、ログファイルに表示されるメモリ使用量に注意してください
12. **テーマの分類**: テーマは「組み込みテーマ」と「カスタムテーマ」に分かれています。あなたが作成したものは「カスタムテーマ」にのみ表示され、組み込みテーマに切り替えることはできません
