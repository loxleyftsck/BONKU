-- BONKU v5.1 Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  settings JSONB DEFAULT '{
    "currency": "IDR",
    "theme": "system",
    "notifications_enabled": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 2. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  behavior_tag TEXT CHECK (behavior_tag IN ('planned', 'impulsive', 'essential')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);

-- RLS Policies for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. EDUCATION_MODULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.education_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('inflation', 'behavioral', 'budgeting', 'investing')),
  estimated_time INTEGER NOT NULL DEFAULT 5,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_education_modules_slug ON public.education_modules(slug);
CREATE INDEX IF NOT EXISTS idx_education_modules_category ON public.education_modules(category);

-- RLS Policies (public read)
ALTER TABLE public.education_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view education modules"
  ON public.education_modules FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 4. USER_PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.education_modules(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON public.user_progress(module_id);

-- RLS Policies
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. AI_INSIGHTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('spending_alert', 'saving_opportunity', 'inflation_impact', 'behavior_pattern')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  actionable BOOLEAN DEFAULT FALSE,
  actions JSONB,
  dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed ON public.ai_insights(dismissed);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_insights(type);

-- RLS Policies
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON public.ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. INFLATION_DATA TABLE (Admin managed)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inflation_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  month TEXT UNIQUE NOT NULL,
  overall_rate NUMERIC(5,2) NOT NULL,
  food NUMERIC(5,2),
  transportation NUMERIC(5,2),
  housing NUMERIC(5,2),
  healthcare NUMERIC(5,2),
  education NUMERIC(5,2),
  source TEXT DEFAULT 'BPS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for month lookups
CREATE INDEX IF NOT EXISTS idx_inflation_data_month ON public.inflation_data(month DESC);

-- RLS Policies (public read)
ALTER TABLE public.inflation_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view inflation data"
  ON public.inflation_data FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_modules_updated_at BEFORE UPDATE ON public.education_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE! Tables created with RLS enabled
-- =====================================================
