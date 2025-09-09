import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Upload, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PageSection {
  id: string;
  section_type: 'hero' | 'text' | 'price' | 'carousel' | 'faq';
  content: any;
  order_index: number;
}

interface SectionEditorProps {
  section: PageSection;
  onUpdate: (content: any) => void;
  onRemove: () => void;
}

export const SectionEditor = ({ section, onUpdate, onRemove }: SectionEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const updateContent = (updates: any) => {
    onUpdate({ ...section.content, ...updates });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      updateContent({ backgroundImage: publicUrl });
      
      toast({
        title: "Sucesso",
        description: "Imagem de background carregada com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeBackgroundImage = () => {
    updateContent({ backgroundImage: null });
  };

  const renderEditor = () => {
    switch (section.section_type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título Principal</Label>
              <Input
                value={section.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Título do seu e-book"
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Textarea
                value={section.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                placeholder="Descrição complementar"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label>Imagem de Background</Label>
              {section.content.backgroundImage ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img 
                      src={section.content.backgroundImage} 
                      alt="Background preview" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeBackgroundImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique para adicionar uma imagem de background
                  </p>
                  <input
                    type="file"
                    id="hero-background"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('hero-background')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Carregando...' : 'Escolher Imagem'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título da Seção</Label>
              <Input
                value={section.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Título da seção"
              />
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                value={section.content.content || ''}
                onChange={(e) => updateContent({ content: e.target.value })}
                placeholder="Escreva o conteúdo da seção..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        );

      case 'price':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título da Seção</Label>
              <Input
                value={section.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Oferta Especial!"
              />
            </div>
            <div>
              <Label>Conteúdo da Seção</Label>
              <Textarea
                value={section.content.content || ''}
                onChange={(e) => updateContent({ content: e.target.value })}
                placeholder="Descreva os benefícios e o valor da oferta..."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label>Preço</Label>
              <Input
                value={section.content.price || ''}
                onChange={(e) => updateContent({ price: e.target.value })}
                placeholder="R$ 97,00"
              />
            </div>
            <div>
              <Label>Observação</Label>
              <Textarea
                value={section.content.note || ''}
                onChange={(e) => updateContent({ note: e.target.value })}
                placeholder="Oferta válida por tempo limitado..."
                className="min-h-[60px]"
              />
            </div>
            <div>
              <Label>Botões de Compra</Label>
              {(section.content.buttons || []).map((button: any, index: number) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={button.text || ''}
                      onChange={(e) => {
                        const newButtons = [...(section.content.buttons || [])];
                        newButtons[index] = { ...button, text: e.target.value };
                        updateContent({ buttons: newButtons });
                      }}
                      placeholder="COMPRAR AGORA"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={button.link || ''}
                      onChange={(e) => {
                        const newButtons = [...(section.content.buttons || [])];
                        newButtons[index] = { ...button, link: e.target.value };
                        updateContent({ buttons: newButtons });
                      }}
                      placeholder="Link do botão"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newButtons = (section.content.buttons || []).filter((_: any, i: number) => i !== index);
                      updateContent({ buttons: newButtons });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newButtons = [...(section.content.buttons || []), { text: '', link: '' }];
                  updateContent({ buttons: newButtons });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Botão
              </Button>
            </div>
          </div>
        );

      case 'carousel':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título da Seção</Label>
              <Input
                value={section.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Galeria de Imagens"
              />
            </div>
            <div>
              <Label>Imagens</Label>
              {(section.content.images || []).map((image: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label>URL da Imagem</Label>
                        <Input
                          value={image.url || ''}
                          onChange={(e) => {
                            const newImages = [...(section.content.images || [])];
                            newImages[index] = { ...image, url: e.target.value };
                            updateContent({ images: newImages });
                          }}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newImages = (section.content.images || []).filter((_: any, i: number) => i !== index);
                          updateContent({ images: newImages });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <Label>Título da Imagem</Label>
                      <Input
                        value={image.title || ''}
                        onChange={(e) => {
                          const newImages = [...(section.content.images || [])];
                          newImages[index] = { ...image, title: e.target.value };
                          updateContent({ images: newImages });
                        }}
                        placeholder="Título da imagem"
                      />
                    </div>
                    <div>
                      <Label>Subtítulo</Label>
                      <Input
                        value={image.subtitle || ''}
                        onChange={(e) => {
                          const newImages = [...(section.content.images || [])];
                          newImages[index] = { ...image, subtitle: e.target.value };
                          updateContent({ images: newImages });
                        }}
                        placeholder="Subtítulo da imagem"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newImages = [...(section.content.images || []), { url: '', title: '', subtitle: '' }];
                  updateContent({ images: newImages });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Imagem
              </Button>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título da Seção</Label>
              <Input
                value={section.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Perguntas Frequentes"
              />
            </div>
            <div>
              <Label>Perguntas e Respostas</Label>
              {(section.content.items || []).map((item: any, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <div>
                          <Label>Pergunta</Label>
                          <Input
                            value={item.question || ''}
                            onChange={(e) => {
                              const newItems = [...(section.content.items || [])];
                              newItems[index] = { ...item, question: e.target.value };
                              updateContent({ items: newItems });
                            }}
                            placeholder="Qual é sua pergunta?"
                          />
                        </div>
                        <div>
                          <Label>Resposta</Label>
                          <Textarea
                            value={item.answer || ''}
                            onChange={(e) => {
                              const newItems = [...(section.content.items || [])];
                              newItems[index] = { ...item, answer: e.target.value };
                              updateContent({ items: newItems });
                            }}
                            placeholder="Resposta para a pergunta..."
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = (section.content.items || []).filter((_: any, i: number) => i !== index);
                          updateContent({ items: newItems });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItems = [...(section.content.items || []), { question: '', answer: '' }];
                  updateContent({ items: newItems });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Tipo de seção não suportado</div>;
    }
  };

  const getSectionTitle = () => {
    switch (section.section_type) {
      case 'hero': return 'Seção Hero';
      case 'text': return 'Seção de Texto';
      case 'price': return 'Seção de Preço';
      case 'carousel': return 'Carrossel de Imagens';
      case 'faq': return 'Perguntas Frequentes';
      default: return 'Seção';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getSectionTitle()}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderEditor()}
      </CardContent>
    </Card>
  );
};