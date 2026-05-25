# MWKEYS Mass 80 테마 제작 가이드

## 1. 테마 디렉토리 구조

각 테마는 `/sdcard/themes/<테마_이름>/` 아래의 폴더이며, 다음 내용을 포함합니다:

```
/sdcard/themes/MyTheme/
├── home_page_style.json        # 홈 화면 스타일 (필수)
├── music_page_style.json       # 음악 화면 스타일 (필수)
├── clock_page_style.json       # 타이머 화면 스타일 (필수)
├── clock_timeup_style.json     # 타이머 종료 화면 스타일 (필수)
├── monitor_page_style.json     # 성능 모니터 화면 스타일 (필수)
├── key_page_style.json         # 가상 키 화면 스타일 (필수)
├── dock_style.json             # 하단 내비게이션 바 스타일 (필수)
├── home/                       # 홈 화면 이미지 리소스
├── music/                      # 음악 화면 이미지 리소스
├── clock/                      # 타이머 화면 이미지 리소스
├── monitor/                    # 모니터 화면 이미지 리소스
├── dock/                       # 내비게이션 바 이미지 리소스
└── fonts/                      # 테마 전용 폰트
```

또한 테마 선택 화면의 미리보기 이미지로 사용할 크기 320*320의 `<테마_이름>.jpg` 파일이 `/sdcard/themes/setting_theme/` 에 필요합니다.

그리고 PogoPin 연결 시 미리보기 이미지로 사용할 `/sdcard/themes/pin_<테마_이름>.bin` (480×480 RGB565 BIN) 파일도 필요합니다.

---

## 2. 이미지 리소스 형식 (.bin)

`封面制作` 도구를 사용하여 PNG/GIF를 BIN 형식으로 변환합니다.

### BIN 파일 헤더 (12바이트)

| 오프셋 | 크기 | 설명                                            |
| ------ | ---- | ----------------------------------------------- |
| 0x00   | 4B   | 매직 넘버: `ARG8`(ARGB8888) 또는 `RGB5`(RGB565) |
| 0x04   | 2B   | 너비 (uint16)                                   |
| 0x06   | 2B   | 높이 (uint16)                                   |
| 0x08   | 2B   | 프레임 수 (uint16)                              |
| 0x0A   | 2B   | 예약                                            |

헤더 바로 뒤에는 4바이트의 delay + 픽셀 데이터가 옵니다.

- **RGB565**: 픽셀당 2바이트. 배경 등 투명도가 필요 없는 이미지에 적합합니다.
- **ARGB8888**: 픽셀당 4바이트. 투명도가 필요한 아이콘에 적합합니다.

### MJPEG 비디오 (.avi)

다이내믹 배경화면으로 사용되는 표준 AVI 컨테이너에 래핑된 MJPEG 비디오를 지원합니다. RGB565로 디코딩됩니다.

---

## 3. 폰트 리소스 (.bin)

`lv_font_conv` 도구를 사용하여 LVGL 호환 바이너리 폰트 파일을 생성합니다:

```bash
lv_font_conv --bpp 4 --size 32 --font MyFont.ttf \
  -r 0x20-0x7E --format bin -o myfont-32.bin
```

---

## 4. 일반 JSON 파일 구조

각 화면의 JSON 파일은 통일된 형식을 따릅니다:

```json
{
    "comment": "페이지 설명 (선택 사항, 렌더링에 영향 없음)",
    "main_cont": {
        "bg_color": "0x000000"
    },
    "image_assets": [ ... ],
    "font_assets": [ ... ],
    "elements": [ ... ]
}
```

### 4.1 `main_cont` (예약 필드)

현재는 기록용으로만 사용되며, 실제 배경색은 `elements` 내의 배경 이미지로 제어됩니다.

### 4.2 `image_assets` — 이미지 리소스 선언

```json
{
    "name": "리소스 참조 이름",
    "src": "/sdcard/themes/MyTheme/home/bg.bin"
}
```

- `name`: `elements` 에서 이 이름으로 참조합니다.
- `src`: SD 카드의 절대 경로. `.bin` 및 `.avi`를 지원합니다.

### 4.3 `font_assets` — 폰트 리소스 선언

```json
{
    "name": "폰트 참조 이름",
    "src": "/sdcard/themes/MyTheme/fonts/myfont-32.bin"
}
```

