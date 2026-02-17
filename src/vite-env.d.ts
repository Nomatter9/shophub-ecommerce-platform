/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_STATIC_FILE_URL: string;
  // add more env vars here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}