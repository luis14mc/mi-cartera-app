CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"monthly_limit" numeric(12, 2) NOT NULL,
	"icon" varchar(50) DEFAULT 'tag' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(150) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"due_day" integer DEFAULT 20 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category_id" integer NOT NULL,
	"description" varchar(255),
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;