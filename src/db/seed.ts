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
  console.log('🌱 Iniciando la siembra de datos de prueba...');

  try {
    // 1. Categorías iniciales
    console.log('Insertando categorías...');
    const insertedCategories = await db
      .insert(schema.categories)
      .values([
        { name: 'Alimentación y Supermercado', monthly_limit: '400.00' },
        { name: 'Transporte y Gasolina', monthly_limit: '150.00' },
        { name: 'Servicios Básicos (Luz, Agua, Net)', monthly_limit: '180.00' },
        { name: 'Ocio y Restaurantes', monthly_limit: '100.00' },
        { name: 'Salud y Farmacia', monthly_limit: '120.00' },
      ])
      .returning();

    console.log(`✅ ${insertedCategories.length} categorías creadas.`);

    // 2. Pagos programados próximos
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
          title: 'Servicio de Internet Fibra',
          amount: '45.00',
          due_date: inOneDay,
          is_paid: false,
        },
        {
          title: 'Membresía Gimnasio',
          amount: '35.00',
          due_date: inTwoDays,
          is_paid: false,
        },
        {
          title: 'Pago Cuota Tarjeta (Corte día 20)',
          amount: '120.00',
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
