import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SalesPageView } from '@/components/SalesPageView';

interface PageSection {
  id: string;
  section_type: 'hero' | 'text' | 'price' | 'carousel' | 'faq';
  content: any;
  order_index: number;
}

interface PagePreviewProps {
  title: string;
  sections: PageSection[];
  primaryColor: string;
  onClose: () => void;
}

export const PagePreview = ({ title, sections, primaryColor, onClose }: PagePreviewProps) => {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="sticky top-0 bg-card border-b z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Preview: {title}</h1>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Fechar Preview
            </Button>
          </div>
        </div>
      </div>
      
      <div className="min-h-screen">
        <SalesPageView title={title} sections={sections} primaryColor={primaryColor} isPreview />
      </div>
    </div>
  );
};