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
    // 1. Categorías con disciplina estricta anti-fugas
    console.log('Creando categorías de presupuesto...');
    const insertedCategories = await db
      .insert(schema.categories)
      .values([
        {
          name: 'Suscripciones & Software',
          monthly_limit: '1200.00',
          icon: '💻',
        },
        {
          name: 'Gastos Hormiga (Café/Snacks)',
          monthly_limit: '1500.00',
          icon: '🐜',
        },
        {
          name: 'Básico y Supermercado',
          monthly_limit: '7500.00',
          icon: '🛒',
        },
        {
          name: 'Transporte y Gasolina',
          monthly_limit: '3000.00',
          icon: '⛽',
        },
        {
          name: 'Servicios del Hogar',
          monthly_limit: '2500.00',
          icon: '⚡',
        },
      ])
      .returning();

    console.log(`✅ ${insertedCategories.length} categorías creadas.`);

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
