import type { Plugin, PluginDetail } from '@/types';

// 解码 Unicode 转义字符串（如 \u96F2\u4E0A\u5347 → 雲上升）
function decodeUnicode(str: string): string {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// 解析 info.prop 文件
function parseInfoProp(content: string, folder: string): Plugin {
  const props: Record<string, string> = {};
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
  
  return {
    id: folder,
    name: props.name || folder,
    author: props.author || '未知作者',
    version: props.version || '1.0.0',
    description: props.desc || '',
    tags: props.tags ? props.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    folder: folder,
  };
}

export async function fetchPlugins(): Promise<Plugin[]> {
  // eager: true 会在构建阶段直接把所有 info.prop 文件的内容作为字符串打包进代码中，无需再发 fetch 请求
  const infoProps = import.meta.glob('/main/plugins/*/info.prop', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;
  const plugins: Plugin[] = [];
  
  for (const path in infoProps) {
    // path 格式为 '/main/plugins/文件夹名/info.prop'
    const folder = path.split('/')[3]; 
    try {
      const content = infoProps[path];
      plugins.push(parseInfoProp(content, folder));
    } catch (e) {
      console.error(`Failed to load plugin ${folder}`, e);
    }
  }
  
  return plugins;
}

export async function fetchPluginDetail(folder: string): Promise<PluginDetail> {
  const infoProps = import.meta.glob('/main/plugins/*/info.prop', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;
  // 对于 java 文件使用按需加载，不加 eager: true，点击详情时再去拉取
  const mainJavas = import.meta.glob('/main/plugins/*/main.java', { query: '?raw', import: 'default' });
  // 加载插件文件夹内所有文件（用于完整打包下载）
  const allFiles = import.meta.glob('/main/plugins/**/*', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>;
  
  const propPath = `/main/plugins/${folder}/info.prop`;
  const javaPath = `/main/plugins/${folder}/main.java`;
  
  if (!infoProps[propPath] || !mainJavas[javaPath]) {
    throw new Error('获取插件详情失败：文件不存在');
  }

  const infoPropRaw = infoProps[propPath];
  const infoProp = decodeUnicode(infoPropRaw);
  const mainJava = await mainJavas[javaPath]() as string;
  const plugin = parseInfoProp(infoPropRaw, folder);

  // 收集插件文件夹内所有文件（排除文件夹本身）
  const pluginFiles: Record<string, string> = {};
  const prefix = `/main/plugins/${folder}/`;
  for (const filePath in allFiles) {
    if (filePath.startsWith(prefix)) {
      const relativePath = filePath.substring(prefix.length);
      // info.prop 需要解码，其他文件原样保留
      pluginFiles[relativePath] = relativePath === 'info.prop' ? infoProp : allFiles[filePath];
    }
  }

  return {
    ...plugin,
    mainJava,
    infoProp,
    pluginFiles,
  };
}