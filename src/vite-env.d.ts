/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_SPINNER_FILE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
