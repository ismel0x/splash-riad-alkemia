import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Wifi, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SuccessModal } from "@/components/success-modal";
import { TermsModal } from "@/components/terms-modal";
import { HelpModal } from "@/components/help-modal";
import { apiRequest } from "@/lib/queryClient";
import { insertWifiGuestSchema, type InsertWifiGuest } from "@shared/schema";
import { translations, type Language } from "@/lib/i18n";
import riadeImageUrl from "@assets/482041338_438478919276965_7460355980325748208_n_1756900518415.jpg";

export default function WiFiLogin() {
  const [language, setLanguage] = useState<Language>("en");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { toast } = useToast();

  const t = translations[language];

  const form = useForm<InsertWifiGuest>({
    resolver: zodResolver(insertWifiGuestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      accessCode: "",
      whatsappNumber: "",
      acceptedTerms: false,
      language: language,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertWifiGuest) => {
      const response = await apiRequest("POST", "/api/wifi/register", data);
      return response.json();
    },
    onSuccess: () => {
      setShowSuccessModal(true);
      form.reset();
    },
    onError: (error: any) => {
      if (error.message.includes("400")) {
        const errorData = JSON.parse(error.message.split(": ")[1]);
        if (errorData.errors) {
          Object.entries(errorData.errors).forEach(([field, message]) => {
            form.setError(field as keyof InsertWifiGuest, {
              type: "manual",
              message: message as string,
            });
          });
        } else if (errorData.field) {
          form.setError(errorData.field as keyof InsertWifiGuest, {
            type: "manual",
            message: errorData.message,
          });
        } else {
          toast({
            title: "Error",
            description: errorData.message || "Registration failed",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Connection failed. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: InsertWifiGuest) => {
    registerMutation.mutate({
      ...data,
      language,
    });
  };

  const handleTermsAccept = () => {
    form.setValue("acceptedTerms", true);
    setShowTermsModal(false);
  };

  return (
    <div className="min-h-screen bg-background moroccan-pattern">
      {/* Header with Language Switcher */}
      <header className="w-full p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <LanguageSwitcher
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 p-0 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center"
            data-testid="button-help"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Branding Section */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg border-4 border-primary bg-primary/5">
              <img 
                src={riadeImageUrl} 
                alt="Riad Alkemia"
                className="w-full h-full object-cover"
                data-testid="img-logo"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-title">
              {t.title}
            </h1>
            
            <p className="text-muted-foreground text-sm" data-testid="text-subtitle">
              {t.subtitle}
            </p>
          </div>

          {/* Login Form */}
          <Card className="form-container bg-card/95 backdrop-blur-sm shadow-lg mb-4">
            <CardContent className="p-6">
              {/* WiFi Access Header */}
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Wifi className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground" data-testid="text-wifi-access">
                    {t.wifiAccess}
                  </h2>
                  <p className="text-xs text-muted-foreground" data-testid="text-connect-message">
                    {t.connectMessage}
                  </p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    {t.fullName} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t.enterFullName}
                    {...form.register("fullName")}
                    className="input-focus"
                    data-testid="input-full-name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-xs text-destructive" data-testid="error-full-name">
                      {form.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t.email} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.enterEmail}
                    {...form.register("email")}
                    className="input-focus"
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive" data-testid="error-email">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Access Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="text-sm font-medium">
                    {t.accessCode} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder={t.enterAccessCode}
                    {...form.register("accessCode")}
                    className="input-focus font-mono tracking-wider"
                    data-testid="input-access-code"
                  />
                  {form.formState.errors.accessCode && (
                    <p className="text-xs text-destructive" data-testid="error-access-code">
                      {form.formState.errors.accessCode.message}
                    </p>
                  )}
                </div>

                {/* WhatsApp Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber" className="text-sm font-medium">
                    {t.whatsappNumber} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder={t.enterWhatsapp}
                      {...form.register("whatsappNumber")}
                      className="input-focus pl-10"
                      data-testid="input-whatsapp"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      📱
                    </div>
                  </div>
                  {form.formState.errors.whatsappNumber && (
                    <p className="text-xs text-destructive" data-testid="error-whatsapp">
                      {form.formState.errors.whatsappNumber.message}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={form.watch("acceptedTerms")}
                      onCheckedChange={(checked) => 
                        form.setValue("acceptedTerms", checked as boolean)
                      }
                      className="mt-1"
                      data-testid="checkbox-accept-terms"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
                      {t.acceptTerms}{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary underline hover:no-underline"
                        data-testid="button-open-terms"
                      >
                        {t.termsAndConditions}
                      </button>
                    </Label>
                  </div>
                  {form.formState.errors.acceptedTerms && (
                    <p className="text-xs text-destructive" data-testid="error-terms">
                      {form.formState.errors.acceptedTerms.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                  data-testid="button-submit"
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>{t.connecting}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4" />
                      <span>{t.connectToWifi}</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p data-testid="text-wifi-info">{t.freeWifiInfo}</p>
            <div className="flex items-center justify-center space-x-4 text-primary">
              <Shield className="h-4 w-4" />
              <span data-testid="text-secure-connection">{t.secureConnection}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-muted-foreground" data-testid="text-powered-by">
            Powered by <span className="text-primary font-medium">Nextwi</span>
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        language={language}
      />

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        language={language}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        language={language}
      />
    </div>
  );
}
