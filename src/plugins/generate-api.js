#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePluginsDir = path.join(__dirname, '..', '..', 'main', 'plugins');
const outputApiDir = path.join(__dirname, '..', '..', 'dist', 'api');
const outputFile = path.join(outputApiDir, 'plugins.json');

function parseInfoProp(content) {
  const props = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex !== -1) {
        const key = trimmed.substring(0, equalsIndex).trim();
        const value = trimmed.substring(equalsIndex + 1).trim();
        props[key] = value;
      }
    }
  }
  
  return props;
}

async function generatePluginsAPI() {
  try {
    // 动态获取插件文件夹列表
    const pluginFolders = fs.readdirSync(sourcePluginsDir).filter(file => {
      return fs.statSync(path.join(sourcePluginsDir, file)).isDirectory();
    });
    
    const plugins = [];
    
    for (const folder of pluginFolders) {
      const infoPropPath = path.join(sourcePluginsDir, folder, 'info.prop');
      
      if (fs.existsSync(infoPropPath)) {
        const content = fs.readFileSync(infoPropPath, 'utf-8');
        const props = parseInfoProp(content);
        
        plugins.push({
          author: props.author || '未知作者',
          name: props.name || folder,
          description: props.desc || '',
          downloadUrl: `https://YunJavaPro.github.io/FkWeChat_Plugin/plugins/${folder}/${folder}.zip`,
          version: props.version || '1.0.0'
        });
      }
    }
    
    if (!fs.existsSync(outputApiDir)) {
      fs.mkdirSync(outputApiDir, { recursive: true });
    }
    
    // 自定义 JSON 序列化，保持中文字符不转义
    const jsonStr = JSON.stringify(plugins, null, 2);
    // 将 Unicode 转义序列还原为中文
    const chineseJson = jsonStr.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    fs.writeFileSync(outputFile, chineseJson);
    console.log(`插件 API 已生成: ${outputFile}`);
    console.log(`共 ${plugins.length} 个插件`);
  } catch (error) {
    console.error('生成 API 失败:', error);
    process.exit(1);
  }
}

generatePluginsAPI();