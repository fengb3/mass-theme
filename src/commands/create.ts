import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

const TEMPLATE_FILES = [
  'home_page_style.json',
  'music_page_style.json',
  'clock_page_style.json',
  'clock_timeup_style.json',
  'monitor_page_style.json',
  'key_page_style.json',
  'dock_style.json',
];

const ASSET_DIRS = ['home', 'music', 'clock', 'monitor', 'dock', 'fonts'];

export function createCommand(): Command {
  const cmd = new Command('create');
  cmd
    .description('创建新主题脚手架')
    .argument('<theme-name>', '主题名称')
    .option('-d, --dir <path>', '输出目录', process.cwd())
    .action((themeName: string, options: { dir: string }) => {
      const targetDir = path.resolve(options.dir, themeName);

      if (fs.existsSync(targetDir)) {
        console.error(`错误: 目录已存在 ${targetDir}`);
        process.exit(1);
      }

      const templatesDir = path.resolve(__dirname, '../../templates');

      fs.mkdirSync(targetDir, { recursive: true });

      for (const tplFile of TEMPLATE_FILES) {
        const tplPath = path.join(templatesDir, tplFile);
        const content = fs.readFileSync(tplPath, 'utf-8');
        const processed = content.replace(/\{\{THEME_NAME\}\}/g, themeName);
        fs.writeFileSync(path.join(targetDir, tplFile), processed);
      }

      for (const dir of ASSET_DIRS) {
        fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
      }

      console.log(`\n主题 "${themeName}" 已创建: ${targetDir}\n`);
      console.log('结构:');
      for (const f of TEMPLATE_FILES) {
        console.log(`  ${f}`);
      }
      for (const d of ASSET_DIRS) {
        console.log(`  ${d}/`);
      }
      console.log();
    });

  return cmd;
}
