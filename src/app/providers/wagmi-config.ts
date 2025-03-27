"use client";

import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { metaMask } from "@wagmi/connectors";
import { publicProvider } from "wagmi/providers/public";
import { mainnet, goerli } from "wagmi/chains";

// Configure blockchain networks
const { chains, publicClient } = configureChains(
  [mainnet, goerli],
  [publicProvider()]
);

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: () => [metaMask({ chains })],
  publicClient,
});

// WagmiProvider Component
export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}
