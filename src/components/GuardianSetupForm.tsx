"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractDeployment } from "@/hooks/useContractDeployment";

interface GuardianSetupFormProps {
  connectedAddress: string;
  onDeploy: (walletAddress: string, guardians: string[]) => void;
}

export function GuardianSetupForm({ connectedAddress, onDeploy }: GuardianSetupFormProps) {
  const [guardians, setGuardians] = useState(["", "", ""]);
  const { deployContract, isDeploying, error } = useContractDeployment();

  const handleGuardianChange = (index: number, value: string) => {
    const newGuardians = [...guardians];
    newGuardians[index] = value;
    setGuardians(newGuardians);
  };

  const validateAddress = (address: string): boolean => {
    // Basic Starknet address validation (starts with 0x and is 66 characters)
    return /^0x[0-9a-fA-F]{64}$/.test(address);
  };

  const handleDeploy = async () => {
    // Validate all guardian addresses
    const invalidGuardians = guardians.filter(addr => !validateAddress(addr));
    if (invalidGuardians.length > 0) {
      return;
    }

    // Check for duplicate guardians
    const uniqueGuardians = new Set(guardians);
    if (uniqueGuardians.size !== guardians.length) {
      return;
    }

    try {
      const result = await deployContract(
        connectedAddress,
        guardians[0],
        guardians[1],
        guardians[2]
      );
      
      onDeploy(result.contractAddress, guardians);
    } catch (err) {
      console.error("Deployment error:", err);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isFormValid = guardians.every(addr => addr.trim() && validateAddress(addr)) &&
                     new Set(guardians).size === guardians.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up a New Secure Wallet</CardTitle>
        <CardDescription>
          Connected: {formatAddress(connectedAddress)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="guardian1">Helper Address 1</Label>
            <Input
              id="guardian1"
              type="text"
              placeholder="0x..."
              value={guardians[0]}
              onChange={(e) => handleGuardianChange(0, e.target.value)}
              className="font-mono"
            />
          </div>
          
          <div>
            <Label htmlFor="guardian2">Helper Address 2</Label>
            <Input
              id="guardian2"
              type="text"
              placeholder="0x..."
              value={guardians[1]}
              onChange={(e) => handleGuardianChange(1, e.target.value)}
              className="font-mono"
            />
          </div>
          
          <div>
            <Label htmlFor="guardian3">Helper Address 3</Label>
            <Input
              id="guardian3"
              type="text"
              placeholder="0x..."
              value={guardians[2]}
              onChange={(e) => handleGuardianChange(2, e.target.value)}
              className="font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {!isFormValid && guardians.some(addr => addr.trim()) && (
          <div className="text-amber-600 dark:text-amber-400 text-sm">
            Please enter valid, unique Starknet addresses for all guardians
          </div>
        )}

        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !isFormValid}
          size="lg"
          className="w-full"
        >
          {isDeploying ? "Deploying..." : "Deploy Secure Wallet"}
        </Button>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          This will deploy a new smart wallet with the specified guardians for social recovery
        </div>
      </CardContent>
    </Card>
  );
}
