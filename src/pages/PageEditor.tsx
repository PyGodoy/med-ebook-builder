import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Eye, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SectionEditor } from '@/components/SectionEditor';
import { PagePreview } from '@/components/PagePreview';

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
}

const PageEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [page, setPage] = useState<SalesPage | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const isCreate = id === 'create';

  useEffect(() => {
    if (user) {
      if (isCreate) {
        // Create mode - initialize empty page
        setTitle('');
        setSlug('');
        setSections([]);
        setIsLoading(false);
      } else {
        fetchPage();
      }
    }
  }, [user, id, isCreate]);

  const fetchPage = async () => {
    if (!id || isCreate) return;

    try {
      const { data: pageData, error: pageError } = await supabase
        .from('sales_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (pageError) throw pageError;

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', id)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      setPage(pageData);
      setTitle(pageData.title);
      setSlug(pageData.slug);
      setSections((sectionsData || []) as PageSection[]);
    } catch (error) {
      console.error('Error fetching page:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a página.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isCreate || !page) {
      setSlug(generateSlug(newTitle));
    }
  };

  const savePage = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({
        title: "Erro",
        description: "Título e slug são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let pageId = id;

      if (isCreate) {
        // Create new page
        const { data, error } = await supabase
          .from('sales_pages')
          .insert({
            title: title.trim(),
            slug: slug.trim(),
            is_published: false,
            user_id: user!.id,
          })
          .select()
          .single();

        if (error) throw error;
        pageId = data.id;
        setPage(data);
        navigate(`/admin/edit/${pageId}`, { replace: true });
      } else {
        // Update existing page
        const { error } = await supabase
          .from('sales_pages')
          .update({
            title: title.trim(),
            slug: slug.trim(),
          })
          .eq('id', pageId);

        if (error) throw error;
      }

      // Save sections
      for (const section of sections) {
        if (section.id.startsWith('temp-')) {
          // New section
          const { error } = await supabase
            .from('page_sections')
            .insert({
              page_id: pageId,
              section_type: section.section_type,
              content: section.content,
              order_index: section.order_index,
            });

          if (error) throw error;
        } else {
          // Update existing section
          const { error } = await supabase
            .from('page_sections')
            .update({
              content: section.content,
              order_index: section.order_index,
            })
            .eq('id', section.id);

          if (error) throw error;
        }
      }

      toast({
        title: "Sucesso",
        description: "Página salva com sucesso!",
      });

      // Refresh data
      if (!isCreate) {
        fetchPage();
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a página.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = (type: PageSection['section_type']) => {
    const newSection: PageSection = {
      id: `temp-${Date.now()}`,
      section_type: type,
      content: getDefaultContent(type),
      order_index: sections.length,
    };

    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, content: any) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, content }
        : section
    ));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const getDefaultContent = (type: PageSection['section_type']) => {
    switch (type) {
      case 'hero':
        return { title: 'Título Principal', subtitle: 'Subtítulo' };
      case 'text':
        return { title: 'Seção de Texto', content: 'Conteúdo da seção...' };
      case 'price':
        return { 
          title: 'Preço e Compra',
          price: 'R$ 97,00',
          buttons: [{ text: 'Comprar Agora', link: '#' }]
        };
      case 'carousel':
        return {
          title: 'Galeria de Imagens',
          images: []
        };
      case 'faq':
        return {
          title: 'Perguntas Frequentes',
          items: [
            { question: 'Pergunta exemplo?', answer: 'Resposta exemplo.' }
          ]
        };
      default:
        return {};
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (showPreview) {
    return (
      <PagePreview
        title={title}
        sections={sections}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold">
                {isCreate ? 'Nova Página' : 'Editar Página'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={savePage}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configurações da Página</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título da Página</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: E-book Anatomia Muscular"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL da Página</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="anatomia-muscular"
              />
              <p className="text-sm text-muted-foreground mt-1">
                A página ficará disponível em: /{slug}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Seções da Página</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('hero')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Hero
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('text')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Texto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('price')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Preço
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('carousel')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Carrossel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('faq')}
              >
                <Plus className="w-4 h-4 mr-2" />
                FAQ
              </Button>
            </div>
          </div>

          {sections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Nenhuma seção adicionada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando seções à sua página de vendas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onUpdate={(content) => updateSection(section.id, content)}
                  onRemove={() => removeSection(section.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PageEditor;