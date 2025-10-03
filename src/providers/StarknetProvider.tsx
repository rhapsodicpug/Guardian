"use client";

import { ReactNode, createContext, useContext, useState, useEffect } from "react";

interface StarknetContextType {
  account: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const StarknetContext = createContext<StarknetContextType | undefined>(undefined);

export function StarknetProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      if (typeof window === "undefined" || !window.starknet) {
        throw new Error("No Starknet wallet detected");
      }

      const accounts = await window.starknet.enable();
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
  };

  // Check for existing connection on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.starknet?.isConnected) {
      setAccount(window.starknet.account?.address || null);
      setIsConnected(true);
    }
  }, []);

  return (
    <StarknetContext.Provider value={{ account, isConnected, connect, disconnect }}>
      {children}
    </StarknetContext.Provider>
  );
}

export function useStarknet() {
  const context = useContext(StarknetContext);
  if (context === undefined) {
    throw new Error("useStarknet must be used within a StarknetProvider");
  }
  return context;
}

// Extend the Window interface to include starknet
declare global {
  interface Window {
    starknet?: {
      enable: () => Promise<string[]>;
      isConnected: boolean;
      account?: {
        address: string;
      };
    };
  }
}
