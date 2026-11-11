// Создаёт .env.local при первом запуске, чтобы проект запускался без ручной настройки.
// Секрет AUTH_SECRET генерируется случайно и хранится только на этой машине (.env.local в .gitignore).
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const file = new URL('../.env.local', import.meta.url);
const secretLine = `AUTH_SECRET=${randomBytes(32).toString('base64url')}`;

if (!existsSync(file)) {
  const example = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  writeFileSync(file, example.replace(/^AUTH_SECRET=.*$/m, secretLine));
  console.log('Создан .env.local со случайным AUTH_SECRET');
} else if (!/^AUTH_SECRET=.+$/m.test(readFileSync(file, 'utf8'))) {
  appendFileSync(file, `\n${secretLine}\n`);
  console.log('В .env.local добавлен AUTH_SECRET');
}
