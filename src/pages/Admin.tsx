import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Eye, Trash2, Globe, FileText, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SalesPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, loading, signOut, isAdmin } = useAuth();
  const [pages, setPages] = useState<SalesPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && isAdmin) {
      fetchPages();
    }
  }, [user, isAdmin]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as páginas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... keep existing code (togglePublish and deletePage functions)

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sales_pages')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setPages(pages.map(page => 
        page.id === id ? { ...page, is_published: !currentStatus } : page
      ));
      
      toast({
        title: !currentStatus ? "Página publicada" : "Página despublicada",
        description: !currentStatus 
          ? "Sua página agora está visível publicamente." 
          : "Sua página foi movida para rascunho.",
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da página.",
        variant: "destructive",
      });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página?')) return;

    try {
      const { error } = await supabase
        .from('sales_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPages(pages.filter(page => page.id !== id));
      toast({
        title: "Página excluída",
        description: "A página foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a página.",
        variant: "destructive",
      });
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

  // Check if user is admin
  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Suas Páginas de Vendas</h2>
            <p className="text-muted-foreground mt-2">
              Gerencie suas páginas de vendas de e-books
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/access-control">
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Controle de Acesso
              </Button>
            </Link>
            <Link to="/admin/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Página
              </Button>
            </Link>
          </div>
        </div>

        {pages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Nenhuma página criada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira página de vendas
              </p>
              <Link to="/admin/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Página
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{page.title}</span>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          page.is_published ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        title={page.is_published ? 'Publicada' : 'Rascunho'}
                      />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    /{page.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Status: {page.is_published ? 'Publicada' : 'Rascunho'}
                      </span>
                      <Button
                        variant={page.is_published ? "secondary" : "default"}
                        size="sm"
                        onClick={() => togglePublish(page.id, page.is_published)}
                      >
                        {page.is_published ? (
                          <>
                            <FileText className="w-4 h-4 mr-1" />
                            Despublicar
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4 mr-1" />
                            Publicar
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/edit/${page.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {page.is_published && (
                          <Link to={`/${page.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePage(page.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;