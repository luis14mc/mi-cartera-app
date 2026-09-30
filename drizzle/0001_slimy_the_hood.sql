ALTER TABLE "scheduled_payments" ADD COLUMN "currency" text DEFAULT 'HNL' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "currency" text DEFAULT 'HNL' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "original_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "exchange_rate" numeric(8, 4) DEFAULT '1.0000' NOT NULL;