import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Wifi, Shield, HelpCircle, User, Mail, Key, Phone, ArrowLeft, Check, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEmailVerification } from "@/hooks/use-email-verification";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SuccessModal } from "@/components/success-modal";
import { TermsModal } from "@/components/terms-modal";
import { HelpModal } from "@/components/help-modal";
import { apiRequest } from "@/lib/queryClient";
import { insertWifiGuestSchema, type InsertWifiGuest } from "@shared/schema";
import { translations, type Language } from "@/lib/i18n";
import riadeImageUrl from "@assets/riad-alkemia-logo.png";

export default function WiFiLogin() {
  const [language, setLanguage] = useState<Language>("en");
  const [currentStep, setCurrentStep] = useState<'form' | 'confirmation'>('form');
  const [formData, setFormData] = useState<InsertWifiGuest | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { toast } = useToast();
  const { verifyEmail, isVerifying, lastVerification, clearVerification } = useEmailVerification();

  const t = translations[language];

  const form = useForm<InsertWifiGuest>({
    resolver: zodResolver(insertWifiGuestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      accessCode: "",
      whatsappNumber: "",
      acceptedTerms: true,
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
      setCurrentStep('form');
      setFormData(null);
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
    const submissionData = {
      ...data,
      language,
    };
    
    if (currentStep === 'form') {
      setFormData(submissionData);
      setCurrentStep('confirmation');
    } else {
      registerMutation.mutate(submissionData);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleConfirmSubmission = () => {
    if (formData) {
      registerMutation.mutate(formData);
    }
  };

  const handleTermsAccept = () => {
    form.setValue("acceptedTerms", true);
    setShowTermsModal(false);
  };

  // Email verification effect
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'email' && value.email && value.email.includes('@') && value.email.length > 5) {
        const timeoutId = setTimeout(() => {
          verifyEmail(value.email!);
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
      } else if (name === 'email') {
        clearVerification();
      }
    });

    return () => subscription.unsubscribe();
  }, [form, verifyEmail, clearVerification]);

  // Get email verification status for UI
  const getEmailVerificationStatus = () => {
    const email = form.watch('email');
    if (!email || !email.includes('@')) {
      return null;
    }

    if (isVerifying) {
      return { type: 'loading', message: 'Verifying email...', icon: Loader2 };
    }

    if (lastVerification && lastVerification.email === email) {
      if (lastVerification.isDeliverable) {
        return { type: 'success', message: 'Email verified', icon: CheckCircle };
      } else {
        return { type: 'error', message: lastVerification.message, icon: AlertCircle };
      }
    }

    return null;
  };

  // Get full name validation status for UI
  const getFullNameValidationStatus = () => {
    const fullName = form.watch('fullName');
    if (!fullName || fullName.length === 0) {
      return null;
    }

    // Check if name contains only alphabetic characters and spaces
    const namePattern = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/;
    const isValidFormat = namePattern.test(fullName);
    const hasValidLength = fullName.length >= 4 && fullName.length <= 30;

    if (!isValidFormat) {
      return { 
        type: 'error', 
        message: 'Name should contain only letters, spaces, hyphens, and apostrophes', 
        icon: AlertCircle 
      };
    }

    if (!hasValidLength) {
      return { 
        type: 'error', 
        message: fullName.length < 4 ? 'Name too short (minimum 4 characters)' : 'Name too long (maximum 30 characters)', 
        icon: AlertCircle 
      };
    }

    return { 
      type: 'success', 
      message: 'Valid name format', 
      icon: CheckCircle 
    };
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
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <img 
                src={riadeImageUrl} 
                alt="Riad Alkemia"
                className="w-full h-full object-contain"
                data-testid="img-logo"
              />
            </div>
            
            <p className="text-muted-foreground text-lg" data-testid="text-subtitle">
              {t.subtitle}
            </p>
          </div>

          {/* Form/Confirmation Card */}
          <Card className="form-container bg-card/95 backdrop-blur-sm shadow-lg mb-4">
            <CardContent className="p-6">
              {/* Header with Back Button (only on confirmation step) */}
              {currentStep === 'confirmation' && (
                <div className="flex items-center mb-6 pb-4 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToForm}
                    className="flex items-center space-x-2 p-2 hover:bg-primary/10"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </Button>
                </div>
              )}

              {/* WiFi Access Header */}
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {currentStep === 'form' ? (
                    <Wifi className="h-5 w-5 text-primary" />
                  ) : (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground" data-testid="text-wifi-access">
                    {currentStep === 'form' ? t.wifiAccess : 'Confirm Details'}
                  </h2>
                  <p className="text-xs text-muted-foreground" data-testid="text-connect-message">
                    {currentStep === 'form' ? t.connectMessage : 'Please review your information before connecting'}
                  </p>
                </div>
              </div>

              {currentStep === 'form' ? (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      {t.fullName} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder={t.enterFullName}
                        {...form.register("fullName")}
                        className={`input-focus pl-10 pr-10 ${
                          getFullNameValidationStatus()?.type === 'success' ? 'border-green-500' :
                          getFullNameValidationStatus()?.type === 'error' ? 'border-red-500' : ''
                        }`}
                        data-testid="input-full-name"
                      />
                      {getFullNameValidationStatus() && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {getFullNameValidationStatus()?.type === 'success' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {getFullNameValidationStatus()?.type === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {form.formState.errors.fullName && (
                      <p className="text-xs text-destructive" data-testid="error-full-name">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                    {getFullNameValidationStatus() && (
                      <p className={`text-xs ${
                        getFullNameValidationStatus()?.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`} data-testid="fullname-validation-status">
                        {getFullNameValidationStatus()?.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t.email} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.enterEmail}
                        {...form.register("email")}
                        className={`input-focus pl-10 pr-10 ${
                          getEmailVerificationStatus()?.type === 'success' ? 'border-green-500' :
                          getEmailVerificationStatus()?.type === 'error' ? 'border-red-500' : ''
                        }`}
                        data-testid="input-email"
                      />
                      {getEmailVerificationStatus() && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {getEmailVerificationStatus()?.type === 'loading' && (
                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                          )}
                          {getEmailVerificationStatus()?.type === 'success' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {getEmailVerificationStatus()?.type === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive" data-testid="error-email">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                    {getEmailVerificationStatus() && getEmailVerificationStatus()?.type !== 'loading' && (
                      <p className={`text-xs ${
                        getEmailVerificationStatus()?.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`} data-testid="email-verification-status">
                        {getEmailVerificationStatus()?.message}
                      </p>
                    )}
                  </div>

                  {/* Access Code Field */}
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-sm font-medium">
                      {t.accessCode} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="accessCode"
                        type="number"
                        placeholder={t.enterAccessCode}
                        {...form.register("accessCode")}
                        className="input-focus tracking-wider pl-10"
                        data-testid="input-access-code"
                      />
                    </div>
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
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        placeholder={t.enterWhatsapp}
                        {...form.register("whatsappNumber")}
                        className="input-focus pl-10"
                        data-testid="input-whatsapp"
                      />
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
                    disabled={registerMutation.isPending || !form.watch("acceptedTerms")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-submit"
                  >
                    {registerMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>{t.connecting}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4" />
                        <span>Review Details</span>
                      </div>
                    )}
                  </Button>
                </form>
              ) : (
                /* Confirmation Step */
                <div className="space-y-6">
                  {/* Confirmation Details */}
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{t.fullName}</p>
                        <p className="text-base font-semibold" data-testid="confirm-full-name">{formData?.fullName}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{t.email}</p>
                        <p className="text-base font-semibold" data-testid="confirm-email">{formData?.email}</p>
                      </div>
                    </div>

                    {/* Access Code */}
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Key className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{t.accessCode}</p>
                        <p className="text-base font-semibold font-mono" data-testid="confirm-access-code">{formData?.accessCode}</p>
                      </div>
                    </div>

                    {/* WhatsApp Number */}
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{t.whatsappNumber}</p>
                        <p className="text-base font-semibold" data-testid="confirm-whatsapp">{formData?.whatsappNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    onClick={handleConfirmSubmission}
                    disabled={registerMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                    data-testid="button-confirm"
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
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-black" data-testid="text-powered-by">
            Powered by <span className="text-black font-medium">Nextwi</span>
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
