import { pgTable, serial, text, numeric, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  monthly_limit: numeric('monthly_limit', { precision: 12, scale: 2 }).notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category_id: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  description: text('description'),
  date: timestamp('date', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const scheduled_payments = pgTable('scheduled_payments', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  due_date: timestamp('due_date', { withTimezone: true, mode: 'date' }).notNull(),
  is_paid: boolean('is_paid').default(false).notNull(),
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