### 4.4 `elements` — UI 요소 배열

모든 UI 요소가 순서대로 정렬된 배열입니다. **배열의 뒤에 있는 요소가 앞의 요소 위에 그려집니다** (Z-order).

---

## 5. 공통 속성 (모든 요소 유형 공유)

| 속성           | 유형   | 필수 | 설명                                                                |
| -------------- | ------ | ---- | ------------------------------------------------------------------- |
| `name`         | string | ✅    | 요소의 고유 식별 이름 (시스템은 이 이름으로 요소를 찾고 업데이트함) |
| `type`         | string | ✅    | 요소 유형                                                           |
| `width`        | number | 부   | 너비 (픽셀)                                                         |
| `height`       | number | 부   | 높이 (픽셀)                                                         |
| `offset_x`     | number | 부   | X 오프셋                                                            |
| `offset_y`     | number | 부   | Y 오프셋                                                            |
| `layout_align` | string | 부   | 정렬. 기본값은 `TOP_LEFT`                                           |
| `rotation`     | number | 부   | 회전 각도 (0.1° 단위, 예: 900=90°)                                  |
| `x`            | number | 부   | translate_x 이동 오프셋                                             |
| `y`            | number | 부   | translate_y 이동 오프셋                                             |

### `layout_align` 옵션

`TOP_LEFT` `TOP_MID` `TOP_RIGHT` `LEFT_MID` `CENTER` `RIGHT_MID` `BOTTOM_LEFT` `BOTTOM_MID` `BOTTOM_RIGHT`

---

## 6. 요소 유형 자세히 알아보기

### 6.1 `img` — 이미지

정적 이미지를 표시합니다.

| 속성     | 유형   | 설명                                                                            |
| -------- | ------ | ------------------------------------------------------------------------------- |
| `src`    | string | `image_assets` 의 name을 참조합니다. 빈 문자열 `""`은 자리 표시자를 의미합니다. |
| `width`  | number | 표시 너비 (BIN 헤더의 크기를 재정의할 수 있음)                                  |
| `height` | number | 표시 높이                                                                       |

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

### 6.2 `label` — 텍스트 라벨

| 속성             | 유형   | 설명                                                                                            |
| ---------------- | ------ | ----------------------------------------------------------------------------------------------- |
| `font`           | string | 폰트 이름 (`font_assets` 의 name 또는 내장 폰트 이름 참조)                                      |
| `color`          | string | 텍스트 색상, `"0xFFFFFF"` 또는 `"#FFFFFF"`                                                      |
| `text`           | string | 기본 텍스트                                                                                     |
| `text_align`     | string | 텍스트 정렬: `LEFT` / `CENTER` / `RIGHT`                                                        |
| `width`          | number | 텍스트 영역 너비 (픽셀). `text_align` 가운데/오른쪽 정렬 시 기준 너비를 제어하는 데 사용됩니다. |
| `height`         | number | 텍스트 영역 높이 (픽셀)                                                                         |
| `split_by_space` | bool   | 공백을 기준으로 두 줄로 나눌지 여부 (예: `"Page Up"` → 두 줄로 표시)                            |
| `time_format`    | string | name=`time_label` 인 경우에만 유효. 사용자 지정 시간 형식 문자열                                |

**내장 폰트 이름** (`font_assets` 에 선언할 필요 없음): `montserrat_8` `montserrat_10` `montserrat_12` `montserrat_14` `montserrat_16` `montserrat_18` `montserrat_20` `montserrat_22` `montserrat_24` `montserrat_28` `montserrat_32` `montserrat_36` `montserrat_40` `montserrat_48`

> 주의: 텍스트가 넘칠 경우 문자 단위로 자동 잘리며(`LV_LABEL_LONG_CLIP`), 줄바꿈되지 않습니다. Label은 기본적으로 클릭에 반응하지 않으며 이벤트는 아래 레이어로 통과됩니다.

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

### 6.3 `imgbtn` — 이미지 버튼

