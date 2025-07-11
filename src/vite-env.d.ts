/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_DATABASE_ARCHIVE_ID: string;
  readonly VITE_APPWRITE_DATABASE_ARCHIVE_COLLECTION_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
