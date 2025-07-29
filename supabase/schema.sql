

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






CREATE OR REPLACE FUNCTION "public"."get_nearby_pizzerias"("user_lat" double precision, "user_lon" double precision, "radius_km" double precision DEFAULT 10) RETURNS TABLE("id" "uuid", "name" "text", "address" "text", "latitude" numeric, "longitude" numeric, "phone" "text", "website" "text", "verified" boolean, "photos" "text"[], "description" "text", "hours" "jsonb", "price_range" integer, "business_type" "text", "cuisine_styles" "text"[], "api_source" "text", "yelp_id" "text", "rating_external" numeric, "review_count_external" integer, "last_updated" timestamp with time zone, "created_at" timestamp with time zone, "distance_km" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.address,
    p.latitude,
    p.longitude,
    p.phone,
    p.website,
    p.verified,
    p.photos,
    p.description,
    p.hours,
    p.price_range,
    p.business_type,
    p.cuisine_styles,
    p.api_source,
    p.yelp_id,
    p.rating_external,
    p.review_count_external,
    p.last_updated,
    p.created_at,
    -- Calculate distance using Haversine formula
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(p.latitude::FLOAT)) * 
        cos(radians(p.longitude::FLOAT) - radians(user_lon)) + 
        sin(radians(user_lat)) * 
        sin(radians(p.latitude::FLOAT))
      )
    )::FLOAT AS distance_km
  FROM pizzerias p
  WHERE (
    6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(p.latitude::FLOAT)) * 
      cos(radians(p.longitude::FLOAT) - radians(user_lon)) + 
      sin(radians(user_lat)) * 
      sin(radians(p.latitude::FLOAT))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$;


ALTER FUNCTION "public"."get_nearby_pizzerias"("user_lat" double precision, "user_lon" double precision, "radius_km" double precision) OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."update_pizzeria_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.last_updated = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_pizzeria_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


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
    "photo_metadata" "jsonb" DEFAULT '[]'::"jsonb",
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
    "hours" "jsonb",
    "price_range" integer,
    "business_type" "text",
    "cuisine_styles" "text"[],
    "api_source" "text" DEFAULT 'user_submitted'::"text",
    "yelp_id" "text",
    "rating_external" numeric(2,1),
    "review_count_external" integer DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "pizzerias_api_source_check" CHECK (("api_source" = ANY (ARRAY['yelp'::"text", 'user_submitted'::"text", 'foursquare'::"text", 'google'::"text", 'openstreetmap'::"text"]))),
    CONSTRAINT "pizzerias_business_type_check" CHECK (("business_type" = ANY (ARRAY['chain'::"text", 'independent'::"text", 'franchise'::"text"]))),
    CONSTRAINT "pizzerias_price_range_check" CHECK ((("price_range" >= 1) AND ("price_range" <= 4)))
);


ALTER TABLE "public"."pizzerias" OWNER TO "postgres";


COMMENT ON COLUMN "public"."pizzerias"."price_range" IS '1 = $, 2 = $$, 3 = $$$, 4 = $$$$';



COMMENT ON COLUMN "public"."pizzerias"."business_type" IS 'Type of business: chain, independent, or franchise';



COMMENT ON COLUMN "public"."pizzerias"."cuisine_styles" IS 'Array of pizza styles this place specializes in';



COMMENT ON COLUMN "public"."pizzerias"."api_source" IS 'Source where this pizzeria data came from';



COMMENT ON COLUMN "public"."pizzerias"."yelp_id" IS 'Yelp business ID for API correlation';



COMMENT ON COLUMN "public"."pizzerias"."rating_external" IS 'External API rating (e.g., Yelp rating)';



COMMENT ON COLUMN "public"."pizzerias"."review_count_external" IS 'Number of reviews on external platform';



CREATE TABLE IF NOT EXISTS "public"."saved_pizzerias" (
    "user_id" "uuid" NOT NULL,
    "pizzeria_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."saved_pizzerias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_achievements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "achievement_type" "text" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "metadata" "jsonb"
);


ALTER TABLE "public"."user_achievements" OWNER TO "postgres";


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


