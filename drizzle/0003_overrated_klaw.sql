ALTER TABLE "blog_api" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_api" ADD COLUMN "blog_type" varchar;--> statement-breakpoint
ALTER TABLE "blog_api" ADD COLUMN "blog_site" jsonb;--> statement-breakpoint
ALTER TABLE "blog_api" DROP COLUMN IF EXISTS "blog_url";--> statement-breakpoint
ALTER TABLE "blog_api" DROP COLUMN IF EXISTS "blog_api";--> statement-breakpoint
ALTER TABLE "userss" DROP COLUMN IF EXISTS "user_blog_api";--> statement-breakpoint
ALTER TABLE "userss" DROP COLUMN IF EXISTS "blog_url";