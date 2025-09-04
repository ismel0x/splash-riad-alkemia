import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface EmailVerificationResult {
  email: string;
  isValid: boolean;
  isDeliverable: boolean;
  result: string;
  message: string;
}

interface UseEmailVerificationReturn {
  verifyEmail: (email: string) => Promise<EmailVerificationResult>;
  isVerifying: boolean;
  lastVerification: EmailVerificationResult | null;
  clearVerification: () => void;
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerification, setLastVerification] = useState<EmailVerificationResult | null>(null);

  const verifyEmail = useCallback(async (email: string): Promise<EmailVerificationResult> => {
    if (!email || !email.includes('@')) {
      const result: EmailVerificationResult = {
        email,
        isValid: false,
        isDeliverable: false,
        result: 'invalid_format',
        message: 'Please enter a valid email address'
      };
      setLastVerification(result);
      return result;
    }

    setIsVerifying(true);
    
    try {
      const response = await apiRequest('POST', '/api/verify-email', { email });
      const data = await response.json() as EmailVerificationResult;
      
      setLastVerification(data);
      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      const result: EmailVerificationResult = {
        email,
        isValid: false,
        isDeliverable: false,
        result: 'error',
        message: 'Email verification service unavailable'
      };
      setLastVerification(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const clearVerification = useCallback(() => {
    setLastVerification(null);
  }, []);

  return {
    verifyEmail,
    isVerifying,
    lastVerification,
    clearVerification
  };
}