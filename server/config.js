import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 读取.env文件
try {
  const envFile = readFileSync(path.join(__dirname, '../.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {
  console.log('未找到.env文件，使用默认配置');
}

export const config = {
  d1: {
    apiBase: process.env.D1_API_BASE,
    token: process.env.D1_TOKEN
  },
  server: {
    port: process.env.PORT || 3000
  },
  session: {
    secret: process.env.SESSION_SECRET
  }
};