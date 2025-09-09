import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PenTool, Eye, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            E-book Sales
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Crie páginas de vendas profissionais para seus e-books de medicina com nosso editor intuitivo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Começar Agora
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa para vender seus e-books
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para estudantes de medicina criarem páginas de vendas profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <PenTool className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Editor Intuitivo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Crie e edite suas páginas com facilidade usando nosso editor visual
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Layout Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Layouts fixos e otimizados especificamente para venda de e-books médicos
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Eye className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Preview em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Veja como sua página ficará antes de publicar com nosso sistema de preview
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Publicação Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Publique suas páginas instantaneamente com URLs personalizadas
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Crie sua primeira página de vendas em minutos e comece a vender seus e-books hoje mesmo
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Criar Conta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 E-book Sales. Feito especialmente para estudantes de medicina.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