| 속성                     | 유형   | 설명                                                                      |
| ------------------------ | ------ | ------------------------------------------------------------------------- |
| `states`                 | object | 각 상태별 이미지                                                          |
| `states.released`        | string | 기본 상태 이미지 리소스 이름                                              |
| `states.pressed`         | string | 눌린 상태 이미지 리소스 이름 (선택 사항)                                  |
| `states.checked`         | string | 선택된 상태 이미지 리소스 이름 (선택 사항. 설정 시 checkable 자동 활성화) |
| `runing_states`          | object | 실행 중 상태 이미지 (선택 사항)                                           |
| `runing_states.released` | string | 실행 중 기본 이미지                                                       |
| `runing_states.checked`  | string | 실행 중 선택된 이미지                                                     |
| `on_click`               | string | 클릭 이벤트 콜백 이름                                                     |
| `indexData`              | number | 콜백에 전달할 인덱스 데이터                                               |
| `elements`               | array  | 하위 요소 배열 (선택 사항, 예: 버튼 위에 라벨 겹치기)                     |

너비와 높이는 이미지에 의해 자동으로 결정되며, JSON의 `width`/`height` 는 무시됩니다.

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

### 6.4 `bar` — 진행률 표시줄

| 속성             | 유형   | 설명                                                       |
| ---------------- | ------ | ---------------------------------------------------------- |
| `range_min`      | number | 최솟값                                                     |
| `range_max`      | number | 최댓값                                                     |
| `value`          | number | 현재 값                                                    |
| `direction`      | string | `"horizontal"`(기본값) 또는 `"vertical"`                   |
| `main_color`     | string | 배경색 (`"transparent"`는 완전히 투명함을 의미함)          |
| `indic_color`    | string | 인디케이터 색상 (`"transparent"`는 완전히 투명함을 의미함) |
| `radius`         | number | 테두리 둥글기 (반경)                                       |
| `padding`        | number | 패딩 (내부 여백)                                           |
| `reversed_value` | bool   | 값의 방향을 반전시킬지 여부                                |
| `on_change`      | string | 값 변경 이벤트 콜백 이름                                   |

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

### 6.5 `slider` — 슬라이더

| 속성           | 유형   | 설명                                  |
| -------------- | ------ | ------------------------------------- |
| `range_min`    | number | 최솟값                                |
| `range_max`    | number | 최댓값                                |
| `value`        | number | 현재 값                               |
| `main_color`   | string | 트랙 배경색                           |
| `indic_color`  | string | 인디케이터 색상                       |
| `radius`       | number | 테두리 둥글기 (반경)                  |
| `knob_visible` | bool   | 노브(손잡이) 표시 여부 (false면 숨김) |
| `on_change`    | string | 값 변경 이벤트 콜백 이름              |

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

### 6.6 `arc` — 원호

| 속성             | 유형   | 설명                  |
| ---------------- | ------ | --------------------- |
| `range_min`      | number | 최솟값                |
| `range_max`      | number | 최댓값                |
| `value`          | number | 현재 값               |
| `bg_start_angle` | number | 배경 원호의 시작 각도 |
| `bg_end_angle`   | number | 배경 원호의 종료 각도 |
| `rotation`       | number | 회전 오프셋 각도      |
| `arc_width`      | number | 원호의 너비           |
| `arc_color`      | string | 인디케이터 원호 색상  |
| `bg_arc_color`   | string | 배경 원호 색상        |

노브는 기본적으로 숨겨져 있으며 클릭할 수 없습니다.

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

### 6.7 `clock` — 원형 눈금 다이얼

타이머 화면의 원형 회전 눈금에 사용됩니다.

| 속성                | 유형   | 기본값       | 설명                       |
| ------------------- | ------ | ------------ | -------------------------- |
| `width`             | number | 480          | 다이얼 영역 너비           |
| `height`            | number | 480          | 다이얼 영역 높이           |
| `marking_color`     | string | `"0xFFFFFF"` | 눈금 색상                  |
| `marking_color_opa` | number | 50           | 눈금 투명도 (0-100 퍼센트) |
| `marking_length`    | number | 100          | 눈금 선 길이               |
| `marking_width`     | number | 6            | 눈금 선 두께               |

24개의 등간격 눈금 선이 자동으로 생성되며, 코드를 통해 회전할 수 있습니다.

### 6.8 `clock_strip` — 가로 스트립 눈금

타이머 화면의 가로 스크롤 눈금에 사용됩니다.

