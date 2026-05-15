#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePluginsDir = path.join(__dirname, '..', '..', 'main', 'plugins');
const outputPluginsDir = path.join(__dirname, '..', '..', 'dist', 'plugins');

async function generatePluginsZip() {
  try {
    // 动态获取插件文件夹列表
    const pluginFolders = fs.readdirSync(sourcePluginsDir).filter(file => {
      return fs.statSync(path.join(sourcePluginsDir, file)).isDirectory();
    });
    
    if (!fs.existsSync(outputPluginsDir)) {
      fs.mkdirSync(outputPluginsDir, { recursive: true });
    }
    
    for (const folder of pluginFolders) {
      const pluginDir = path.join(sourcePluginsDir, folder);
      const outputPluginDir = path.join(outputPluginsDir, folder);
      const zipPath = path.join(outputPluginDir, `${folder}.zip`);
      
      const mainJavaPath = path.join(pluginDir, 'main.java');
      const infoPropPath = path.join(pluginDir, 'info.prop');
      
      if (fs.existsSync(mainJavaPath) && fs.existsSync(infoPropPath)) {
        if (!fs.existsSync(outputPluginDir)) {
          fs.mkdirSync(outputPluginDir, { recursive: true });
        }
        
        const zip = new JSZip();
        zip.file('main.java', fs.readFileSync(mainJavaPath));
        zip.file('info.prop', fs.readFileSync(infoPropPath));
        
        const content = await zip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(zipPath, content);
        
        console.log(`已生成: ${folder}.zip`);
      } else {
        console.warn(`插件 ${folder} 缺少文件`);
      }
    }
    
    console.log(`\n所有插件 zip 已生成`);
  } catch (error) {
    console.error('生成 zip 失败:', error);
    process.exit(1);
  }
}

generatePluginsZip();