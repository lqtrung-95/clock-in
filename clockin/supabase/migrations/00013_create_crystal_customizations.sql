-- Crystal shapes available
CREATE TYPE public.crystal_shape AS ENUM (
  'icosahedron',
  'dodecahedron',
  'octahedron',
  'tetrahedron',
  'torus_knot'
);

-- Crystal color themes
CREATE TYPE public.crystal_color AS ENUM (
  'blue',
  'purple',
  'emerald',
  'amber',
  'rose',
  'cyan',
  'gold',
  'obsidian'
);

-- Crystal visual themes
CREATE TYPE public.crystal_theme AS ENUM (
  'default',
  'ethereal',
  'fiery',
  'ocean',
  'cosmic',
  'forest'
);

CREATE TABLE public.crystal_customizations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_shapes public.crystal_shape[] NOT NULL DEFAULT ARRAY['icosahedron']::public.crystal_shape[],
  unlocked_colors public.crystal_color[] NOT NULL DEFAULT ARRAY['blue']::public.crystal_color[],
  unlocked_themes public.crystal_theme[] NOT NULL DEFAULT ARRAY['default']::public.crystal_theme[],
  active_shape public.crystal_shape NOT NULL DEFAULT 'icosahedron',
  active_color public.crystal_color NOT NULL DEFAULT 'blue',
  active_theme public.crystal_theme NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crystal_customizations_user_id ON public.crystal_customizations(user_id);

ALTER TABLE public.crystal_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crystal customizations"
  ON public.crystal_customizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own crystal customizations"
  ON public.crystal_customizations FOR UPDATE
  USING (auth.uid() = user_id);
