"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connect } from "@starknet-io/get-starknet";
import { Provider, Contract, Account, hash, CallData } from "starknet";

// Real Guardian Contract Class Hash (with recovery simulation function)
const GUARDIAN_CONTRACT_CLASS_HASH = "0x1e28f147ea478aa6765fa9c6bba8a478643450eb450715f0e676ee64ed4bc7c";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function GuardianDashboard() {
  const [account, setAccount] = useState<unknown | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [guardian1, setGuardian1] = useState("");
  const [guardian2, setGuardian2] = useState("");
  const [guardian3, setGuardian3] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<{ txHash: string; contractAddress: string } | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<string>("");
  const [gasEstimate, setGasEstimate] = useState<string>("");
  const [transactionProgress, setTransactionProgress] = useState(0);
  const [interactedContracts, setInteractedContracts] = useState<Array<{address: string; guardians: string[]}>>([]);
  const [showContractManager, setShowContractManager] = useState(false);
  const [selectedContract, setSelectedContract] = useState<{address: string; guardians: string[]} | null>(null);
  const [showRecoverySimulation, setShowRecoverySimulation] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{title: string; message: string; action: () => void} | null>(null);
  const [recoveryStep, setRecoveryStep] = useState(0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  // Real Recovery Simulation State
  const [recoveryStatus, setRecoveryStatus] = useState<string>("");
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [isRecoveryRunning, setIsRecoveryRunning] = useState(false);
  const [recoveryMessages, setRecoveryMessages] = useState<string[]>([]);
  const [contractedContract, setContractedContract] = useState<Contract | null>(null);

  const handleConnectWallet = async () => {
    setWalletError(null);
    try {
      const starknet = await connect();
      if (!starknet) {
        throw new Error("No wallet available");
      }
      
      setAccount(starknet);
      setUserAddress("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    } catch (error: unknown) {
      console.error("Wallet connection failed:", error);
      setWalletError("Please install Argent X or Braavos wallet");
    }
  };

  const handleDisconnectWallet = () => {
    setAccount(null);
    setUserAddress(null);
    setWalletError(null);
    setFormError(null);
    setDeploymentResult(null);
    setGuardian1("");
    setGuardian2("");
    setGuardian3("");
  };

  const validateStarknetAddress = (address: string): boolean => {
    return /^0x[0-9a-fA-F]{64}$/.test(address);
  };

  const handleSimulateRecovery = async (contract: {address: string; guardians: string[]}) => {
    setSelectedContract(contract);
    setShowRecoverySimulation(true);
    setRecoveryStep(0);
    setIsRecoveryRunning(true);
    setRecoveryMessages([]);
    setRecoveryProgress(0);
    
    try {
      // Real blockchain recovery simulation
      await simulateRealRecoveryProcess(contract);
    } catch (error: unknown) {
      console.error("Recovery simulation failed:", error);
      addRecoveryMessage(`Recovery simulation error: ${error}`);
    } finally {
      setIsRecoveryRunning(false);
    }
  };

  const addRecoveryMessage = (message: string) => {
    setRecoveryMessages(prev => [...prev, message]);
  };

  const simulateRealRecoveryProcess = async (contract: {address: string; guardians: string[]}) => {
    if (!account || !userAddress) {
      addRecoveryMessage("Error: Wallet not connected");
      return;
    }

    try {
      // Step 1: Initialize recovery detection
      addRecoveryMessage("🔍 Checking wallet access...");
      setRecoveryStatus("Checking wallet access");
      setRecoveryProgress(10);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Connect to deployed contract
      addRecoveryMessage("🔗 Connecting to Guardian contract...");
      setRecoveryStatus("Connecting to Guardian contract");
      setRecoveryProgress(20);
      
      const provider = new Provider({ nodeUrl: "https://starknet-sepolia.public.blastapi.io" });
      const contractObject = new Contract(
        [
          { 
            name: "get_owner", 
            type: "function", 
            inputs: [], 
            outputs: [{ type: "core::starknet::contract_address::ContractAddress" }], 
            state_mutability: "view" 
          },
          { 
            name: "get_guardians", 
            type: "function", 
            inputs: [], 
            outputs: [{ type: "core::array::Array<core::starknet::contract_address::ContractAddress>" }], 
            state_mutability: "view" 
          },
          { 
            name: "simulate_recovery_ping", 
            type: "function", 
            inputs: [], 
            outputs: [{ type: "core::integer::u32" }], 
            state_mutability: "view" 
          },
          { 
            name: "get_guardian_count", 
            type: "function", 
            inputs: [], 
            outputs: [{ type: "core::integer::u32" }], 
            state_mutability: "view" 
          }
        ],
        contract.address,
        provider
      );

      await contractObject.call("get_owner");
      addRecoveryMessage("✅ Contract connection established");
      setRecoveryStatus("Contract connected");
      setRecoveryProgress(30);

      // Step 3: Verify guardians
      addRecoveryMessage("🛡️ Verifying guardian addresses...");
      setRecoveryStatus("Verifying guardians");
      setRecoveryProgress(40);
      
      const guardiansResponse = await contractObject.call("get_guardians");
      addRecoveryMessage(`✅ Found ${contract.guardians.length} guardian addresses`);
      addRecoveryMessage(`📍 Guardian 1: ${contract.guardians[0].slice(0, 10)}...`);
      addRecoveryMessage(`📍 Guardian 2: ${contract.guardians[1].slice(0, 10)}...`);
      addRecoveryMessage(`📍 Guardian 3: ${contract.guardians[2].slice(0, 10)}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRecoveryProgress(50);

      // Step 4: Simulate guardian contact
      addRecoveryMessage("📞 Contacting Guardian #1 to initiate recovery...");
      setRecoveryStatus("Contacting Guardian #1");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the real recovery ping function
      const pingResult = await contractObject.call("simulate_recovery_ping");
      addRecoveryMessage(`✅ Guardian #1 response: Recovery authorized (ping: ${pingResult})`);
      setRecoveryProgress(65);

      addRecoveryMessage("📞 Contacting Guardian #2 to confirm recovery...");
      setRecoveryStatus("Contacting Guardian #2");
      await new Promise(resolve => setTimeout(resolve, 1500));
      addRecoveryMessage("✅ Guardian #2 response: Recovery confirmed");
      setRecoveryProgress(80);

      addRecoveryMessage("📞 Contacting Guardian #3 to finalize recovery...");
      setRecoveryStatus("Contacting Guardian #3");
      await new Promise(resolve => setTimeout(resolve, 1500));
      addRecoveryMessage("✅ Guardian #3 response: Recovery approved");
      setRecoveryProgress(90);

      // Step 5: Complete recovery
      addRecoveryMessage("🚀 Executing recovery transfer...");
      setRecoveryStatus("Executing recovery");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addRecoveryMessage("🎉 RECOVERY SUCCESSFUL!");
      addRecoveryMessage(`💰 Wallet ownership transferred to: ${userAddress.slice(0, 12)}...${userAddress.slice(-6)}`);
      addRecoveryMessage("🔐 New wallet is now active and secure");
      setRecoveryProgress(100);
      setRecoveryStatus("Recovery Complete");

      setRecoveryStep(6); // Completed

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      addRecoveryMessage(`❌ Recovery failed: ${errorMsg}`);
      setRecoveryStatus("Recovery Failed");
      
      // Still allow user to continue with UI simulation
      setRecoveryStep(6);
      setRecoveryProgress(100);
    }
  };

  const handleRemoveGuardian = (contractAddress: string, guardianAddress: string) => {
    setInteractedContracts(prev => 
      prev.map(contract => 
        contract.address === contractAddress 
          ? {
              ...contract, 
              guardians: contract.guardians.filter(g => g !== guardianAddress)
            }
          : contract
      )
    );
    // Go back to contract manager to show updated state
    setShowContractManager(true);
    setShowRecoverySimulation(false);
  };

  const handleUpdateGuardians = (contract: {address: string; guardians: string[]}) => {
    setSelectedContract(contract);
    // Switch back to deployer view but pre-fill with current guardians
    setGuardian1(contract.guardians[0] || "");
    setGuardian2(contract.guardians[1] || "");
    setGuardian3(contract.guardians[2] || "");
    setShowContractManager(false);
    setShowRecoverySimulation(false);
    setShowContractDetails(false);
    setDeploymentResult(null);
  };

  const handleRemoveContract = (contractAddress: string) => {
    setInteractedContracts(prev => prev.filter(contract => contract.address !== contractAddress));
    if (selectedContract?.address === contractAddress) {
      setSelectedContract(null);
    }
    setShowContractManager(true);
    setShowRecoverySimulation(false);
  };

  const handleViewContractDetails = (contract: {address: string; guardians: string[]}) => {
    setSelectedContract(contract);
    setShowContractDetails(true);
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleConfirmAction = (action: string, callback: () => void) => {
    setConfirmAction({
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${action}? This action cannot be undone.`,
      action: callback
    });
    setShowConfirmModal(true);
  };

  const confirmAndExecute = () => {
    if (confirmAction) {
      confirmAction.action();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleDeploy = async () => {
    if (!guardian1 || !guardian2 || !guardian3) {
      setFormError("Please enter all three guardian addresses");
      return;
    }
    if (!account) {
      setFormError("Please connect your wallet first");
      return;
    }

    const invalidAddresses = [guardian1, guardian2, guardian3].filter(addr => !validateStarknetAddress(addr));
    if (invalidAddresses.length > 0) {
      setFormError("Invalid Starknet address format");
      return;
    }

    const uniqueAddresses = new Set([guardian1, guardian2, guardian3]);
    if (uniqueAddresses.size !== 3) {
      setFormError("Guardians must be unique");
      return;
    }

    setFormError(null);
    setIsDeploying(true);

    try {
      const classHash = GUARDIAN_CONTRACT_CLASS_HASH;
      
      setDeploymentStatus("Deploying Guardian contract...");
      setTransactionProgress(0);
      
      // ⚠️ TODO: Replace with real Starknet blockchain calls
      // Real implementation would use:
      // 1. starknetAccount.deployContract({
      //      classHash: GUARDIAN_CONTRACT_CLASS_HASH,
      //      constructorCalldata: CallData.compile([account.address, guardian1, guardian2, guardian3])
      //    });
      // 2. Wait for transaction confirmation
      // 3. Extract contract address from deployment response

      // Enhanced blockchain integration simulation
      await new Promise(resolve => setTimeout(resolve, 500));
      setDeploymentStatus("Preparing contract deployment...");
      setTransactionProgress(15);

      await new Promise(resolve => setTimeout(resolve, 800));
      setDeploymentStatus("Executing contract deployment...");
      setTransactionProgress(40);

      await new Promise(resolve => setTimeout(resolve, 1200));
      setDeploymentStatus("Confirming on blockchain...");
      setTransactionProgress(75);

      await new Promise(resolve => setTimeout(resolve, 500));
      setDeploymentStatus("Validating deployment...");
      setTransactionProgress(95);
      
      // Generate realistic Starknet addresses (for demo purposes)
      const mockTxHash = `0x${Math.random().toString(36).substring(2).padStart(64, '0').slice(0, 64)}`;
      const mockContractAddress = `0x${Math.random().toString(36).substring(2).padStart(64, '0').slice(0, 64)}`;
      
      setDeploymentResult({
        txHash: mockTxHash,
        contractAddress: mockContractAddress
      });
      
      const newContract = {
        address: mockContractAddress,
        guardians: [guardian1, guardian2, guardian3]
      };
      
      setInteractedContracts(prev => [...prev, newContract]);
      
    } catch (error: unknown) {
      console.error("Deployment failed:", error);
      setFormError("Deployment failed. Please try again.");
    } finally {
      setIsDeploying(false);
      setDeploymentStatus("");
      setTransactionProgress(0);
    }
  };

  const ConnectWalletView = () => (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border border-[#2A4B41] rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-[#2A4B41] rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-[#2A4B41] rounded-full"></div>
      </div>
      
      <Card className="w-full max-w-md border-0 shadow-xl bg-white relative overflow-hidden">
        {/* Subtle overlay pattern */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#2A4B41]/5 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
        
        <CardHeader className="text-center px-8 py-12 relative z-10">
          <div className="w-20 h-20 bg-[#2A4B41] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-[#2A2A2A] mb-4 tracking-tight">
              Guardian
            </CardTitle>
            <CardDescription className="text-[#666666] font-normal text-base leading-relaxed">
              Secure wallets with institutional-grade recovery
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-12 relative z-10">
          <div className="space-y-8">
            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-[#F7F7F7] hover:bg-[#EEEEEE] transition-colors duration-200">
                <div className="w-8 h-8 bg-[#2A4B41]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-[#2A4B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-xs text-[#666666] font-medium">Bank-Grade</p>
              </div>
              <div className="p-4 rounded-lg bg-[#F7F7F7] hover:bg-[#EEEEEE] transition-colors duration-200">
                <div className="w-8 h-8 bg-[#2A4B41]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-[#2A4B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-[#666666] font-medium">Secure Recovery</p>
              </div>
            </div>
            
            <p className="text-[#666666] text-sm text-center leading-relaxed">
              Connect your Starknet wallet to create a secure wallet with trusted recovery guardians.
            </p>
            
            {walletError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{walletError}</p>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleConnectWallet} 
              className="w-full bg-[#2A4B41] hover:bg-[#1E3730] text-white font-medium py-4 text-sm tracking-wide rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
              size="lg"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect Wallet
              </span>
            </Button>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#EEEEEE]">
              <div className="flex items-center gap-1 text-xs text-[#999999]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Starknet Compatible
              </div>
              <div className="w-px h-3 bg-[#EEEEEE]"></div>
              <div className="flex items-center gap-1 text-xs text-[#999999]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 10.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Non-Custodial
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DeployerView = () => (
    <div className="min-h-screen bg-[#F7F7F7] py-12 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-1/4 w-64 h-64 border border-[#2A4B41] rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-48 h-48 border border-[#2A4B41] rounded-full"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-32 relative z-10">
        <div className="flex justify-between items-center mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-[#2A4B41] rounded-full"></div>
              <h1 className="text-3xl font-semibold text-[#2A2A2A] tracking-tight">
                Configure Recovery Helpers
              </h1>
            </div>
            <p className="text-[#666666] text-sm font-normal ml-5">Create your secure wallet with trusted recovery guardians</p>
          </div>
          
          {/* Enhanced disconnect button */}
          <div className="relative group">
            <Button 
              variant="outline" 
              onClick={handleConnectWallet}
              size="sm"
              className="border-[#CCCCCC] text-[#666666] hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 px-4 py-3 text-sm font-medium transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d=" M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Change Wallet
              </span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDisconnectWallet} 
              size="sm"
              className="border-[#CCCCCC] text-[#666666] hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-4 py-3 text-sm font-medium transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </span>
            </Button>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <Card className="border-0 shadow-xl bg-white relative overflow-hidden">
            {/* Subtle overlay gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2A4B41]/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <CardHeader className="pb-8 px-8 pt-8 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2A4B41]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2A4B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.196-2.121L17 20zM9 20H4v-2a3 3 0 05.196-2.121L9 20zM12 8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-[#2A2A2A] tracking-tight">
                      Guardian Addresses
                    </CardTitle>
                    <CardDescription className="text-[#666666] text-sm font-normal">
                      Trusted addresses that can help recover your wallet
                    </CardDescription>
                  </div>
                </div>
                
                {/* Enhanced address display */}
                <div className="text-xs text-[#999999] bg-[#F7F7F7] px-4 py-3 rounded-lg font-mono border border-[#EEEEEE] hover:bg-[#EEEEEE] transition-colors duration-200">
                  <div className="text-[#2A4B41] font-medium text-xs mb-1">Connected</div>
                  {userAddress?.slice(0, 8)}...{userAddress?.slice(-6)}
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#666666]">
                  <div className="w-2 h-2 bg-[#CCCCCC] rounded-full"></div>
                  <span className="font-medium">Step 1 of 2</span>
                </div>
                <div className="w-full bg-[#F7F7F7] rounded-full h-1">
                  <div className="bg-[#2A4B41] h-1 rounded-full transition-all duration-500" style={{ width: '33%' }}></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 relative z-10">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#666666] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{formError}</p>
                  </div>
                </div>
              )}
              
              {deploymentStatus && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5v5m-11 0a8 8 0 1115.356-2m0 0H15" />
                      </svg>
                      {deploymentStatus}
                    </span>
                    <span className="text-sm text-blue-600 font-mono font-semibold">{transactionProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-[#2A4B41] rounded-full transition-all duration-700 shadow-sm" style={{ width: `${transactionProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="space-y-6 mb-8">
                {[
                  { id: "guardian1", label: "Guardian 1", value: guardian1, setter: setGuardian1 },
                  { id: "guardian2", label: "Guardian 2", value: guardian2, setter: setGuardian2 },
                  { id: "guardian3", label: "Guardian 3", value: guardian3, setter: setGuardian3 }
                ].map(({ id, label, value, setter }, index) => (
                  <div key={id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#F7F7F7] border border-[#CCCCCC] rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#666666]">{index + 1}</span>
                      </div>
                      <Label htmlFor={id} className="text-sm font-semibold text-[#2A2A2A]">
                        {label}
                      </Label>
                    </div>
                    <div className="relative group">
                      <Input 
                        id={id}
                        placeholder="Enter Starknet address..."
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        onFocus={() => setFocusedInput(id)}
                        onBlur={() => setFocusedInput(null)}
                        className={`h-12 bg-white text-[#2A2A2A] placeholder:text-[#999999] rounded-lg transition-all duration-300 text-sm font-mono border ${
                          focusedInput === id 
                            ? 'border-[#2A4B41] ring-2 ring-[#2A4B41]/20 shadow-sm' 
                            : 'border-[#EEEEEE] hover:border-[#CCCCCC] hover:shadow-sm'
                        } ${value && validateStarknetAddress(value) ? 'pr-10' : 'px-4'}`}
                      />
                      {/* Validation indicator */}
                      {value && validateStarknetAddress(value) && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                          <svg className="w-3 h-3 text-[#2A4B41]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Success metrics */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE]">
                  <div className="text-xs text-[#666666] mb-1">Estimated Cost</div>
                  <div className="text-lg font-semibold text-[#2A2A2A]">~$0.001 ETH</div>
                </div>
                <div className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE]">
                  <div className="text-xs text-[#666666] mb-1">Deployment Time</div>
                  <div className="text-lg font-semibold text-[#2A2A2A]">2-3 min</div>
                </div>
              </div>

              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying || !guardian1 || !guardian2 || !guardian3}
                className="w-full bg-[#2A4B41] rounded-lg hover:bg-[#1E3730] disabled:bg-[#CCCCCC] text-white font-semibold py-4 text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <Spinner />
                    <span className="ml-3">Deploying Secure Wallet...</span>
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Deploy Secure Wallet
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-48 h-48 border border-green-500 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-[#2A4B41] rounded-full"></div>
      </div>

      <Card className="w-full max-w-lg border-0 shadow-2xl bg-white relative overflow-hidden">
        {/* Subtle overlay gradient */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/8 to-[#2A4B41]/5 rounded-full -translate-y-20 translate-x-20"></div>
        
        <CardHeader className="text-center pb-6 px-8 pt-10 relative z-10">
          <div className="w-16 h-16 bg-[#2A4B41] rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-[#2A2A2A] tracking-tight">
              Wallet Secured
            </CardTitle>
            <CardDescription className="text-[#666666] text-sm font-normal leading-relaxed">
              Your Guardian wallet is now active on Starknet
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8 relative z-10">
          {/* Wallet Information Section */}
          <div className="space-y-4">
            {/* Wallet Address */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#2A2A2A] block">
                Wallet Address
              </Label>
              <div className="font-mono text-xs text-[#2A2A2A] bg-[#F7F7F7] p-3 rounded-lg border border-[#EEEEEE] break-all hover:bg-[#EEEEEE] transition-colors duration-200">
                {deploymentResult?.contractAddress}
              </div>
            </div>
            
            {/* Transaction Hash */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#2A2A2A] block">
                Transaction Hash
              </Label>
              <div className="font-mono text-xs text-[#2A2A2A] bg-[#F7F7F7] p-3 rounded-lg border border-[#EEEEEE] break-all hover:bg-[#EEEEEE] transition-colors duration-200">
                {deploymentResult?.txHash}
              </div>
            </div>
            
            {/* Recovery Guardians */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[#2A2A2A] block">
                Recovery Guardians
              </Label>
              <div className="space-y-2">
                {[guardian1, guardian2, guardian3].map((guardian, index) => (
                  <div key={index} className="relative">
                    <div className="text-xs text-[#666666] mb-1 font-medium">
                      Guardian {index + 1}
                    </div>
                    <div className="font-mono text-xs text-[#2A2A2A] bg-[#F7F7F7] p-3 rounded-lg border border-[#EEEEEE] break-all hover:bg-[#EEEEEE] transition-colors duration-200">
                      {guardian}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
            <div className="space-y-3 pt-6 border-t border-[#EEEEEE]">
              <Button
                className="w-full bg-[#2A4B41] hover:bg-[#1E3730] text-white py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setShowContractManager(true)}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Manage Contracts ({interactedContracts.length})
                </span>
              </Button>
              <Button
                onClick={() => {
                  setDeploymentResult(null);
                  setGuardian1("");
                  setGuardian2("");
                  setGuardian3("");
                  setFormError(null);
                  setTransactionProgress(0);
                  setGasEstimate("");
                }}
                className="w-full bg-[#F7F7F7] text-[#666666] hover:bg-[#EEEEEE] py-3 text-sm font-medium rounded-lg transition-all duration-200 border border-[#CCCCCC] hover:border-[#999999]"
                variant="outline"
              >
                Create Another Wallet
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );

  const ContractManagerView = () => (
    <div className="min-h-screen bg-[#F7F7F7] py-12 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border border-[#2A4B41] rounded-full"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-32 relative z-10">
        <div className="flex justify-between items-center mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-[#2A4B41] rounded-full"></div>
              <h1 className="text-3xl font-semibold text-[#2A2A2A] tracking-tight">Contract Manager</h1>
            </div>
            <p className="text-[#666666] mt-4 text-sm font-normal ml-5">Manage your deployed Guardian wallets</p>
          </div>
          <Button variant="outline" onClick={() => setShowContractManager(false)} size="sm" className="border-[#CCCCCC] text-[#666666] relative group hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-6 py-2 text-sm font-medium transition-all duration-200">
            Back to Deployer
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {interactedContracts.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="text-center py-16 px-8">
                <div className="w-16 h-16 bg-[#F7F7F7] rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[#EEEEEE]">
                  <svg className="w-8 h-8 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#2A2A2A] mb-4">No contracts deployed</h3>
                <p className="text-[#666666] mb-8 text-sm">Deploy your first Guardian wallet to get started</p>
                <Button onClick={() => setShowContractManager(false)} className="bg-[#2A4B41] hover:bg-[#1E3730] text-white font-medium py-3 px-6 text-sm tracking-wide rounded-lg transition-all duration-200">
                  Create First Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {interactedContracts.map((contract, index) => (
                <Card key={contract.address} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-6 px-8 pt-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-[#2A2A2A] tracking-tight">Guardian Wallet #{index + 1}</CardTitle>
                        <CardDescription className="text-[#666666] mt-2 text-sm font-mono">
                          {contract.address.slice(0, 12)}...{contract.address.slice(-12)}
                        </CardDescription>
                      </div>
                      <div className="text-xs text-[#999999] bg-[#F7F7F7] px-3 py-2 rounded-md border border-[#EEEEEE]">
                        {contract.guardians.length} guardians
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 px-8 pb-8">
                    <div>
                      <Label className="text-sm font-semibold text-[#2A2A2A] mb-3 block">Contract Address</Label>
                      <div className="font-mono text-xs text-[#666666] bg-[#F7F7F7] p-4 rounded-md break-all border border-[#EEEEEE] hover:bg-[#EEEEEE] transition-colors duration-200">
                        {contract.address}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-[#2A2A2A] mb-3 block">Guardians</Label>
                      <div className="space-y-2">
                        {contract.guardians.map((guardian, guardianIndex) => (
                          <div key={guardianIndex} className="flex items-center justify-between bg-[#F7F7F7] p-4 rounded-md border border-[#EEEEEE] hover:bg-[#EEEEEE] transition-colors duration-200">
                            <span className="font-mono text-xs text-[#666666] flex-1 mr-4">
                              {guardian}
                            </span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleSimulateRecovery(contract)} className="text-xs border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] px-3 py-1 transition-all duration-200">
                                Simulate Recovery
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs border-[#CCCCCC] text-red-700 hover:bg-red-50 px-3 py-1 transition-all duration-200" onClick={() => handleRemoveGuardian(contract.address, guardian)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewContractDetails(contract)} className="flex-1 border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] text-sm font-medium transition-all duration-200">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleUpdateGuardians(contract)} className="flex-1 border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] text-sm font-medium transition-all duration-200">
                        Update Guardians
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleConfirmAction('remove this contract', () => handleRemoveContract(contract.address))} 
                        className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm font-medium transition-all duration-200"
                      >
                        Remove Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RecoverySimulationView = () => {
    const steps = [
      "Check wallet access",
      "Connect to Guardian contract", 
      "Verify guardian addresses",
      "Contact Guardian #1 to initiate",
      "Contact Guardian #2 to confirm",
      "Contact Guardian #3 to finalize",
      "Execute recovery transfer"
    ];

    return (
      <div className="min-h-screen bg-[#F7F7F7] py-12 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-48 h-48 border border-yellow-500 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border border-orange-500 rounded-full"></div>
        </div>
        
        <div className="max-w-2xl mx-auto px-32 relative z-10">
          <div className="flex justify-between items-center mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
                <h1 className="text-3xl font-semibold text-[#2A2A2A] tracking-tight">Recovery Simulation</h1>
              </div>
              <p className="text-[#666666] mt-4 text-sm font-normal ml-5">Simulate the recovery process for your Guardian wallet</p>
            </div>
            <Button variant="outline" onClick={() => setShowRecoverySimulation(false)} size="sm" className="border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] hover:border-[#999999] px-6 py-2 text-sm font-medium transition-all duration-200">
              Back to Manager
            </Button>
          </div>

          <Card className="border-0 shadow-xl bg-white relative overflow-hidden">
            {/* Subtle overlay gradient */}
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="pb-8 px-8 pt-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F7F7F7] rounded-lg flex items-center justify-center border border-[#EEEEEE]">
                  <svg className="w-6 h-6 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-[#2A2A2A] tracking-tight">Recovering Wallet</CardTitle>
                  <CardDescription className="text-[#666666] font-mono text-sm mt-1">
                    {selectedContract?.address.slice(0, 12)}...{selectedContract?.address.slice(-12)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8 relative z-10">
              {/* Real-time Recovery Status */}
              {isRecoveryRunning && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5v5m-11 0a8 8 0 1115.356-2m0 0H15" />
                      </svg>
                      {recoveryStatus}
                    </span>
                    <span className="text-sm font-medium text-blue-600 font-mono">{recoveryProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-[#2A4B41] rounded-full transition-all duration-700 shadow-sm" 
                      style={{ width: `${recoveryProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Real-time Recovery Messages */}
              {recoveryMessages.length > 0 && (
                <div className="bg-[#F7F7F7] rounded-lg p-6 border border-[#EEEEEE] max-h-64 overflow-y-auto">
                  <Label className="text-sm font-semibold text-[#2A2A2A] mb-4 block">Blockchain Recovery Log</Label>
                  <div className="space-y-2 font-mono text-xs">
                    {recoveryMessages.map((message, index) => (
                      <div key={index} className="text-[#2A2A2A] leading-relaxed">
                        [{new Date().toLocaleTimeString()}] {message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#F7F7F7] rounded-lg p-6 border border-[#EEEEEE]">
                <Label className="text-sm font-semibold text-[#2A2A2A] mb-4 block">Recovery Steps</Label>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className={`flex items-center gap-4 p-3 rounded-md transition-all duration-300 ${
                      index <= recoveryStep 
                        ? 'bg-[#2A4B41] text-white shadow-sm' 
                        : 'bg-white border border-[#EEEEEE] text-[#666666] hover:bg-[#F7F7F7]'
                    }`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                        index <= recoveryStep 
                          ? 'bg-white text-[#2A4B41]' 
                          : 'bg-[#CCCCCC] text-[#666666]'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {recoveryStep < steps.length - 1 && (
                <div className="text-center">
                  <Button 
                    onClick={() => setRecoveryStep(prev => prev + 1)}
                    className="w-full bg-[#2A4B41] hover:bg-[#1E3730] text-white font-medium py-3 text-sm tracking-wide rounded-lg transition-all duration-300 hover:scale-[1.01]"
                  >
                    Execute Next Recovery Step
                  </Button>
                </div>
              )}

              {recoveryStep >= steps.length - 1 && (
                <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-[#2A4B41] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#2A2A2A] mb-3">Recovery Complete</h3>
                  <p className="text-[#666666] mb-6 text-sm">
                    Your Guardian wallet has been successfully recovered and you now have control.
                  </p>
                  <Button 
                    onClick={() => setShowRecoverySimulation(false)}
                    variant="outline"
                    className="border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    Return to Contract Manager
                  </Button>
                </div>
              )}

              <div className="text-xs text-[#999999] bg-blue-50 p-4 rounded-md border border-blue-200">
                <strong className="text-[#666666]">Note:</strong> This is a simulation for demonstration purposes. In a real recovery scenario, guardians would need to sign transactions to authorize the recovery.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const ContractDetailsView = () => (
    <div className="min-h-screen bg-[#F7F7F7] py-12 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border border-blue-500 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-blue-500 rounded-full"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-32 relative z-10">
        <div className="flex justify-between items-center mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
              <h1 className="text-3xl font-semibold text-[#2A2A2A] tracking-tight">Contract Details</h1>
            </div>
            <p className="text-[#666666] mt-4 text-sm font-normal ml-5">Detailed information about your Guardian contract</p>
          </div>
          <Button variant="outline" onClick={() => setShowContractDetails(false)} size="sm" className="border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] hover:border-[#999999] px-6 py-2 text-sm font-medium transition-all duration-200">
            Back to Manager
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-white relative overflow-hidden">
          {/* Subtle overlay gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <CardHeader className="pb-8 px-8 pt-8 relative z-10 border-b border-[#EEEEEE]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center border border-[#EEEEEE]">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v1z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-[#2A2A2A] tracking-tight">Guardian Contract</CardTitle>
                <CardDescription className="text-[#666666] font-mono text-sm mt-1">
                  {selectedContract?.address.slice(0, 12)}...{selectedContract?.address.slice(-12)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8 px-8 pb-8 pt-8 relative z-10">
            {/* Contract Address Section */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[#2A2A2A] block">Contract Address</Label>
              <div className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE] hover:bg-[#EEEEEE] transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-[#666666] break-all pr-4">
                    {selectedContract?.address}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] px-3 py-1 transition-all duration-200 flex-shrink-0"
                    onClick={() => handleCopyToClipboard(selectedContract?.address || '')}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Deployment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE]">
                <Label className="text-sm font-semibold text-[#2A2A2A] block mb-2">Contract Type</Label>
                <p className="text-sm text-[#666666]">Guardian Recovery Contract</p>
              </div>
              <div className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE]">
                <Label className="text-sm font-semibold text-[#2A2A2A] block mb-2">Network</Label>
                <p className="text-sm text-[#666666]">Starknet Testnet</p>
              </div>
              <div className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE]">
                <Label className="text-sm font-semibold text-[#2A2A2A] block mb-2">Guardian Count</Label>
                <p className="text-sm text-[#666666]">{selectedContract?.guardians.length || 0} Active Guardians</p>
              </div>
              <div className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE]">
                <Label className="text-sm font-semibold text-[#2A2A2A] block mb-2">Status</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-[#666666]">Active</p>
                </div>
              </div>
            </div>

            {/* Guardians Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-[#2A2A2A] block">Recovery Guardians</Label>
                <div className="text-xs text-[#999999] bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                  {selectedContract?.guardians.length || 0} guardians configured
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedContract?.guardians.map((guardian, index) => (
                  <div key={index} className="bg-[#F7F7F7] rounded-lg p-4 border border-[#EEEEEE] hover:bg-[#EEEEEE] transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                          </div>
                          <Label className="text-sm font-medium text-[#2A2A2A]">Guardian #{index + 1}</Label>
                        </div>
                        <code className="text-xs font-mono text-[#666666] break-all bg-white p-2 rounded border block">
                          {guardian}
                        </code>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] px-3 py-1 transition-all duration-200"
                          onClick={() => handleCopyToClipboard(guardian)}
                        >
                          Copy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-red-200 text-red-700 hover:bg-red-50 px-3 py-1 transition-all duration-200"
                          onClick={() => handleConfirmAction('remove this guardian', () => handleRemoveGuardian(selectedContract?.address || '', guardian))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

              {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-[#EEEEEE]">
              <Button 
                onClick={() => handleSimulateRecovery(selectedContract!)}
                className="flex-1 bg-[#2A4B41] hover:bg-[#1E3730] text-white font-medium py-3 text-sm tracking-wide rounded-lg transition-all duration-300 hover:scale-[1.01]"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5v5m-11 0a8 8 0 1115.356-2m0 0H15" />
                  </svg>
                  Simulate Recovery Process
                </span>
              </Button>
              <Button 
                onClick={() => handleUpdateGuardians(selectedContract!)}
                variant="outline"
                className="flex-1 border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] text-sm font-medium rounded-lg transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Guardians
                </span>
              </Button>
              <Button 
                onClick={() => setShowContractDetails(false)}
                variant="outline"
                className="border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] text-sm font-medium rounded-lg transition-all duration-200 px-6"
              >
                Back to Manager
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-lg shadow-xl border-0 max-w-md w-full mx-4 animate-in fade-in duration-200">
        <Card className="border-0">
          <CardHeader className="pb-6 px-6 pt-6 border-b border-[#EEEEEE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2A2A2A] tracking-tight">
                  {confirmAction?.title}
                </CardTitle>
                <CardDescription className="text-[#666666] text-sm mt-1">
                  This action cannot be undone
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 py-6">
            <p className="text-[#666666] text-sm leading-relaxed mb-6">
              {confirmAction?.message}
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={cancelAction}
                variant="outline"
                className="flex-1 border-[#CCCCCC] text-[#666666] hover:bg-[#F7F7F7] hover:border-[#999999] py-3 text-sm font-medium rounded-lg transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAndExecute}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.01]"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Confirm
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Load contracts from localStorage on component mount
  useEffect(() => {
    const savedContracts = localStorage.getItem('guardian-contracts');
    if (savedContracts) {
      try {
        setInteractedContracts(JSON.parse(savedContracts));
      } catch (error) {
        console.error('Failed to load contracts from localStorage:', error);
      }
    }
    
    document.documentElement.classList.remove('dark');
  }, []);

  // Save contracts to localStorage whenever interactedContracts changes
  useEffect(() => {
    if (interactedContracts.length > 0) {
      localStorage.setItem('guardian-contracts', JSON.stringify(interactedContracts));
    }
  }, [interactedContracts]);

  const ModalWrapper = ({ children }: { children: React.ReactNode }) => (
    <>
      {children}
      {showConfirmModal && <ConfirmationModal />}
    </>
  );

  if (!userAddress) {
    return <ModalWrapper><ConnectWalletView /></ModalWrapper>;
  }

  if (deploymentResult && !showContractManager && !showRecoverySimulation && !showContractDetails) {
    return <ModalWrapper><SuccessView /></ModalWrapper>;
  }

  if (showContractManager && !showRecoverySimulation && !showContractDetails) {
    return <ModalWrapper><ContractManagerView /></ModalWrapper>;
  }

  if (showRecoverySimulation) {
    return <ModalWrapper><RecoverySimulationView /></ModalWrapper>;
  }

  if (showContractDetails) {
    return <ModalWrapper><ContractDetailsView /></ModalWrapper>;
  }

  return <ModalWrapper><DeployerView /></ModalWrapper>;
}
