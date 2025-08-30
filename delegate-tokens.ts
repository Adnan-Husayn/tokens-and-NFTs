import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";

import { approve, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const TOKEN_DECIMALS = 2;
const DELEGATE_AMOUNT = 50;
const MINOR_UNITS_PER_MAJOR_UNITS = 10 ** TOKEN_DECIMALS;

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(`🔐 loaded keypair from environment, PublicKey: ${user.publicKey}`);

const delegatePublicKey = new PublicKey(SystemProgram.programId);

const tokenMintAddress = new PublicKey(
  "EQ2vkXDg2SthEtEhXTD8onkviLEiGvnTHL89rhi8KD65",
);

const userTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAddress,
  user.publicKey,
);

const signature = await approve(
  connection,
  user,
  userTokenAccount.address,
  delegatePublicKey,
  user.publicKey,
  DELEGATE_AMOUNT * MINOR_UNITS_PER_MAJOR_UNITS,
);

const link = getExplorerLink("transaction", signature, "devnet");

console.log(`Delegate approved. Transaction: ${link}`);
