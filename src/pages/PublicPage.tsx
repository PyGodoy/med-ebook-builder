import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SalesPageView } from '@/components/SalesPageView';

interface PageSection {
  id: string;
  section_type: 'hero' | 'text' | 'price' | 'carousel' | 'faq';
  content: any;
  order_index: number;
}

interface SalesPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  primary_color: string;
}

const PublicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<SalesPage | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      // Fetch published page by slug
      const { data: pageData, error: pageError } = await supabase
        .from('sales_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (pageError) {
        if (pageError.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw pageError;
        }
        return;
      }

      // Fetch sections for the page
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageData.id)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      setPage(pageData);
      setPrimaryColor(pageData.primary_color || '#3b82f6');
      setSections((sectionsData || []) as PageSection[]);
    } catch (error) {
      console.error('Error fetching public page:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{page.title}</title>
      <meta name="description" content={`${page.title} - Página de vendas`} />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={`${page.title} - Página de vendas`} />
      <meta property="og:type" content="website" />
      
      <SalesPageView title={page.title} sections={sections} primaryColor={primaryColor} />
    </>
  );
};

export default PublicPage;