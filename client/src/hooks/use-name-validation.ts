import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface NameValidationResult {
  valid: boolean;
  confidence: number;
  suggestion?: string;
  issues?: string[];
}

interface NameValidationResponse {
  success: boolean;
  validation: NameValidationResult;
}

// Simple client-side cache for name validation results
const validationCache = new Map<string, { result: NameValidationResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useNameValidation() {
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    result: NameValidationResult | null;
    lastValidatedName: string | null;
  }>({
    isValidating: false,
    result: null,
    lastValidatedName: null
  });

  const validationMutation = useMutation({
    mutationFn: async (fullName: string): Promise<NameValidationResult> => {
      const normalizedName = fullName.trim().toLowerCase();
      
      // Check cache first
      const cached = validationCache.get(normalizedName);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.result;
      }

      // Make API request
      const response = await apiRequest("POST", "/api/validate/name", { fullName });
      const data: NameValidationResponse = await response.json();
      
      const result = data.validation;
      
      // Cache the result
      validationCache.set(normalizedName, { 
        result, 
        timestamp: Date.now() 
      });
      
      return result;
    },
    onMutate: () => {
      setValidationState(prev => ({
        ...prev,
        isValidating: true
      }));
    },
    onSuccess: (result, fullName) => {
      setValidationState({
        isValidating: false,
        result,
        lastValidatedName: fullName
      });
    },
    onError: (error) => {
      console.error('Name validation error:', error);
      
      // Graceful fallback
      setValidationState({
        isValidating: false,
        result: {
          valid: true,
          confidence: 0.5,
          issues: ['Validation temporarily unavailable']
        },
        lastValidatedName: null
      });
    }
  });

  const validateName = useCallback((fullName: string) => {
    if (!fullName || fullName.length < 2) {
      setValidationState({
        isValidating: false,
        result: null,
        lastValidatedName: null
      });
      return;
    }

    // Debounce validation - only validate if the name has actually changed
    if (fullName === validationState.lastValidatedName) {
      return;
    }

    validationMutation.mutate(fullName);
  }, [validationMutation, validationState.lastValidatedName]);

  const clearValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      result: null,
      lastValidatedName: null
    });
  }, []);

  return {
    validateName,
    clearValidation,
    isValidating: validationState.isValidating,
    validationResult: validationState.result,
    isValid: validationState.result?.valid ?? true,
    confidence: validationState.result?.confidence ?? 1,
    suggestion: validationState.result?.suggestion,
    issues: validationState.result?.issues ?? []
  };
}