#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePluginsDir = path.join(__dirname, '..', '..', 'main', 'plugins');
const outputPluginsDir = path.join(__dirname, '..', '..', 'dist', 'plugins');

// 递归添加文件夹内容到 zip
function addFolderToZip(zip, folderPath, zipPath = '') {
  const items = fs.readdirSync(folderPath);
  
  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const relativePath = zipPath ? `${zipPath}/${item}` : item;
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 递归处理子文件夹
      addFolderToZip(zip, fullPath, relativePath);
    } else {
      // 添加文件到 zip
      zip.file(relativePath, fs.readFileSync(fullPath));
    }
  }
}

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
        
        // 递归添加插件文件夹内的所有内容
        addFolderToZip(zip, pluginDir);
        
        const content = await zip.generateAsync({ type: 'nodebuffer' });
        fs.writeFileSync(zipPath, content);
        
        console.log(`已生成: ${folder}.zip`);
      } else {
        console.warn(`插件 ${folder} 缺少必要文件 (main.java 或 info.prop)`);
      }
    }
    
    console.log(`\n所有插件 zip 已生成`);
  } catch (error) {
    console.error('生成 zip 失败:', error);
    process.exit(1);
  }
}

generatePluginsZip();