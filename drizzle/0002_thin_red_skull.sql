CREATE TABLE IF NOT EXISTS "blog_api" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"blog_url" varchar,
	"blog_api" varchar,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'documents'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "documents" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_api" ADD CONSTRAINT "blog_api_user_id_userss_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userss"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
