import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        proxy: {
            // 代理 /api 到币安测试网 API，只修改域名，不修改路径
            '/api': {
                target: 'https://testnet.binance.vision',
                changeOrigin: true,
                secure: false
            }
        }
    }
});
