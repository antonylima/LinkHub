-- ==============================================================================
-- LINKHUB - SUPABASE DATABASE SCHEMA
-- Execute este script no SQL Editor do seu projeto Supabase (https://supabase.com)
-- ==============================================================================

-- 1. Criação da tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Folder',
    color TEXT NOT NULL DEFAULT 'indigo',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Criação da tabela de Links
CREATE TABLE IF NOT EXISTS public.links (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    custom_icon TEXT,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Índices para ganho de performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_category_id ON public.links(category_id);
CREATE INDEX IF NOT EXISTS idx_links_is_favorite ON public.links(is_favorite);

-- 4. Habilitação de Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Segurança (RLS) para Categories
DROP POLICY IF EXISTS "Usuários podem ver suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem ver suas próprias categorias"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem criar suas próprias categorias"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem atualizar suas próprias categorias"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias categorias" ON public.categories;
CREATE POLICY "Usuários podem deletar suas próprias categorias"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Políticas de Segurança (RLS) para Links
DROP POLICY IF EXISTS "Usuários podem ver seus próprios links" ON public.links;
CREATE POLICY "Usuários podem ver seus próprios links"
    ON public.links FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar seus próprios links" ON public.links;
CREATE POLICY "Usuários podem criar seus próprios links"
    ON public.links FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios links" ON public.links;
CREATE POLICY "Usuários podem atualizar seus próprios links"
    ON public.links FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios links" ON public.links;
CREATE POLICY "Usuários podem deletar seus próprios links"
    ON public.links FOR DELETE
    USING (auth.uid() = user_id);
