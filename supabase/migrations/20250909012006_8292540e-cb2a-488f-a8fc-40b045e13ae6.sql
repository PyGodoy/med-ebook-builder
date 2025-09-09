-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar tabela de páginas de vendas
CREATE TABLE public.sales_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS para sales_pages
ALTER TABLE public.sales_pages ENABLE ROW LEVEL SECURITY;

-- Políticas para sales_pages
CREATE POLICY "Users can manage their own pages" ON public.sales_pages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published pages" ON public.sales_pages
  FOR SELECT USING (is_published = true);

-- Criar tabela de seções das páginas
CREATE TABLE public.page_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid NOT NULL REFERENCES public.sales_pages(id) ON DELETE CASCADE,
  section_type text NOT NULL CHECK (section_type IN ('hero', 'text', 'price', 'carousel', 'faq')),
  content jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS para page_sections
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Políticas para page_sections
CREATE POLICY "Users can manage sections of their own pages" ON public.page_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sales_pages 
      WHERE id = page_sections.page_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view sections of published pages" ON public.page_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sales_pages 
      WHERE id = page_sections.page_id AND is_published = true
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_pages_updated_at
  BEFORE UPDATE ON public.sales_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('page-images', 'page-images', true);

-- Políticas para storage de imagens
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'page-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view all images" ON storage.objects
  FOR SELECT USING (bucket_id = 'page-images');