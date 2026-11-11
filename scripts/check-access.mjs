/**
 * Проверка защиты Route Handlers (401 / 403 / 422 / 200) одной командой.
 *
 * Запуск (приложение должно уже работать в другом терминале: npm run dev):
 *   npm run check:access
 *   npm run check:access -- http://localhost:3001      (другой адрес)
 *
 * Скрипт сам входит под нужными пользователями (так же, как форма входа:
 * csrf-токен + POST /api/auth/callback/credentials) и печатает результат
 * в том же виде, что и скриншот в отчёте. Работает одинаково в Windows,
 * macOS и Linux: никаких curl и кавычек в терминале не нужно.
 */

const BASE = (process.argv[2] ?? process.env.APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const ACCOUNTS = {
  user: { username: 'averyp', password: 'averyppass' },
  admin: { username: 'emilys', password: 'emilyspass' },
};

const C = { reset: '\x1b[0m', cyan: '\x1b[36m', yellow: '\x1b[33m', green: '\x1b[32m', red: '\x1b[31m', gray: '\x1b[90m' };

/** Собирает cookie из заголовков Set-Cookie в строку для заголовка Cookie. */
function mergeCookies(jar, response) {
  for (const line of response.headers.getSetCookie()) {
    const [pair] = line.split(';');
    const index = pair.indexOf('=');
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
  }
}

function cookieHeader(jar) {
  return [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
}

/** Вход через Credentials-провайдер Auth.js. Возвращает cookie сессии. */
async function login({ username, password }) {
  const jar = new Map();

  const csrfResponse = await fetch(`${BASE}/api/auth/csrf`);
  mergeCookies(jar, csrfResponse);
  const { csrfToken } = await csrfResponse.json();

  const response = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookieHeader(jar) },
    body: new URLSearchParams({ csrfToken, username, password, json: 'true' }),
  });
  mergeCookies(jar, response);

  const hasSession = [...jar.keys()].some((name) => name.endsWith('session-token'));
  if (!hasSession) {
    throw new Error(`Не удалось войти как ${username} (HTTP ${response.status}). Проверьте логин и пароль.`);
  }
  return cookieHeader(jar);
}

async function request(method, path, { cookie, body } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, statusText: response.statusText, text: await response.text() };
}

const results = [];

async function check({ title, who, method, path, body, cookie, expected }) {
  const label = `${method} ${path}${body ? ` ${JSON.stringify(body)}` : ''}`;
  const res = await request(method, path, { cookie, body });
  const ok = res.status === expected;
  results.push(ok);

  console.log(`${C.cyan}$ ${label}  ${C.gray}# ${who}${C.reset}`);
  console.log(`${C.yellow}HTTP/1.1 ${res.status} ${res.statusText}${C.reset}  ${ok ? `${C.green}✓${C.reset}` : `${C.red}✗ ожидалось ${expected}${C.reset}`}`);
  console.log(res.text || '(пустой ответ)');
  console.log();
  return res;
}

async function main() {
  console.log(`Проверка доступа к Route Handlers: ${BASE}\n`);

  try {
    await fetch(`${BASE}/api/auth/csrf`);
  } catch {
    console.error(`${C.red}Приложение не отвечает на ${BASE}. Запустите его в другом терминале: npm run dev${C.reset}`);
    process.exit(2);
  }

  const user = await login(ACCOUNTS.user);
  const admin = await login(ACCOUNTS.admin);

  await check({ who: 'аноним', method: 'POST', path: '/api/users', body: {}, expected: 401 });
  await check({ who: 'аноним', method: 'DELETE', path: '/api/users/1', expected: 401 });
  await check({ who: `user (${ACCOUNTS.user.username})`, method: 'DELETE', path: '/api/users/1', cookie: user, expected: 403 });
  await check({ who: `user (${ACCOUNTS.user.username})`, method: 'PATCH', path: '/api/users/16', body: { role: 'admin' }, cookie: user, expected: 403 });
  await check({ who: `user (${ACCOUNTS.user.username})`, method: 'PATCH', path: '/api/users/16', body: { email: 'nope' }, cookie: user, expected: 422 });
  await check({ who: `admin (${ACCOUNTS.admin.username})`, method: 'DELETE', path: '/api/users/1', cookie: admin, expected: 200 });

  const passed = results.filter(Boolean).length;
  const color = passed === results.length ? C.green : C.red;
  console.log(`${color}Итого: ${passed} из ${results.length} проверок совпали с ожидаемым результатом${C.reset}`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((error) => {
  console.error(`${C.red}${error.message}${C.reset}`);
  process.exit(2);
});
