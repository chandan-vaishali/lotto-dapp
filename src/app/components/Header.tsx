"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Header = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Function to connect MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  // Function to disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">
        ??? Lotto DApp
      </Link>
      <nav>
        <ul className="flex gap-6">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/buy-tickets">Buy Tickets</Link></li>
          <li><Link href="/my-tickets">My Tickets</Link></li>
          <li><Link href="/admin">Admin</Link></li>
        </ul>
      </nav>
      <div>
        {walletAddress ? (
          <button onClick={disconnectWallet} className="bg-red-500 px-4 py-2 rounded">
            Disconnect ({walletAddress.substring(0, 6)}...)
          </button>
        ) : (
          <button onClick={connectWallet} className="bg-green-500 px-4 py-2 rounded">
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
