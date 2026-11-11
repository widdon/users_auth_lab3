/**
 * Route Handler Auth.js: /api/auth/session, /api/auth/csrf,
 * /api/auth/callback/credentials, /api/auth/signout и т. д.
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
