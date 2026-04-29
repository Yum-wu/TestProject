/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZHIPU_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
