import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_API = 'https://gofla-1.onrender.com';
const api = (process.env.RENDER_API_URL || process.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, '');

const vercel = {
  rewrites: [
    { source: '/api/:path*', destination: `${api}/api/:path*` },
    { source: '/uploads/:path*', destination: `${api}/uploads/:path*` },
    { source: '/health', destination: `${api}/v1/health` },
    { source: '/((?!api|uploads|health|docs).*)', destination: '/' },
  ],
};

const target = path.resolve(__dirname, '..', 'vercel.json');
fs.writeFileSync(target, `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`vercel.json synced → ${api}`);
