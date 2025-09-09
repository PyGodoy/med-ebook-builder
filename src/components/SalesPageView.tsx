import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface PageSection {
  id: string;
  section_type: 'hero' | 'text' | 'price' | 'carousel' | 'faq';
  content: any;
  order_index: number;
}

interface SalesPageViewProps {
  title: string;
  sections: PageSection[];
  isPreview?: boolean;
}

export const SalesPageView = ({ title, sections, isPreview = false }: SalesPageViewProps) => {
  const sortedSections = sections.sort((a, b) => a.order_index - b.order_index);

  const renderSection = (section: PageSection) => {
    switch (section.section_type) {
      case 'hero':
        return (
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                {section.content.title || 'Título Principal'}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {section.content.subtitle || 'Subtítulo descritivo'}
              </p>
            </div>
          </section>
        );

      case 'text':
        return (
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              {section.content.title && (
                <h2 className="text-3xl font-bold mb-8 text-center">
                  {section.content.title}
                </h2>
              )}
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {section.content.content || 'Conteúdo da seção...'}
                </p>
              </div>
            </div>
          </section>
        );

      case 'price':
        return (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 text-center">
              {section.content.title && (
                <h2 className="text-3xl font-bold mb-8">
                  {section.content.title}
                </h2>
              )}
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-primary mb-6">
                    {section.content.price || 'R$ 97,00'}
                  </div>
                  <div className="space-y-4">
                    {(section.content.buttons || []).map((button: any, index: number) => (
                      <Button
                        key={index}
                        asChild
                        size="lg"
                        className="w-full"
                        disabled={isPreview}
                      >
                        <a href={isPreview ? '#' : button.link} target={isPreview ? undefined : '_blank'}>
                          {button.text || 'Comprar Agora'}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        );

      case 'carousel':
        return (
          <section className="py-16">
            <div className="container mx-auto px-4">
              {section.content.title && (
                <h2 className="text-3xl font-bold mb-8 text-center">
                  {section.content.title}
                </h2>
              )}
              {(section.content.images || []).length > 0 ? (
                <Carousel className="max-w-4xl mx-auto">
                  <CarouselContent>
                    {section.content.images.map((image: any, index: number) => (
                      <CarouselItem key={index}>
                        <Card>
                          <CardContent className="p-6">
                            <div className="text-center">
                              {image.url && (
                                <img
                                  src={image.url}
                                  alt={image.title || 'Imagem'}
                                  className="w-full h-64 object-cover rounded-lg mb-4"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                              )}
                              {image.title && (
                                <h3 className="text-xl font-semibold mb-2">
                                  {image.title}
                                </h3>
                              )}
                              {image.subtitle && (
                                <p className="text-muted-foreground">
                                  {image.subtitle}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <div className="text-center text-muted-foreground">
                  Nenhuma imagem adicionada ainda
                </div>
              )}
            </div>
          </section>
        );

      case 'faq':
        return (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-3xl">
              {section.content.title && (
                <h2 className="text-3xl font-bold mb-8 text-center">
                  {section.content.title}
                </h2>
              )}
              {(section.content.items || []).length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {section.content.items.map((item: any, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question || 'Pergunta sem título'}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="whitespace-pre-wrap">
                          {item.answer || 'Resposta não definida'}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center text-muted-foreground">
                  Nenhuma pergunta adicionada ainda
                </div>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Preview banner */}
      {isPreview && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-sm">
          Modo Preview - Esta é uma visualização da sua página de vendas
        </div>
      )}

      {/* Page content */}
      <main>
        {sortedSections.map((section) => (
          <div key={section.id}>
            {renderSection(section)}
          </div>
        ))}
        
        {sections.length === 0 && (
          <section className="py-24">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">
                {title || 'Título da Página'}
              </h1>
              <p className="text-xl text-muted-foreground">
                Adicione seções para construir sua página de vendas
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 E-book Sales. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};