import "dotenv/config";
import {
  mplTokenMetadata,
  findMetadataPda,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  publicKey as UMIPublicKey,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log("User Loaded: ", user.publicKey.toBase58());

const umi = createUmi(connection);
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());

const collectionAddress = UMIPublicKey(
  "96jbE4RwiRa7isQa37MLGQALiCq4cWcr4TttwYQtUUjV",
);

const nftAddress = UMIPublicKey("BnxPRLrJvoRTngMExnY6d2Q6i4B2dExRHTVFWrDsrYM");

const metadata = findMetadataPda(umi, { mint: nftAddress });

await verifyCollectionV1(umi, {
  metadata,
  collectionMint: collectionAddress,
  authority: umi.identity,
}).sendAndConfirm(umi);

let link = getExplorerLink("address", nftAddress, "devnet");

console.log(`verified collection: ${link}`);
console.log("Success 🔥");
