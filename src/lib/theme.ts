/**
 * Общий модуль (без 'use client'): константы нужны и серверному layout, и клиентской кнопке.
 * Если экспортировать строку из файла с 'use client', сервер получит не строку,
 * а «клиентскую ссылку» на модуль.
 */
export const THEME_STORAGE_KEY = 'users-next:theme';

/**
 * Скрипт выполняется в <head> до отрисовки страницы и сразу ставит сохранённую тему —
 * без «мигания» светлой темы. Поэтому у <html> стоит suppressHydrationWarning:
 * атрибут data-theme меняется до гидратации, и это ожидаемо.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})();`;
