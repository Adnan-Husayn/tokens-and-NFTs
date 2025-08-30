import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

import { revoke, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

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

const signature = await revoke(
  connection,
  user,
  userTokenAccount.address,
  user.publicKey,
);
const link = getExplorerLink("transaction", signature, "devnet");

console.log(`Revoke Delegate Transaction : ${link}`);
