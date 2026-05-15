#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePluginsDir = path.join(__dirname, '..', '..', 'main', 'plugins');
const outputApiDir = path.join(__dirname, '..', '..', 'dist', 'api');
const outputFile = path.join(outputApiDir, 'plugins.json');

// 解码 Unicode 转义字符串（如 \u96F2\u4E0A\u5347 → 雲上升）
function decodeUnicode(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function parseInfoProp(content) {
  const props = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex !== -1) {
        const key = trimmed.substring(0, equalsIndex).trim();
        const value = decodeUnicode(trimmed.substring(equalsIndex + 1).trim());
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
      const readmePath = path.join(sourcePluginsDir, folder, 'README.md');
      
      if (fs.existsSync(infoPropPath)) {
        const content = fs.readFileSync(infoPropPath, 'utf-8');
        const props = parseInfoProp(content);
        
        // 读取 README.md 内容
        let readme = '';
        if (fs.existsSync(readmePath)) {
          readme = fs.readFileSync(readmePath, 'utf-8');
        }
        
        plugins.push({
          author: props.author || '未知作者',
          name: props.name || folder,
          description: props.desc || '',
          downloadUrl: `https://YunJavaPro.github.io/FkWeChat_Plugin/plugins/${folder}/${folder}.zip`,
          version: props.version || '1.0.0',
          readme
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