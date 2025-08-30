"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import ClientOnly from "@/components/ClientOnly";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToInstruction, getAssociatedTokenAddress, getMinimumBalanceForRentExemptMint, getOrCreateAssociatedTokenAccount, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mint, setMint] = useState<String>("")
  const [txSig, setTxSig] = useState<String>("")
  const [tokenMint, setTokenMint] = useState("");
  const [tokenMint2, setTokenMint2] = useState("");
  const [tokenAccountOwner, setTokenAccountOwner] = useState("")
  const [tokenAccount, setTokenAccount] = useState("")
  const [recipient, setRecipient] = useState("")

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    (async () => {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    })();
  }, [publicKey, connection]);


  const handleCreateMint = async () => {
    if (!publicKey) return alert("Connect your wallet first!");

    try {
      setLoading(true);

      const mintKeypair = Keypair.generate();

      const lamports = await getMinimumBalanceForRentExemptMint(connection)

      const tx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          9,
          publicKey,
          publicKey
        )
      )

      const signature = await sendTransaction(tx, connection, { signers: [mintKeypair] });

      const latest = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, ...latest }, "confirmed");

      setMint(mintKeypair.publicKey.toString());
      setTxSig(signature);
      alert(`  Mint created! Address: ${mintKeypair.publicKey.toBase58()}`);

    } catch (error) {
      console.error("Transaction failed", error);
      alert("  Transaction failed!");
    }
    finally {
      setLoading(false)
    }

  }

  const handleCreateTokenAccount = async () => {
    if (!publicKey) return alert("Connect your wallet first!");

    try {
      setLoading(true)

      const associatedToken = await getAssociatedTokenAddress(
        new PublicKey(tokenMint),
        new PublicKey(tokenAccountOwner),
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      const tx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedToken,
          new PublicKey(tokenAccountOwner),
          new PublicKey(tokenMint),
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )

      const signature = sendTransaction(tx, connection);

      setTokenAccount(associatedToken.toString());
      alert(`  Mint created! Address: ${associatedToken.toString()}`);

    } catch (error) {
      console.error("Transaction failed", error);
      alert("  Transaction failed!");
    }
    finally {
      setLoading(false)
    }

  }

  const handleMintingToken = async () => {
    if (!publicKey) return alert("Connect your wallet first!");

    try {
      setLoading(true);

      const recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenMint2),
        new PublicKey(recipient),
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const tx = new Transaction().add(
        createMintToInstruction(
          new PublicKey(tokenMint2),
          recipientTokenAccount,
          publicKey,
          Number(amount),
        )
      );

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert(`  Token Minted! Successfully: ${signature}`);

    } catch (error) {
      console.error("Transaction failed", error);
      alert("  Transaction failed!");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-6">
      <h1 className="text-4xl font-extrabold mb-10 text-center">
        🚀 Solana Token Manager
      </h1>

      <ClientOnly>
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 transition px-6 py-2 rounded-xl font-semibold shadow-lg" />
      </ClientOnly>

      {publicKey && (
        <div className="mt-10 w-full max-w-7xl">
          <div className="bg-gray-800 rounded-2xl shadow-lg p-4 mb-6 text-lg font-semibold text-purple-300 text-center">
            Wallet Balance:{" "}
            {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
              <h2 className="text-xl font-bold text-purple-400">Step 1: Create Mint</h2>
              <button
                onClick={handleCreateMint}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg shadow-md transition"
              >
                {loading ? "Creating Mint..." : "Create Mint"}
              </button>
              {mint && (
                <p className="text-purple-300 text-md font-semibold break-all">
                    Mint Address: {mint}
                </p>
              )}
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
              <h2 className="text-xl font-bold text-purple-400">Step 2: Token Account</h2>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Token Mint"
                  value={tokenMint}
                  onChange={(e) => setTokenMint(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="text"
                  placeholder="Owner Address"
                  value={tokenAccountOwner}
                  onChange={(e) => setTokenAccountOwner(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                onClick={handleCreateTokenAccount}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg shadow-md transition"
              >
                {loading ? "Creating..." : "Create Token Account"}
              </button>
              {tokenAccount && (
                <p className="text-purple-300 text-md font-semibold break-all">
                    Token Account: {tokenAccount}
                </p>
              )}
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col space-y-4">
              <h2 className="text-xl font-bold text-purple-400">Step 3: Mint Tokens</h2>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Token Mint"
                  value={tokenMint2}
                  onChange={(e) => setTokenMint2(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="text"
                  placeholder="Recipient Wallet"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                onClick={handleMintingToken}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg shadow-md transition"
              >
                {loading ? "Minting..." : "Mint Tokens"}
              </button>
              {txSig && (
                <p className="text-purple-300 text-md font-semibold break-all">
                    Transaction: {txSig}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );

}
