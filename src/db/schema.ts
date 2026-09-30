import { pgTable, serial, varchar, numeric, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tabla de Categorías con iconos y límites mensuales
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  monthly_limit: numeric('monthly_limit', { precision: 12, scale: 2 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull().default('tag'),
});

// 2. Tabla de Transacciones para control de gastos
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category_id: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 255 }),
  date: timestamp('date', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// 3. Tabla de Pagos Programados / Deuda fija recurrente
export const scheduled_payments = pgTable('scheduled_payments', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 150 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  due_day: integer('due_day').notNull().default(20), // Día del mes para pago (ej: día 20)
  is_active: boolean('is_active').default(true).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.category_id],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type ScheduledPayment = typeof scheduled_payments.$inferSelect;
export type NewScheduledPayment = typeof scheduled_payments.$inferInsert;
