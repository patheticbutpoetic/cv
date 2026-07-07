/**
 * SQLite schema (PRD §15). Documents, pages, and folders tables.
 */
export const MIGRATIONS = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  pdf_uri TEXT NOT NULL,
  thumbnail_uri TEXT,
  page_count INTEGER NOT NULL DEFAULT 0,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  paper_size TEXT NOT NULL DEFAULT 'A4',
  quality TEXT NOT NULL DEFAULT 'HIGH',
  compression TEXT NOT NULL DEFAULT 'MEDIUM',
  mode TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  folder_id TEXT,
  ocr_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_opened_at TEXT
);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT,
  original_uri TEXT NOT NULL,
  working_uri TEXT NOT NULL,
  enhanced_uri TEXT,
  thumbnail_uri TEXT,
  order_index INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  rotation INTEGER NOT NULL DEFAULT 0,
  crop_json TEXT,
  filter TEXT NOT NULL DEFAULT 'ORIGINAL',
  brightness REAL NOT NULL DEFAULT 0,
  contrast REAL NOT NULL DEFAULT 0,
  sharpness REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_name ON documents(name);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_document ON pages(document_id);
`;
