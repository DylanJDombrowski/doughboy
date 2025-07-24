-- Create storage buckets
insert into storage.buckets (id, name, public) values ('pizzeria-photos', 'pizzeria-photos', true);
insert into storage.buckets (id, name, public) values ('recipe-photos', 'recipe-photos', true);
insert into storage.buckets (id, name, public) values ('profile-photos', 'profile-photos', true);

-- Set up RLS policies for pizzeria-photos bucket
create policy "Pizzeria photos are publicly accessible"
on storage.objects for select
using (bucket_id = 'pizzeria-photos');

create policy "Users can upload pizzeria photos if authenticated"
on storage.objects for insert
with check (
  bucket_id = 'pizzeria-photos' 
  and auth.role() = 'authenticated'
);

create policy "Users can update their own pizzeria photos"
on storage.objects for update
using (
  bucket_id = 'pizzeria-photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own pizzeria photos"
on storage.objects for delete
using (
  bucket_id = 'pizzeria-photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up RLS policies for recipe-photos bucket
create policy "Recipe photos are publicly accessible"
on storage.objects for select
using (bucket_id = 'recipe-photos');

create policy "Users can upload recipe photos if authenticated"
on storage.objects for insert
with check (
  bucket_id = 'recipe-photos' 
  and auth.role() = 'authenticated'
);

create policy "Users can update their own recipe photos"
on storage.objects for update
using (
  bucket_id = 'recipe-photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own recipe photos"
on storage.objects for delete
using (
  bucket_id = 'recipe-photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up RLS policies for profile-photos bucket
create policy "Profile photos are publicly accessible"
on storage.objects for select
using (bucket_id = 'profile-photos');

create policy "Users can upload their own profile photos"
on storage.objects for insert
with check (
  bucket_id = 'profile-photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own profile photos"
on storage.objects for update
using (
  bucket_id = 'profile-photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own profile photos"
on storage.objects for delete
using (
  bucket_id = 'profile-photos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Update the recipe_ratings table to add photos column if not already exists
-- This would be needed if the photos column wasn't already in the schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'recipe_ratings' 
    AND column_name = 'photos'
  ) THEN
    ALTER TABLE public.recipe_ratings ADD COLUMN photos TEXT[] DEFAULT '{}';
  END IF;
END
$$;