ALTER TABLE ONLY "public"."pizzeria_dough_styles"
    ADD CONSTRAINT "pizzeria_dough_styles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_pizzeria_id_user_id_key" UNIQUE ("pizzeria_id", "user_id");



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pizzerias"
    ADD CONSTRAINT "pizzerias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_pizzerias"
    ADD CONSTRAINT "saved_pizzerias_pkey" PRIMARY KEY ("user_id", "pizzeria_id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_achievement_unique" UNIQUE ("user_id", "achievement_type");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_pizzeria_dough_styles_pizzeria_id" ON "public"."pizzeria_dough_styles" USING "btree" ("pizzeria_id");



CREATE INDEX "idx_pizzeria_dough_styles_status" ON "public"."pizzeria_dough_styles" USING "btree" ("status");



CREATE INDEX "idx_pizzeria_ratings_photo_metadata" ON "public"."pizzeria_ratings" USING "gin" ("photo_metadata");



CREATE INDEX "idx_pizzeria_ratings_pizzeria_id" ON "public"."pizzeria_ratings" USING "btree" ("pizzeria_id");



CREATE INDEX "idx_pizzerias_api_source" ON "public"."pizzerias" USING "btree" ("api_source");



CREATE INDEX "idx_pizzerias_business_type" ON "public"."pizzerias" USING "btree" ("business_type");



CREATE INDEX "idx_pizzerias_location" ON "public"."pizzerias" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_pizzerias_price_range" ON "public"."pizzerias" USING "btree" ("price_range");



CREATE INDEX "idx_pizzerias_yelp_id" ON "public"."pizzerias" USING "btree" ("yelp_id");



CREATE INDEX "idx_saved_pizzerias_pizzeria_id" ON "public"."saved_pizzerias" USING "btree" ("pizzeria_id");



CREATE INDEX "idx_saved_pizzerias_user_id" ON "public"."saved_pizzerias" USING "btree" ("user_id");



CREATE INDEX "idx_user_achievements_type" ON "public"."user_achievements" USING "btree" ("achievement_type");



CREATE INDEX "idx_user_achievements_user_id" ON "public"."user_achievements" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."pizzerias" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_pizzerias_timestamp" BEFORE UPDATE ON "public"."pizzerias" FOR EACH ROW EXECUTE FUNCTION "public"."update_pizzeria_timestamp"();



ALTER TABLE ONLY "public"."pizzeria_dough_styles"
    ADD CONSTRAINT "pizzeria_dough_styles_pizzeria_id_fkey" FOREIGN KEY ("pizzeria_id") REFERENCES "public"."pizzerias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_pizzeria_id_fkey" FOREIGN KEY ("pizzeria_id") REFERENCES "public"."pizzerias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pizzeria_ratings"
    ADD CONSTRAINT "pizzeria_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_pizzerias"
    ADD CONSTRAINT "saved_pizzerias_pizzeria_id_fkey" FOREIGN KEY ("pizzeria_id") REFERENCES "public"."pizzerias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_pizzerias"
    ADD CONSTRAINT "saved_pizzerias_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_achievements"
    ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view approved dough styles" ON "public"."pizzeria_dough_styles" FOR SELECT USING (("status" = 'approved'::"text"));



CREATE POLICY "Anyone can view pizzeria ratings" ON "public"."pizzeria_ratings" FOR SELECT USING (true);



CREATE POLICY "Anyone can view pizzerias" ON "public"."pizzerias" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create pizzerias" ON "public"."pizzerias" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can submit dough styles" ON "public"."pizzeria_dough_styles" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "System can insert achievements" ON "public"."user_achievements" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create pizzeria ratings" ON "public"."pizzeria_ratings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own pizzeria ratings" ON "public"."pizzeria_ratings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can save pizzerias" ON "public"."saved_pizzerias" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unsave pizzerias" ON "public"."saved_pizzerias" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own pizzeria ratings" ON "public"."pizzeria_ratings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view all profiles" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can view own saved pizzerias" ON "public"."saved_pizzerias" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own achievements" ON "public"."user_achievements" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."pizzeria_dough_styles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pizzeria_ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pizzerias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_pizzerias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_nearby_pizzerias"("user_lat" double precision, "user_lon" double precision, "radius_km" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."get_nearby_pizzerias"("user_lat" double precision, "user_lon" double precision, "radius_km" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_nearby_pizzerias"("user_lat" double precision, "user_lon" double precision, "radius_km" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pizzeria_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_pizzeria_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pizzeria_timestamp"() TO "service_role";


















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



GRANT ALL ON TABLE "public"."saved_pizzerias" TO "anon";
GRANT ALL ON TABLE "public"."saved_pizzerias" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_pizzerias" TO "service_role";



GRANT ALL ON TABLE "public"."user_achievements" TO "anon";
GRANT ALL ON TABLE "public"."user_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_achievements" TO "service_role";



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
