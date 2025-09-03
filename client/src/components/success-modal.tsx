import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translations, type Language } from "@/lib/i18n";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function SuccessModal({ isOpen, onClose, language }: SuccessModalProps) {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="modal-success"
    >
      <div 
        className="bg-card rounded-lg shadow-xl border border-border p-6 w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-welcome-message">
            {t.welcomeMessage}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6" data-testid="text-connection-success">
            {t.connectionSuccess}
          </p>
          
          {/* Moroccan hospitality image placeholder */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-lg overflow-hidden bg-primary/5 flex items-center justify-center">
            <div className="text-3xl">🫖</div>
          </div>
          
          <Button 
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-continue"
          >
            {t.continueButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
