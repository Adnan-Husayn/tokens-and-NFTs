import "dotenv/config";
import * as web3 from "@solana/web3.js";
import * as helper from "@solana-developers/helpers";
import * as token from "@solana/spl-token";

const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

const user = helper.getKeypairFromEnvironment("SECRET_KEY");

const tokenMintAccount = new web3.PublicKey(
  "EQ2vkXDg2SthEtEhXTD8onkviLEiGvnTHL89rhi8KD65",
);

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const recipientAssociatedTokenAccount = new web3.PublicKey(
  "7beSSYqyFvJ4rCNC2CGyc8wDeAAx7xAGuHpuEALgetYC",
);

const transactionSignature = await token.mintTo(
  connection,
  user,
  tokenMintAccount,
  recipientAssociatedTokenAccount,
  user,
  10 * MINOR_UNITS_PER_MAJOR_UNITS,
);

const link = helper.getExplorerLink(
  "transaction",
  transactionSignature,
  "devnet",
);

console.log(`🆒✨ mint token transaction: ${link}`);
