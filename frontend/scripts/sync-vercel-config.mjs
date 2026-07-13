import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const api = (process.env.RENDER_API_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');

const vercel = api
  ? {
      rewrites: [
        { source: '/api/:path*', destination: `${api}/api/:path*` },
        { source: '/uploads/:path*', destination: `${api}/uploads/:path*` },
        { source: '/health', destination: `${api}/health` },
        { source: '/((?!api|uploads|health|docs).*)', destination: '/' },
      ],
    }
  : {
      rewrites: [{ source: '/(.*)', destination: '/' }],
    };

const target = path.resolve(__dirname, '..', 'vercel.json');
fs.writeFileSync(target, `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`vercel.json synced${api ? ` → ${api}` : ' (SPA only — set RENDER_API_URL on Vercel)'}`);
