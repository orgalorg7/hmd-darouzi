import {defineConfig,loadEnv} from 'vite';
import {seoPlugin} from './scripts/seo/plugin.js';
export default defineConfig(({mode})=>({plugins:[seoPlugin({...loadEnv(mode,process.cwd(),''),...process.env})],build:{chunkSizeWarningLimit:600}}));
