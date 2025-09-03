import { X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { translations, type Language } from "@/lib/i18n";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function HelpModal({ isOpen, onClose, language }: HelpModalProps) {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="modal-help"
    >
      <div 
        className="bg-card rounded-lg shadow-xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground" data-testid="text-help-title">
              {t.helpContent.title}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-help"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Modal Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 text-sm text-foreground">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <h5 className="font-medium">{t.helpContent.step1}</h5>
              </div>
              <p className="text-muted-foreground ml-8">{t.helpContent.step1Text}</p>
            </div>
            
            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <h5 className="font-medium">{t.helpContent.step2}</h5>
              </div>
              <p className="text-muted-foreground ml-8">{t.helpContent.step2Text}</p>
            </div>
            
            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <h5 className="font-medium">{t.helpContent.step3}</h5>
              </div>
              <p className="text-muted-foreground ml-8">{t.helpContent.step3Text}</p>
            </div>
            
            {/* Access Code Help */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">💡 {t.helpContent.accessCodeHelp}</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}