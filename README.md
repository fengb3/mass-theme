# mass-theme

MWKEYS Mass 80 主题脚手架 CLI 工具。

## 安装

```bash
npm install -g mass-theme
```

## 使用

### 创建主题

```bash
mass-theme create <主题名>
mass-theme create <主题名> --dir <输出目录>
```

生成目录结构：

```
<主题名>/
├── home_page_style.json        # 首页样式
├── music_page_style.json       # 音乐页样式
├── clock_page_style.json       # 计时器页样式
├── clock_timeup_style.json     # 计时结束页样式
├── monitor_page_style.json     # 性能监控页样式
├── key_page_style.json         # 虚拟按键页样式
├── dock_style.json             # 底部导航栏样式
├── home/                       # 首页图片资源
├── music/                      # 音乐页图片资源
├── clock/                      # 计时器页图片资源
├── monitor/                    # 监控页图片资源
├── dock/                       # 导航栏图片资源
└── fonts/                      # 主题字体
```

## 开发

```bash
npm install
npm run build
node dist/index.js --help
```

## License

MIT
