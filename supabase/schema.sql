-- Enable Row Level Security on all tables
-- Run this in Supabase SQL Editor

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple', 'yesno')),
  category TEXT NOT NULL,
  duration_end TIMESTAMP WITH TIME ZONE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vote_count INTEGER DEFAULT 0
);

-- Enable RLS on polls
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
-- Anyone can read polls
CREATE POLICY "Anyone can read polls" ON polls
  FOR SELECT USING (true);

-- Only authenticated users can insert polls
CREATE POLICY "Authenticated users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Only the creator can update their own polls
CREATE POLICY "Creators can update own polls" ON polls
  FOR UPDATE USING (auth.uid() = creator_id);

-- Only the creator can delete their own polls
CREATE POLICY "Creators can delete own polls" ON polls
  FOR DELETE USING (auth.uid() = creator_id);

-- Optional: Index for performance
CREATE INDEX idx_polls_creator_id ON polls(creator_id);
CREATE INDEX idx_polls_category ON polls(category);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_polls_duration_end ON polls(duration_end) WHERE duration_end IS NOT NULL;
