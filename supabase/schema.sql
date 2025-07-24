

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ingredients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "recipe_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "unit" "text" NOT NULL,
    "percentage" numeric,
    "order_index" integer NOT NULL
);


ALTER TABLE "public"."ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pizzeria_dough_styles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pizzeria_id" "uuid" NOT NULL,
    "dough_style" "text" NOT NULL,
    "user_submitted" boolean DEFAULT true,
    "votes_up" integer DEFAULT 0,
    "votes_down" integer DEFAULT 0,
    "status" "text" DEFAULT 'pending'::"text",
    "moderator_notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "pizzeria_dough_styles_dough_style_check" CHECK (("dough_style" = ANY (ARRAY['neapolitan'::"text", 'ny_style'::"text", 'chicago_deep_dish'::"text", 'sicilian'::"text", 'focaccia'::"text", 'sourdough'::"text", 'detroit_style'::"text", 'pan_pizza'::"text", 'thin_crust'::"text", 'whole_wheat'::"text", 'gluten_free'::"text"]))),
    CONSTRAINT "pizzeria_dough_styles_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."pizzeria_dough_styles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pizzeria_ratings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "pizzeria_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "overall_rating" integer NOT NULL,
    "crust_rating" integer NOT NULL,
    "review" "text",
    "photos" "text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "pizzeria_ratings_crust_rating_check" CHECK ((("crust_rating" >= 1) AND ("crust_rating" <= 5))),
    CONSTRAINT "pizzeria_ratings_overall_rating_check" CHECK ((("overall_rating" >= 1) AND ("overall_rating" <= 5)))
);


ALTER TABLE "public"."pizzeria_ratings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pizzeria_rating_summary" AS
 SELECT "pizzeria_id",
    "count"(*) AS "total_ratings",
    "round"("avg"("overall_rating"), 1) AS "avg_overall_rating",
    "round"("avg"("crust_rating"), 1) AS "avg_crust_rating",
    "count"(*) FILTER (WHERE ("overall_rating" = 5)) AS "five_star_count",
    "count"(*) FILTER (WHERE ("overall_rating" = 4)) AS "four_star_count",
    "count"(*) FILTER (WHERE ("overall_rating" = 3)) AS "three_star_count",
    "count"(*) FILTER (WHERE ("overall_rating" = 2)) AS "two_star_count",
    "count"(*) FILTER (WHERE ("overall_rating" = 1)) AS "one_star_count"
   FROM "public"."pizzeria_ratings"
  GROUP BY "pizzeria_id";


ALTER VIEW "public"."pizzeria_rating_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pizzerias" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "latitude" numeric NOT NULL,
    "longitude" numeric NOT NULL,
    "phone" "text",
    "website" "text",
    "verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "photos" "text"[],
    "description" "text",
    "hours" "jsonb"
);


ALTER TABLE "public"."pizzerias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."process_steps" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "recipe_id" "uuid" NOT NULL,
    "step_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "duration_minutes" integer,
    "temperature" integer,
    "order_index" integer NOT NULL
);


ALTER TABLE "public"."process_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipe_ratings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "recipe_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "overall_rating" integer NOT NULL,
    "review" "text",
    "photos" "text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "crust_rating" integer,
    CONSTRAINT "recipe_ratings_crust_rating_check" CHECK ((("crust_rating" >= 1) AND ("crust_rating" <= 5))),
    CONSTRAINT "recipe_ratings_rating_check" CHECK ((("overall_rating" >= 1) AND ("overall_rating" <= 5)))
);