| 속성                | 유형   | 기본값       | 설명                                          |
| ------------------- | ------ | ------------ | --------------------------------------------- |
| `marking_color`     | string | `"0xFFFFFF"` | 눈금 색상                                     |
| `marking_color_opa` | number | 50           | 투명도 (0-100%)                               |
| `marking_spacing`   | number | 22           | 눈금 간격                                     |
| `big_width`         | number | 59           | 큰 눈금 너비                                  |
| `big_height`        | number | 2            | 큰 눈금 높이                                  |
| `small_width`       | number | 30           | 작은 눈금 너비                                |
| `small_height`      | number | 2            | 작은 눈금 높이                                |
| `big_loop`          | number | 6            | 몇 개의 작은 눈금마다 큰 눈금을 표시할지 설정 |
| `step`              | number | 6            | 초당 스크롤 픽셀 수                           |

기본 정렬 방식은 `CENTER` (수직 중앙)입니다.

### 6.9 `mjpeg` — MJPEG 비디오 재생

| 속성     | 유형   | 설명                                                                          |
| -------- | ------ | ----------------------------------------------------------------------------- |
| `src`    | string | `image_assets` 의 AVI 리소스 이름을 참조 (비어 있거나 생략 시 빈 캔버스 생성) |
| `width`  | number | 표시 너비 (기본값은 AVI 메타데이터 또는 480)                                  |
| `height` | number | 표시 높이 (기본값은 AVI 메타데이터 또는 480)                                  |

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

### 6.10 `container` — Flex 컨테이너

여러 하위 요소를 Flex 레이아웃으로 구성하는 데 사용됩니다.

| 속성             | 유형          | 설명                                                                             |
| ---------------- | ------------- | -------------------------------------------------------------------------------- |
| `width`          | number/string | 너비. 숫자 또는 `"content"` 를 지정할 수 있습니다.                               |
| `height`         | number/string | 높이. 숫자 또는 `"content"` 를 지정할 수 있습니다.                               |
| `layout`         | string        | 레이아웃 모드. 현재는 `"flex"` 만 지원합니다.                                    |
| `flex_direction` | string        | `"row"` / `"column"` / `"row_wrap"`                                              |
| `flex_align`     | string        | `"start"` `"center"` `"end"` `"space_between"` `"space_around"` `"space_evenly"` |
| `flex_gap`       | number        | 하위 요소 간의 간격                                                              |
| `bg_img`         | string        | 배경 이미지 리소스 이름 (타일 방식 표시)                                         |
| `bg_color`       | string        | 배경색 (bg_img가 없을 때 유효)                                                   |
| `bg_opa`         | number        | 배경 불투명도 (0-255). bg_color가 있으면 기본값은 255입니다.                     |
| `radius`         | number        | 테두리 둥글기 (bg_img가 없을 때 유효)                                            |
| `elements`       | array         | 하위 요소 배열                                                                   |

컨테이너 내의 하위 요소는 Flex에 의해 자동으로 정렬되며, `offset_x`/`offset_y` 는 무시됩니다.

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

## 7. 각 화면의 필수 요소 이름

시스템은 고정된 `name` 을 통해 UI 요소를 찾아 동적으로 업데이트합니다. 다음 이름은 **변경할 수 없습니다**:

### 7.1 `home_page_style.json`

| 요소 이름              | 유형  | 용도                                                        |
| ---------------------- | ----- | ----------------------------------------------------------- |
| `homebg`               | img   | 정적 배경화면 (src는 비어있어도 됨. 시스템이 자동으로 채움) |
| `homebg_mjpeg`         | mjpeg | 다이내믹 배경화면                                           |
| `time_label`           | label | 시간 표시 (`time_format` 속성 지원)                         |
| `week_label`           | label | 요일 표시                                                   |
| `muted_icon`           | img   | 음소거 아이콘 (선택 사항, 기본 숨김)                        |
| `caps_icon`            | img   | Caps Lock 아이콘 (선택 사항, 기본 숨김)                     |
| `music_icon_home`      | img   | 음악 재생 중 아이콘 (선택 사항, 기본 숨김)                  |
| `muted_msg`            | img   | 음소거 알림 이미지 (선택 사항, 기본 숨김)                   |
| `homebg_blur`          | img   | 흐린 배경 (볼륨/밝기 조절 시 표시됨)                        |
| `volume_bar`           | bar   | 볼륨 막대                                                   |
| `volume_icon`          | img   | 볼륨 아이콘 (선택 사항)                                     |
| `volume_percent_label` | label | 볼륨 퍼센트                                                 |
| `volume_label`         | label | "VOLUME" 라벨                                               |
| `light_bar`            | bar   | 밝기 막대                                                   |
| `light_icon`           | img   | 밝기 아이콘 (선택 사항)                                     |
| `light_percent_label`  | label | 밝기 퍼센트                                                 |
| `light_label`          | label | "LIGHT" 라벨                                                |

