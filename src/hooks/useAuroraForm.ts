"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ValidationResult } from "@/lib/formValidationService";

interface UseAuroraFormOptions<T> {
  initialValues: T;
  validators?: Partial<Record<keyof T, (val: any) => ValidationResult>>;
  autosave?: boolean;
  draftKey?: string;
}

export function useAuroraForm<T extends Record<string, any>>({
  initialValues,
  validators = {},
  autosave = false,
  draftKey,
}: UseAuroraFormOptions<T>) {
  // Primary values state
  const [values, setValues] = useState<T>(initialValues);
  
  // Field-specific validation errors state
  const [errors, setErrors] = useState<Partial<Record<keyof T, ValidationResult>>>({});
  
  // Field-specific touched status tracking
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  // Field-specific dirty tracking (changed from initial value)
  const [dirtyFields, setDirtyFields] = useState<Partial<Record<keyof T, boolean>>>({});

  // History stacks for undo/redo
  const [undoStack, setUndoStack] = useState<T[]>([]);
  const [redoStack, setRedoStack] = useState<T[]>([]);
  
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference to prevent save cycles during load
  const isInitializedRef = useRef(false);

  /**
   * Check if any fields are dirty
   */
  const isDirty = Object.values(dirtyFields).some(Boolean);

  /**
   * Restores draft from localStorage if available
   */
  useEffect(() => {
    if (typeof window === "undefined" || !draftKey) {
      isInitializedRef.current = true;
      return;
    }
    
    try {
      const saved = localStorage.getItem(`aurora_draft_${draftKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setValues(parsed);
        // Calculate initial dirty fields relative to initialValues
        const initialDirty: Partial<Record<keyof T, boolean>> = {};
        Object.keys(parsed).forEach((k) => {
          if (parsed[k] !== initialValues[k]) {
            initialDirty[k as keyof T] = true;
          }
        });
        setDirtyFields(initialDirty);
      }
    } catch (e) {
      console.warn("Failed to load draft from localStorage", e);
    } finally {
      isInitializedRef.current = true;
    }
  }, [draftKey]);

  /**
   * Autosaves values to localStorage if enabled
   */
  useEffect(() => {
    if (!isInitializedRef.current || !autosave || !draftKey || typeof window === "undefined") {
      return;
    }

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`aurora_draft_${draftKey}`, JSON.stringify(values));
      } catch (e) {
        console.warn("Failed to autosave draft", e);
      }
    }, 600); // Debounce saves by 600ms

    return () => clearTimeout(timer);
  }, [values, autosave, draftKey]);

  /**
   * Runs validation on a single field
   */
  const validateField = useCallback(
    (field: keyof T, val: any): ValidationResult => {
      const validator = validators[field];
      if (validator) {
        const result = validator(val);
        setErrors((prev) => ({
          ...prev,
          [field]: result.valid ? undefined : result,
        }));
        return result;
      }
      return { valid: true, code: "SUCCESS", message: "" };
    },
    [validators]
  );

  /**
   * Triggers full form validation
   */
  const validateForm = useCallback((): boolean => {
    const nextErrors: Partial<Record<keyof T, ValidationResult>> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const field = key as keyof T;
      const validator = validators[field];
      if (validator) {
        const result = validator(values[field]);
        if (!result.valid) {
          nextErrors[field] = result;
          isValid = false;
        }
      }
    });

    setErrors(nextErrors);
    return isValid;
  }, [values, validators]);

  /**
   * Updates state value and tracking indices
   */
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => {
        // Record undo state before updating
        setUndoStack((stack) => [...stack.slice(-19), prev]); // Cap undo history at 20 edits
        setRedoStack([]); // Clear redo history upon manual edits

        const next = { ...prev, [field]: value };
        
        // Update dirty tracking
        setDirtyFields((dirty) => ({
          ...dirty,
          [field]: value !== initialValues[field],
        }));

        // Validate immediately
        validateField(field, value);

        return next;
      });
    },
    [initialValues, validateField]
  );

  /**
   * Standardized change handler for inputs
   */
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setFieldValue(field, value);
    },
    [setFieldValue]
  );

  /**
   * Undo last value modification
   */
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    setValues((current) => {
      const prev = undoStack[undoStack.length - 1];
      setUndoStack((stack) => stack.slice(0, -1));
      setRedoStack((stack) => [...stack, current]);

      // Recalculate dirty fields
      const nextDirty: Partial<Record<keyof T, boolean>> = {};
      Object.keys(prev).forEach((k) => {
        if (prev[k] !== initialValues[k]) {
          nextDirty[k as keyof T] = true;
        }
      });
      setDirtyFields(nextDirty);

      return prev;
    });
  }, [undoStack, initialValues]);

  /**
   * Redo last undone modification
   */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    setValues((current) => {
      const next = redoStack[redoStack.length - 1];
      setRedoStack((stack) => stack.slice(0, -1));
      setUndoStack((stack) => [...stack, current]);

      // Recalculate dirty fields
      const nextDirty: Partial<Record<keyof T, boolean>> = {};
      Object.keys(next).forEach((k) => {
        if (next[k] !== initialValues[k]) {
          nextDirty[k as keyof T] = true;
        }
      });
      setDirtyFields(nextDirty);

      return next;
    });
  }, [redoStack, initialValues]);

  /**
   * Resets form values and states back to initialValues
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirtyFields({});
    setUndoStack([]);
    setRedoStack([]);
    if (typeof window !== "undefined" && draftKey) {
      try {
        localStorage.removeItem(`aurora_draft_${draftKey}`);
      } catch {}
    }
  }, [initialValues, draftKey]);

  /**
   * Clears saved offline drafts
   */
  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined" && draftKey) {
      try {
        localStorage.removeItem(`aurora_draft_${draftKey}`);
      } catch {}
    }
  }, [draftKey]);

  /**
   * Form submission wrapper handling validation blockages
   */
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return async (e?: React.FormEvent) => {
        if (e && typeof e.preventDefault === "function") {
          e.preventDefault();
        }

        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true);
        try {
          await onSubmit(values);
          // Clear draft on successful submit
          clearDraft();
        } catch (err) {
          console.error("Submission failed", err);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [values, validateForm, clearDraft]
  );

  return {
    values,
    errors,
    touched,
    isDirty,
    dirtyFields,
    isSubmitting,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetForm,
    undo,
    redo,
    clearDraft,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
