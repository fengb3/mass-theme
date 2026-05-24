#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';

const program = new Command();

program
  .name('mass-theme')
  .version('0.1.0')
  .description('MWKEYS Mass 80 主题制作工具');

program.addCommand(createCommand());

// TODO: pack command - 打包主题为固件可用的压缩包
// program.addCommand(packCommand());

// TODO: load command - 从设备加载主题
// program.addCommand(loadCommand());

program.parse();
