"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

const DEFAULT_WALLET_ICON = new PhantomWalletAdapter().icon;

// Header wallet entry — always shows "Connect" and opens the wallet picker.
export function WalletConnectButton() {
  const { setVisible } = useWalletModal();
  const { connected, wallet } = useWallet();
  const icon = wallet?.adapter.icon ?? DEFAULT_WALLET_ICON;
  const walletName = wallet?.adapter.name ?? "Phantom";

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className="hud-action-button"
      title={
        connected
          ? `${walletName} connected — click to change wallet`
          : "Connect wallet"
      }
      aria-label={connected ? "Manage wallet connection" : "Connect wallet"}
    >
      <span className="hud-action-button__icon" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" draggable={false} />
      </span>
      Connect
    </button>
  );
}
