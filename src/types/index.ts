export interface Plugin {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  tags: string[];
  folder: string;
}

export interface PluginDetail extends Plugin {
  mainJava: string;
  infoProp: string;
}
