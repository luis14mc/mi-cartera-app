import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL no está configurada en .env');
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('⚡ Iniciando configuración inicial para Control CRONOS...');

  try {
    // 0. Asegurar esquema de base de datos
    console.log('Verificando columnas en base de datos...');
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method varchar(30) NOT NULL DEFAULT 'DEBITO_EFECTIVO';`;
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS payment_method_default varchar(30) DEFAULT 'DEBITO_EFECTIVO';`;

    // 1. Categorías del Modo Supervivencia y Compromisos Intocables (Octubre)
    console.log('Sembrando categorías con Compromisos Intocables...');
    
    // Limpiar o actualizar categorías
    await db.delete(schema.transactions);
    await db.delete(schema.categories);
    await db.delete(schema.scheduled_payments);

    const insertedCategories = await db
      .insert(schema.categories)
      .values([
        // Gastos Variables Controlados
        {
          name: 'Supermercado',
          monthly_limit: '4000.00',
          icon: '🛒',
          payment_method_default: 'DEBITO_EFECTIVO',
        },
        {
          name: 'Gasolina',
          monthly_limit: '2000.00',
          icon: '⛽',
          payment_method_default: 'DEBITO_EFECTIVO',
        },
        {
          name: 'Ocio y Hormiga',
          monthly_limit: '1500.00',
          icon: '🐜',
          payment_method_default: 'DEBITO_EFECTIVO',
        },
        {
          name: 'Software (Vital)',
          monthly_limit: '1500.00',
          icon: '💻',
          payment_method_default: 'DEBITO_EFECTIVO',
        },
        // Compromisos Intocables (L. 8,750 Congelados)
        {
          name: 'Maestría',
          monthly_limit: '4350.00',
          icon: '🎓',
          payment_method_default: 'DEBITO',
        },
        {
          name: 'Deudas/Préstamos Fijos',
          monthly_limit: '4400.00',
          icon: '🏦',
          payment_method_default: 'DEBITO',
        },
      ])
      .returning();

    console.log(`✅ ${insertedCategories.length} categorías creadas (incluyendo Compromisos Intocables).`);

    // 2. Compromiso fijo obligatorio (Día 20)
    console.log('Creando compromiso fijo de deuda (Día 20)...');
    const insertedPayments = await db
      .insert(schema.scheduled_payments)
      .values([
        {
          title: 'Cuota Fija Deuda / Tarjetas',
          amount: '4400.00',
          due_day: 20,
          is_active: true,
        },
      ])
      .returning();

    console.log(`✅ ${insertedPayments.length} compromiso(s) de deuda registrado(s).`);
    console.log('🛡️ Control CRONOS configurado exitosamente.');
  } catch (error) {
    console.error('❌ Error al sembrar datos de CRONOS:', error);
  }
}

seed();
