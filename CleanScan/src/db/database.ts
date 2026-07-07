import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';
import { logger } from '@/utils/logger';

/**
 * Single shared SQLite connection (PRD §10.1, §15).
 * Uses the modern async expo-sqlite API (SDK 51+).
 */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('cleanscan.db');
      await db.execAsync(MIGRATIONS);
      logger.info('db', 'database ready');
      return db;
    })();
  }
  return dbPromise;
}
