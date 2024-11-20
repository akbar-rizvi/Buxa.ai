ALTER TABLE "documents" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "is_posted" boolean DEFAULT false;