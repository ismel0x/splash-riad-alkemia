import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { translations, type Language } from "@/lib/i18n";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  language: Language;
}

export function TermsModal({ isOpen, onClose, onAccept, language }: TermsModalProps) {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="modal-terms"
    >
      <div 
        className="bg-card rounded-lg shadow-xl border border-border w-full max-w-lg max-h-[80vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground" data-testid="text-terms-title">
            {t.termsAndConditions}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-terms"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Modal Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 text-sm text-foreground">
            <h4 className="font-semibold">{t.termsContent.title}</h4>
            <p>{t.termsContent.intro}</p>
            
            <div>
              <h5 className="font-medium mb-2">{t.termsContent.acceptableUse}</h5>
              <p className="text-muted-foreground">{t.termsContent.acceptableUseText}</p>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">{t.termsContent.dataPrivacy}</h5>
              <p className="text-muted-foreground">{t.termsContent.dataPrivacyText}</p>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">{t.termsContent.networkSecurity}</h5>
              <p className="text-muted-foreground">{t.termsContent.networkSecurityText}</p>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">{t.termsContent.serviceAvailability}</h5>
              <p className="text-muted-foreground">{t.termsContent.serviceAvailabilityText}</p>
            </div>
          </div>
        </ScrollArea>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-border">
          <Button 
            onClick={onAccept}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            data-testid="button-accept-terms"
          >
            {t.acceptAndContinue}
          </Button>
        </div>
      </div>
    </div>
  );
}
