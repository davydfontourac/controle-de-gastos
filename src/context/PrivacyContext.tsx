import { createContext, useContext, useState, type ReactNode } from 'react';

interface PrivacyContextType {
  hideBalance: boolean;
  setHideBalance: (value: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hideBalance, setHideBalanceState] = useState<boolean>(() => {
    const saved = localStorage.getItem('hide_balance');
    return saved === 'true';
  });

  const setHideBalance = (value: boolean) => {
    setHideBalanceState(value);
    localStorage.setItem('hide_balance', String(value));
  };

  return (
    <PrivacyContext.Provider value={{ hideBalance, setHideBalance }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy deve ser usado dentro de um PrivacyProvider');
  }
  return context;
}
