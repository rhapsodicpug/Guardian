"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStarknet } from "@/providers/StarknetProvider";

interface ConnectWalletButtonProps {
  onConnect: (address: string) => void;
}

export function ConnectWalletButton({ onConnect }: ConnectWalletButtonProps) {
  const { account, isConnected, connect, disconnect } = useStarknet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect when account is available
  useEffect(() => {
    if (account && isConnected) {
      onConnect(account);
    }
  }, [account, isConnected, onConnect]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await connect();
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnected && account) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        size="lg"
        className="w-full"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet to Begin"}
      </Button>
      
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Supports Argent X and Braavos wallets
      </div>
    </div>
  );
}
