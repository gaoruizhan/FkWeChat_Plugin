import { create } from 'zustand';
import { fetchPlugins, fetchPluginDetail } from '@/services/plugin';
import type { Plugin, PluginDetail } from '@/types';

interface AppState {
  plugins: Plugin[];
  currentPlugin: PluginDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchPlugins: () => Promise<void>;
  fetchPluginDetail: (folder: string) => Promise<void>;
  clearError: () => void;
  clearCurrentPlugin: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  plugins: [],
  currentPlugin: null,
  isLoading: false,
  error: null,

  fetchPlugins: async () => {
    set({ isLoading: true, error: null });
    try {
      const plugins = await fetchPlugins();
      set({ plugins, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '获取插件列表失败',
      });
    }
  },

  fetchPluginDetail: async (folder: string) => {
    set({ isLoading: true, error: null });
    try {
      const plugin = await fetchPluginDetail(folder);
      set({ currentPlugin: plugin, isLoading: false });
    } catch (error) {
      set({
        currentPlugin: null,
        isLoading: false,
        error: error instanceof Error ? error.message : '获取插件详情失败',
      });
    }
  },

  clearError: () => set({ error: null }),

  clearCurrentPlugin: () => set({ currentPlugin: null }),
}));
