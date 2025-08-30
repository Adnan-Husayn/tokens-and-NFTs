import * as token from "@solana/spl-token";
import "dotenv/config";
import * as helper from "@solana-developers/helpers";
import * as web3 from "@solana/web3.js";

const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

const user = helper.getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 loaded keypair securely, using an env file! our public key is : ${user.publicKey} `,
);

const tokenMintAccount = new web3.PublicKey(
  "EQ2vkXDg2SthEtEhXTD8onkviLEiGvnTHL89rhi8KD65",
);

const recipient = user.publicKey;

const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  recipient,
);

console.log(`Token Account: ${tokenAccount.address.toBase58()}`);

const link = helper.getExplorerLink(
  "address",
  tokenAccount.address.toBase58(),
  "devnet",
);

console.log(`🆒 created token account : ${link}`);
