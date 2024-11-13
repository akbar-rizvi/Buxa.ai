ALTER TABLE "userss" ADD COLUMN "used_credits" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "userss" ADD COLUMN "total_content" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "userss" ADD COLUMN "total_research" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "userss" ADD COLUMN "total_alerts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "userss" ADD COLUMN "credits_on_content" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "userss" ADD COLUMN "credits_on_research" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "userss" ADD COLUMN "credits_on_alerts" integer DEFAULT 0;