/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // باگ ۵ — dev admin credentials از env (فقط در DEV mode فعال)
  readonly VITE_DEV_ADMIN_EMAIL?: string;
  readonly VITE_DEV_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
