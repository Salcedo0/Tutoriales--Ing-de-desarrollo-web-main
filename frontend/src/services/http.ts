import axios from 'axios';

// One place decides where the API lives. The tutorial repeats the base URL
// inside each service, which means two files to edit the day the backend moves.
// `VITE_API_BASE_URL` lets a build point somewhere else without touching the
// code. Vite inlines it at build time, so changing it means rebuilding `dist`.
export const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'}/api`,
  timeout: 10_000,
});

// Axios fails with its own error shape, so the views would have to know about
// axios to say anything useful. This turns a failed request into the one thing
// they need: a sentence to show the user.
export function describeRequestError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con el servidor. Revisa que el backend esté corriendo.';
  }

  const message = (error.response?.data as { message?: string | string[] } | undefined)?.message;

  if (Array.isArray(message)) {
    return message.join('. ');
  }

  return message ?? fallback;
}