#### 배타적 상태 인디케이터 모드 (선택적인 고급 기능)

`elements` 에 `status_display` 라는 이름의 `img` 요소가 정의되어 있으면, 시스템은 여러 개의 아이콘을 분산시키는 대신 한 위치에서 다른 상태 아이콘을 전환하여 보여주는 **배타적 인디케이터 모드**를 활성화합니다. `image_assets` 에 다음을 추가로 선언해야 합니다:

| 이미지 리소스 이름 | 용도                                |
| ------------------ | ----------------------------------- |
| `status_default`   | 기본 상태 이미지                    |
| `status_caps`      | Caps Lock 상태일 때 표시되는 이미지 |
| `status_muted`     | 음소거 상태일 때 표시되는 이미지    |
| `status_music`     | 음악 재생 중일 때 표시되는 이미지   |

### 7.2 `music_page_style.json`

| 요소 이름     | 유형   | 용도                                                    |
| ------------- | ------ | ------------------------------------------------------- |
| `cover`       | img    | 앨범 커버 (src는 비어있어도 됨. 시스템이 동적으로 채움) |
| `play_btn`    | imgbtn | 재생/일시정지 버튼                                      |
| `song_title`  | label  | 노래 제목                                               |
| `artist_name` | label  | 아티스트 이름                                           |
| `musicSlider` | slider | 재생 진행률 막대                                        |

**선택적 이벤트**: `switchPlayPause`, `onMusicSliderChange`, `goPrev`, `goNext`

### 7.3 `clock_page_style.json`

| 요소 이름                        | 유형              | 용도                          |
| -------------------------------- | ----------------- | ----------------------------- |
| `clockpage_bg`                   | img               | 타이머 화면 배경 이미지       |
| `clock_scale` 또는 `clock_strip` | clock/clock_strip | 타이머 눈금 (둘 중 하나 선택) |
| `time_clock_label`               | label             | 카운트다운 시간 표시          |
| `play_btn`                       | imgbtn            | 시작/일시정지 버튼            |
| `start_line`                     | img               | 시작 마커 선 (선택 사항)      |

**선택적 이벤트**: `switchClockPause`, `on_pomodoro_add_click`, `on_pomodoro_sub_click`

### 7.4 `clock_timeup_style.json`

| 요소 이름       | 유형   | 용도             |
| --------------- | ------ | ---------------- |
| `timeup_time`   | label  | 타이머 완료 시간 |
| `timeup_text`   | label  | 안내 텍스트      |
| `timeup_goback` | imgbtn | 뒤로가기 버튼    |

**이벤트**: `goBackToClockPage`

### 7.5 `monitor_page_style.json`

| 요소 이름            | 유형  | 용도                 |
| -------------------- | ----- | -------------------- |
| `cpu_percent_arc`    | arc   | CPU 사용률 원호      |
| `cpu_percent_label`  | label | CPU 퍼센트 텍스트    |
| `cpu_temp_bar`       | bar   | CPU 온도 막대        |
| `cpu_temp_label`     | label | CPU 온도 텍스트      |
| `cpu_clock_bar`      | bar   | CPU 주파수 막대      |
| `cpu_clock_label`    | label | CPU 주파수 텍스트    |
| `memory_bar`         | bar   | 메모리 사용량 막대   |
| `memory_label`       | label | 메모리 퍼센트 텍스트 |
| `network_up_icon`    | img   | 업로드 아이콘        |
| `network_up_label`   | label | 업로드 속도          |
| `network_down_icon`  | img   | 다운로드 아이콘      |
| `network_down_label` | label | 다운로드 속도        |

### 7.6 `key_page_style.json`

| 요소 이름                      | 유형   | 용도           |
| ------------------------------ | ------ | -------------- |
| `key1` 부터 `key9`             | imgbtn | 9개의 가상 키  |
| `key1_title` 부터 `key9_title` | label  | 키 제목 텍스트 |

