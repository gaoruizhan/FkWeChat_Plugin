import type { Plugin, PluginDetail } from '@/types';

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
        const value = trimmed.substring(equalsIndex + 1).trim();
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
  
  const propPath = `/main/plugins/${folder}/info.prop`;
  const javaPath = `/main/plugins/${folder}/main.java`;
  
  if (!infoProps[propPath] || !mainJavas[javaPath]) {
    throw new Error('获取插件详情失败：文件不存在');
  }

  const infoProp = infoProps[propPath];
  const mainJava = await mainJavas[javaPath]() as string;
  const plugin = parseInfoProp(infoProp, folder);

  return {
    ...plugin,
    mainJava,
    infoProp,
  };
}