ALTER TABLE "public"."recipe_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "difficulty" integer NOT NULL,
    "total_time_minutes" integer NOT NULL,
    "servings" integer NOT NULL,
    "hydration_percentage" numeric,
    "is_featured" boolean DEFAULT false,
    "is_public" boolean DEFAULT true,
    "photos" "text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "recipes_category_check" CHECK (("category" = ANY (ARRAY['neapolitan'::"text", 'ny_style'::"text", 'chicago_deep_dish'::"text", 'sicilian'::"text", 'focaccia'::"text", 'sourdough'::"text", 'detroit_style'::"text", 'pan_pizza'::"text", 'thin_crust'::"text", 'whole_wheat'::"text", 'gluten_free'::"text"]))),
    CONSTRAINT "recipes_difficulty_check" CHECK ((("difficulty" >= 1) AND ("difficulty" <= 5)))
);


ALTER TABLE "public"."recipes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_pizzerias" (
    "user_id" "uuid" NOT NULL,
    "pizzeria_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."saved_pizzerias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_recipes" (
    "user_id" "uuid" NOT NULL,
    "recipe_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."saved_recipes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "username" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "location" "text",
    "current_latitude" numeric,
    "current_longitude" numeric,
    "manual_address" "text",
    "use_manual_location" boolean DEFAULT false,
    "role" "text" DEFAULT 'user'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text", 'moderator'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ingredients"
    ADD CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pizzeria_dough_styles"
    ADD CONSTRAINT "pizzeria_dough_styles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_pizzeria_id_user_id_key" UNIQUE ("pizzeria_id", "user_id");



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pizzerias"
    ADD CONSTRAINT "pizzerias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_steps"
    ADD CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_ratings"
    ADD CONSTRAINT "recipe_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_ratings"
    ADD CONSTRAINT "recipe_ratings_recipe_id_user_id_key" UNIQUE ("recipe_id", "user_id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_pizzerias"
    ADD CONSTRAINT "saved_pizzerias_pkey" PRIMARY KEY ("user_id", "pizzeria_id");



ALTER TABLE ONLY "public"."saved_recipes"
    ADD CONSTRAINT "saved_recipes_pkey" PRIMARY KEY ("user_id", "recipe_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_pizzeria_dough_styles_pizzeria_id" ON "public"."pizzeria_dough_styles" USING "btree" ("pizzeria_id");



CREATE INDEX "idx_pizzeria_dough_styles_status" ON "public"."pizzeria_dough_styles" USING "btree" ("status");



CREATE INDEX "idx_pizzeria_ratings_pizzeria_id" ON "public"."pizzeria_ratings" USING "btree" ("pizzeria_id");



CREATE INDEX "idx_saved_pizzerias_pizzeria_id" ON "public"."saved_pizzerias" USING "btree" ("pizzeria_id");



CREATE INDEX "idx_saved_pizzerias_user_id" ON "public"."saved_pizzerias" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."pizzerias" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."recipes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."ingredients"
    ADD CONSTRAINT "ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pizzeria_dough_styles"
    ADD CONSTRAINT "pizzeria_dough_styles_pizzeria_id_fkey" FOREIGN KEY ("pizzeria_id") REFERENCES "public"."pizzerias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_pizzeria_id_fkey" FOREIGN KEY ("pizzeria_id") REFERENCES "public"."pizzerias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."process_steps"
    ADD CONSTRAINT "process_steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_ratings"
    ADD CONSTRAINT "recipe_ratings_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_ratings"
    ADD CONSTRAINT "recipe_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_pizzerias"
    ADD CONSTRAINT "saved_pizzerias_pizzeria_id_fkey" FOREIGN KEY ("pizzeria_id") REFERENCES "public"."pizzerias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_pizzerias"
    ADD CONSTRAINT "saved_pizzerias_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_recipes"
    ADD CONSTRAINT "saved_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_recipes"
    ADD CONSTRAINT "saved_recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view approved dough styles" ON "public"."pizzeria_dough_styles" FOR SELECT USING (("status" = 'approved'::"text"));



CREATE POLICY "Anyone can view pizzeria ratings" ON "public"."pizzeria_ratings" FOR SELECT USING (true);



CREATE POLICY "Anyone can view pizzerias" ON "public"."pizzerias" FOR SELECT USING (true);



CREATE POLICY "Anyone can view public recipes" ON "public"."recipes" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Anyone can view ratings" ON "public"."recipe_ratings" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create pizzerias" ON "public"."pizzerias" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can submit dough styles" ON "public"."pizzeria_dough_styles" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Ingredients follow recipe visibility" ON "public"."ingredients" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."recipes"
  WHERE (("recipes"."id" = "ingredients"."recipe_id") AND (("recipes"."is_public" = true) OR ("recipes"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Steps follow recipe visibility" ON "public"."process_steps" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."recipes"
  WHERE (("recipes"."id" = "process_steps"."recipe_id") AND (("recipes"."is_public" = true) OR ("recipes"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can create pizzeria ratings" ON "public"."pizzeria_ratings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create ratings" ON "public"."recipe_ratings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create recipes" ON "public"."recipes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own pizzeria ratings" ON "public"."pizzeria_ratings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own ratings" ON "public"."recipe_ratings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own recipes" ON "public"."recipes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage ingredients for own recipes" ON "public"."ingredients" USING ((EXISTS ( SELECT 1
   FROM "public"."recipes"
  WHERE (("recipes"."id" = "ingredients"."recipe_id") AND ("recipes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage steps for own recipes" ON "public"."process_steps" USING ((EXISTS ( SELECT 1
   FROM "public"."recipes"
  WHERE (("recipes"."id" = "process_steps"."recipe_id") AND ("recipes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can save pizzerias" ON "public"."saved_pizzerias" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can save recipes" ON "public"."saved_recipes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unsave pizzerias" ON "public"."saved_pizzerias" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unsave recipes" ON "public"."saved_recipes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own pizzeria ratings" ON "public"."pizzeria_ratings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own ratings" ON "public"."recipe_ratings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own recipes" ON "public"."recipes" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view all profiles" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can view own recipes" ON "public"."recipes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own saved pizzerias" ON "public"."saved_pizzerias" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own saved recipes" ON "public"."saved_recipes" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ingredients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pizzeria_dough_styles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pizzeria_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pizzerias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."process_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipe_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_pizzerias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_recipes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."ingredients" TO "anon";
GRANT ALL ON TABLE "public"."ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredients" TO "service_role";



GRANT ALL ON TABLE "public"."pizzeria_dough_styles" TO "anon";
GRANT ALL ON TABLE "public"."pizzeria_dough_styles" TO "authenticated";
GRANT ALL ON TABLE "public"."pizzeria_dough_styles" TO "service_role";



GRANT ALL ON TABLE "public"."pizzeria_ratings" TO "anon";
GRANT ALL ON TABLE "public"."pizzeria_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."pizzeria_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."pizzeria_rating_summary" TO "anon";
GRANT ALL ON TABLE "public"."pizzeria_rating_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."pizzeria_rating_summary" TO "service_role";



GRANT ALL ON TABLE "public"."pizzerias" TO "anon";
GRANT ALL ON TABLE "public"."pizzerias" TO "authenticated";
GRANT ALL ON TABLE "public"."pizzerias" TO "service_role";



GRANT ALL ON TABLE "public"."process_steps" TO "anon";
GRANT ALL ON TABLE "public"."process_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."process_steps" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_ratings" TO "anon";
GRANT ALL ON TABLE "public"."recipe_ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_ratings" TO "service_role";



GRANT ALL ON TABLE "public"."recipes" TO "anon";
GRANT ALL ON TABLE "public"."recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."recipes" TO "service_role";



GRANT ALL ON TABLE "public"."saved_pizzerias" TO "anon";
GRANT ALL ON TABLE "public"."saved_pizzerias" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_pizzerias" TO "service_role";



GRANT ALL ON TABLE "public"."saved_recipes" TO "anon";
GRANT ALL ON TABLE "public"."saved_recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_recipes" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
