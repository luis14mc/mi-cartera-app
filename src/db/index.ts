import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ [CRONOS DB] DATABASE_URL no configurada. Configure su connection string de Neon en .env');
}

const sql = neon(connectionString || 'postgres://user:password@localhost:5432/neondb');

export const db = drizzle(sql, { schema });
export { schema };