**이벤트**: `onVirtualKeyClick` (`indexData` 0~8로 구분)

### 7.7 `dock_style.json`

| 요소 이름              | 유형      | 용도                                                                       |
| ---------------------- | --------- | -------------------------------------------------------------------------- |
| `dock_container_big`   | container | Dock 막대의 바깥쪽 컨테이너 (시스템이 Dock 전체를 표시하거나 숨길 때 사용) |
| `dock_btn_home`        | imgbtn    | 홈 버튼 (indexData=1)                                                      |
| `dock_btn_music`       | imgbtn    | 음악 버튼 (indexData=2)                                                    |
| `dock_btn_pomodoro`    | imgbtn    | 포모도로 버튼 (indexData=3)                                                |
| `dock_btn_performance` | imgbtn    | 모니터 버튼 (indexData=4)                                                  |
| `dock_btn_settings`    | imgbtn    | 설정 버튼 (indexData=5)                                                    |
| `dock_clock_label`     | label     | 포모도로 카운트다운 (pomodoro 의 하위 요소)                                |

**이벤트**: `onDockBtnClick`

---

## 8. 사용 가능한 이벤트 콜백 이름

| 이벤트 이름             | 트리거 방식 | 용도                          |
| ----------------------- | ----------- | ----------------------------- |
| `onDockBtnClick`        | on_click    | Dock 내비게이션 버튼 클릭     |
| `onVolumeBarChange`     | on_change   | 볼륨 막대 드래그              |
| `onLightBarChange`      | on_change   | 밝기 막대 드래그              |
| `switchPlayPause`       | on_click    | 음악 재생/일시정지            |
| `onMusicSliderChange`   | on_change   | 음악 진행률 막대 드래그       |
| `goPrev`                | on_click    | 이전 곡으로                   |
| `goNext`                | on_click    | 다음 곡으로                   |
| `switchClockPause`      | on_click    | 타이머 시작/일시정지          |
| `goBackToClockPage`     | on_click    | 타이머 종료 화면에서 돌아가기 |
| `on_pomodoro_add_click` | on_click    | 포모도로 시간 늘리기          |
| `on_pomodoro_sub_click` | on_click    | 포모도로 시간 줄이기          |
| `onVirtualKeyClick`     | on_click    | 가상 키 클릭                  |

---

## 9. 색상 형식

두 가지 작성 형식을 지원합니다:
- `"0xRRGGBB"` — 예: `"0xFF0000"` (빨강)
- `"#RRGGBB"` — 예: `"#FF0000"` (빨강)

Bar 의 `main_color`/`indic_color` 는 완전히 투명함을 나타내는 `"transparent"` 도 지원합니다.

---

## 10. 주의 사항

1. **화면 크기**: 480×480 픽셀 정사각형 화면
2. **리소스 이름 길이 제한**: 최대 31자
3. **리소스 수량 제한**: 페이지당 최대 64개의 리소스, 100개의 요소, 32개의 이벤트
4. **imgbtn 수량 제한**: 페이지당 최대 32개의 이미지 버튼
5. **MJPEG 플레이어 제한**: 글로벌로 최대 4개 동시 재생
6. **요소 순서**: 배열의 뒤에 있는 요소가 상위 레이어에 위치합니다 (Z-order가 클수록 앞으로 나옴)
7. **Flex 컨테이너의 배치**: 하위 요소의 `offset_x`/`offset_y` 는 무시됩니다.
8. **폰트 재사용**: 경로가 시스템 폰트와 같으면 자동으로 재사용되며 중복으로 로드되지 않습니다.
9. **모든 경로는 `/sdcard/` 접두사를 사용합니다.**
10. **key_page_style.json 은 테마 간에 공유 가능**하며, `/sdcard/themes/key/` 공용 디렉토리에 위치합니다.
11. **메모리 제어**: 최대 총 메모리는 32M입니다. 더 많은 리소스를 사용하려면, 메모리 부족으로 인해 시스템이 리소스를 할당하지 못하고 무한 재부팅되는 것을 방지하기 위해 로그 파일에 표시되는 메모리 사용량에 유의하시기 바랍니다.
12. **테마 분류**: 테마는 "내장 테마"와 "사용자 지정 테마"로 나뉩니다. 생성하신 테마는 "사용자 지정 테마"에만 나타나며, 내장 테마로 전환할 수 없습니다.
