CREATE TABLE IF NOT EXISTS "blog_api" (
	"id" serial NOT NULL,
	"user_id" integer,
	"blog_type" varchar,
	"blog_site" jsonb,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"content" jsonb NOT NULL,
	"metadata" jsonb,
	"keyword" jsonb,
	"document_type" varchar,
	"is_deleted" boolean DEFAULT false,
	"is_favorite" boolean DEFAULT false,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "documents_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment" (
	"id" serial NOT NULL,
	"order_id" varchar,
	"status" varchar DEFAULT 'pending',
	"user_id" integer,
	"ref_id" integer,
	"method" varchar,
	"credits" integer,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payment_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userss" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(10) NOT NULL,
	"password" varchar(255) NOT NULL,
	"credits" integer DEFAULT 50,
	"used_credits" integer DEFAULT 0,
	"total_content" integer DEFAULT 0,
	"total_research" integer DEFAULT 0,
	"total_alerts" integer DEFAULT 0,
	"credits_on_content" integer DEFAULT 0,
	"credits_on_research" integer DEFAULT 0,
	"credits_on_alerts" integer DEFAULT 0,
	"refresh_token" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "userss_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "userss_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_api" ADD CONSTRAINT "blog_api_user_id_userss_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userss"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_userss_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userss"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_userss_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userss"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
