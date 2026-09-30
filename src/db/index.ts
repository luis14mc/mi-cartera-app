import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ [DB Warning] DATABASE_URL no está configurada en las variables de entorno.');
}

const sql = neon(connectionString || 'postgres://user:password@localhost:5432/neondb');

export const db = drizzle(sql, { schema });
export { schema };
