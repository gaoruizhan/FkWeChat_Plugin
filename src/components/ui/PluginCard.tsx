import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import type { Plugin } from '@/types';

interface PluginCardProps {
  plugin: Plugin;
}

export function PluginCard({ plugin }: PluginCardProps) {
  return (
    <Link
      to={`/plugin/${plugin.folder}`}
      className="block rounded-md border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-700 font-semibold">
          {plugin.name.charAt(0)}
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          v{plugin.version}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 truncate">
        {plugin.name}
      </h3>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {plugin.description || '暂无描述'}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <User className="h-3.5 w-3.5" />
        <span>{plugin.author}</span>
      </div>
    </Link>
  );
}
