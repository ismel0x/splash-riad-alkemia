import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { languages, type Language } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 transition-all duration-200 hover:transform hover:-translate-y-0.5"
        data-testid="button-language-toggle"
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{currentLang?.name}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-popover border border-border rounded-md shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center space-x-2 transition-colors"
              data-testid={`button-language-${language.code}`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
