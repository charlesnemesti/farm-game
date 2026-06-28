"use client";

// English-only codebase: variable names, comments, and UI strings stay in English.

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { getClientSolanaRpcEndpoint } from "@/lib/treasuryConfig";

// Wallet UI styles are imported here (not in globals.css) to avoid CSS @import ordering issues.
import "@solana/wallet-adapter-react-ui/styles.css";

type SolanaWalletProviderProps = {
  children: React.ReactNode;
};

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => getClientSolanaRpcEndpoint(), []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
