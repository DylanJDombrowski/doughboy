-- Database setup for user_achievements table
-- Run this in your Supabase SQL editor

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_type" "text" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "timezone"('utc'::text, "now"()) NOT NULL,
    "metadata" "jsonb",
    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "user_achievements_user_achievement_unique" UNIQUE ("user_id", "achievement_type")
);

-- Enable RLS
ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own achievements" ON "public"."user_achievements" 
    FOR SELECT USING ("auth"."uid"() = "user_id");

CREATE POLICY "System can insert achievements" ON "public"."user_achievements" 
    FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX "idx_user_achievements_user_id" ON "public"."user_achievements" USING "btree" ("user_id");
CREATE INDEX "idx_user_achievements_type" ON "public"."user_achievements" USING "btree" ("achievement_type");

-- Grant permissions
GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";
