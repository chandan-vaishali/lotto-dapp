"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Smart contract details (Replace with actual contract address & ABI)
const contractAddress = "0xFEa5cF2172a8701E8715069263e95c74eAcb4817";
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"drawId","type":"uint256"},{"indexed":false,"internalType":"uint8[6]","name":"winningNumbers","type":"uint8[6]"}],"name":"DrawCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"drawId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"drawBlock","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isFutureBlockDraw","type":"bool"},{"indexed":false,"internalType":"uint256","name":"ticketPrice","type":"uint256"}],"name":"DrawStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PrizeClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"drawId","type":"uint256"},{"indexed":false,"internalType":"uint8[5]","name":"numbers","type":"uint8[5]"},{"indexed":false,"internalType":"uint8","name":"lottoNumber","type":"uint8"}],"name":"TicketPurchased","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"},{"internalType":"uint8[5]","name":"numbers","type":"uint8[5]"},{"internalType":"uint8","name":"lottoNumber","type":"uint8"}],"name":"buyTicket","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"},{"internalType":"uint256","name":"ticketIndex","type":"uint256"}],"name":"claimPrize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"},{"internalType":"uint8[6]","name":"_winningNumbers","type":"uint8[6]"}],"name":"completeDrawManually","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"}],"name":"completeDrawWithBlockHash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"drawId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"draws","outputs":[{"internalType":"uint256","name":"ticketPrice","type":"uint256"},{"internalType":"uint256","name":"jackpot","type":"uint256"},{"internalType":"uint256","name":"drawBlock","type":"uint256"},{"internalType":"bool","name":"isFutureBlockDraw","type":"bool"},{"internalType":"bool","name":"completed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"drawId_","type":"uint256"}],"name":"getTotalTicketsSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_ticketPrice","type":"uint256"},{"internalType":"bool","name":"_isFutureBlockDraw","type":"bool"}],"name":"startNewDraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tickets","outputs":[{"internalType":"uint8","name":"lottoNumber","type":"uint8"},{"internalType":"address","name":"buyer","type":"address"}],"stateMutability":"view","type":"function"}];

export default function AdminPage() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [jackpot, setJackpot] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  // Connect MetaMask and authenticate admin
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask is required!");
      return;
    }
    
    const web3Provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(web3Provider);
    
    const signer = await web3Provider.getSigner();
    const userAddress = await signer.getAddress();
    setAccount(userAddress);
    
    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
    setContract(contractInstance);
    
    // Admin Authentication via Message Signing
    const message = "Admin Authentication for Lotto DApp";
    const signedMessage = await signer.signMessage(message);
    
    if (signedMessage) {
      setIsAdmin(true); // Mark user as authenticated
      loadContractData(contractInstance);
    } else {
      alert("Signature failed. Access denied.");
    }
  }

  // Load smart contract data (Jackpot, Tickets, etc.)
  async function loadContractData(contractInstance) {
    const drawId = await contractInstance.drawId();
    const drawDetails = await contractInstance.draws(drawId);
    const price = drawDetails.ticketPrice;

    const jackpotAmount = drawDetails.jackpot;
    const ticketsSold = await contractInstance.getTotalTicketsSold(drawId);

    setTicketPrice(ethers.formatEther(price));
    setJackpot(ethers.formatEther(jackpotAmount));
    setTotalTickets(Number(ticketsSold));
  }

  // Start a new draw (Admin sets ticket price)
  async function startNewDraw() {
    if (!contract) return;
    const tx = await contract.startDraw(ethers.parseEther(ticketPrice));
    await tx.wait();
    alert("New draw started!");
    loadContractData(contract);
  }

  // Complete the draw and select winner
  async function completeDraw() {
    if (!contract) return;
    const tx = await contract.completeDraw();
    await tx.wait();
    alert("Draw completed!");
    loadContractData(contract);
  }

  // Withdraw admin operational fee (20%)
  async function withdrawFee() {
    if (!contract) return;
    const tx = await contract.withdrawFee();
    await tx.wait();
    alert("Fee withdrawn!");
    loadContractData(contract);
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        
        {!account ? (
          <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 mt-4">Connect MetaMask</button>
        ) : isAdmin ? (
          <div>
            <p className="mt-4">Connected: {account}</p>
            <p className="mt-2">Jackpot: {jackpot} ETH</p>
            <p className="mt-2">Total Tickets Sold: {totalTickets}</p>
            
            <div className="mt-4">
              <input type="text" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)}
                     className="border p-2" placeholder="Ticket Price in ETH" />
              <button onClick={startNewDraw} className="bg-green-500 text-white px-4 py-2 ml-2">Start Draw</button>
            </div>
            
            <button onClick={completeDraw} className="bg-red-500 text-white px-4 py-2 mt-4">Complete Draw</button>
            <button onClick={withdrawFee} className="bg-yellow-500 text-white px-4 py-2 mt-4 ml-2">Withdraw Fee</button>
          </div>
        ) : (
          <p className="text-red-500 mt-4">Access Denied: Only Admins Allowed</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
