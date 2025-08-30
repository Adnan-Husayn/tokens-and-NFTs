import "dotenv/config";
import * as web3 from "@solana/web3.js";
import * as helper from "@solana-developers/helpers";
import * as token from "@solana/spl-token";

const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

const sender = helper.getKeypairFromEnvironment("SECRET_KEY");

const recipient = new web3.PublicKey(
  "9mnovBQ1jcg2hHi1ajjW5jcat3tDobFu46yaVLYiguNX",
);

const tokenMintAccount = new web3.PublicKey(
  "EQ2vkXDg2SthEtEhXTD8onkviLEiGvnTHL89rhi8KD65",
);

const MINOR_PER_MAJOR_UNITS = Math.pow(10, 2);

const sourceTokenAccount = await token.getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  sender.publicKey,
);

const destinationTokenAccount = await token.getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  recipient,
);

const signature = await token.transfer(
  connection,
  sender,
  sourceTokenAccount.address,
  destinationTokenAccount.address,
  sender,
  1 * MINOR_PER_MAJOR_UNITS,
);

const link = helper.getExplorerLink("transaction", signature, "devnet");

console.log(`✨ Transaction completed, link is: ${link}`);
