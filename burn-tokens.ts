import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

import { burn, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const TOKEN_DECIMALS = 2;
const BURN_AMOUNT = 5;

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(`🔐 loaded keypair from environment, PublicKey: ${user.publicKey}`);

const tokenMintAddress = new PublicKey(
  "EQ2vkXDg2SthEtEhXTD8onkviLEiGvnTHL89rhi8KD65",
);

const userTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAddress,
  user.publicKey,
);

const burnAmount = BURN_AMOUNT * 10 ** TOKEN_DECIMALS;

const signature = await burn(
  connection,
  user,
  userTokenAccount.address,
  tokenMintAddress,
  user,
  burnAmount,
);

const link = getExplorerLink("transaction", signature, "devnet");

console.log(`Burn Transaction : ${link}`);
