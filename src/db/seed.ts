import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Iniciando la siembra de datos de prueba en Lempiras (HNL) y Dólares (USD)...');

  try {
    // 1. Categorías con límites en Lempiras
    console.log('Insertando categorías en Lempiras...');
    const insertedCategories = await db
      .insert(schema.categories)
      .values([
        { name: 'Supermercado y Alimentación', monthly_limit: '9000.00' },
        { name: 'Transporte y Combustible', monthly_limit: '3500.00' },
        { name: 'Servicios del Hogar (Luz, Agua, Net)', monthly_limit: '3200.00' },
        { name: 'Salidas, Cafés y Ocio', monthly_limit: '2500.00' },
        { name: 'Salud y Farmacia', monthly_limit: '1800.00' },
      ])
      .returning();

    console.log(`✅ ${insertedCategories.length} categorías creadas.`);

    // 2. Pagos programados en Lps y USD
    console.log('Insertando pagos programados...');
    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const inOneDay = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    
    // Pago del día 20
    const day20 = new Date(now.getFullYear(), now.getMonth(), 20, 12, 0, 0);

    const insertedPayments = await db
      .insert(schema.scheduled_payments)
      .values([
        {
          title: 'Internet Fibra Claro/Tigo',
          amount: '950.00',
          currency: 'HNL',
          due_date: inOneDay,
          is_paid: false,
        },
        {
          title: 'Suscripción Software/Streaming (USD)',
          amount: '22.99',
          currency: 'USD',
          due_date: inTwoDays,
          is_paid: false,
        },
        {
          title: 'Pago Cuota Tarjeta (Corte día 20)',
          amount: '3500.00',
          currency: 'HNL',
          due_date: day20,
          is_paid: false,
        },
      ])
      .returning();

    console.log(`✅ ${insertedPayments.length} pagos programados creados.`);
    console.log('🎉 Seed completado exitosamente.');
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
  }
}

seed();
