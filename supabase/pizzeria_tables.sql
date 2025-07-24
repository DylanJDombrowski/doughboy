-- Update pizzerias table to add the new fields
ALTER TABLE pizzerias 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hours TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create pizzeria_ratings table
CREATE TABLE IF NOT EXISTS pizzeria_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pizzeria_id UUID NOT NULL REFERENCES pizzerias(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  crust_rating SMALLINT NOT NULL CHECK (crust_rating BETWEEN 1 AND 5),
  review TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(pizzeria_id, user_id)
);

-- Create saved_pizzerias table
CREATE TABLE IF NOT EXISTS saved_pizzerias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pizzeria_id UUID NOT NULL REFERENCES pizzerias(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pizzeria_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pizzeria_ratings_pizzeria_id ON pizzeria_ratings(pizzeria_id);
CREATE INDEX IF NOT EXISTS idx_pizzeria_ratings_user_id ON pizzeria_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_pizzerias_user_id ON saved_pizzerias(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_pizzerias_pizzeria_id ON saved_pizzerias(pizzeria_id);

-- Set up RLS (Row Level Security) policies

-- Pizzeria ratings policies
ALTER TABLE pizzeria_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pizzeria ratings are viewable by everyone"
  ON pizzeria_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own pizzeria ratings"
  ON pizzeria_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pizzeria ratings"
  ON pizzeria_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pizzeria ratings"
  ON pizzeria_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Saved pizzerias policies
ALTER TABLE saved_pizzerias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved pizzerias"
  ON saved_pizzerias FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved pizzerias"
  ON saved_pizzerias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved pizzerias"
  ON saved_pizzerias FOR DELETE
  USING (auth.uid() = user_id);
