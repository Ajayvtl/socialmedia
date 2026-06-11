"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type CursorVariant = 'default' | 'view' | 'play' | 'love' | 'explore' | 'zoom';

interface CursorContextType {
  variant: CursorVariant;
  setVariant: (variant: CursorVariant) => void;
  text: string;
  setText: (text: string) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [text, setText] = useState('');

  return (
    <CursorContext.Provider value={{ variant, setVariant, text, setText }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
