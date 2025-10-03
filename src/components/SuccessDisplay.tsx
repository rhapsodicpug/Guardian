"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SuccessDisplayProps {
  walletAddress: string;
  helperAddresses: string[];
  onDeployAnother: () => void;
}

export function SuccessDisplay({ walletAddress, helperAddresses, onDeployAnother }: SuccessDisplayProps) {
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl text-green-600 dark:text-green-400">
          Success!
        </CardTitle>
        <CardDescription>
          Your secure wallet has been deployed successfully!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              New Wallet Address:
            </h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="break-all">{walletAddress}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(walletAddress)}
                  className="ml-2"
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Configured Helpers:
            </h3>
            <div className="space-y-2">
              {helperAddresses.map((address, index) => (
                <div
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="break-all">
                      {index + 1}. {address}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(address)}
                      className="ml-2"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onDeployAnother}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Deploy Another Wallet
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          The wallet is now ready to use with social recovery enabled
        </div>
      </CardContent>
    </Card>
  );
}
