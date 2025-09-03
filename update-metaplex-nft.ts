import "dotenv/config";
import {
  mplTokenMetadata,
  findMetadataPda,
  verifyCollectionV1,
  fetchDigitalAsset,
  fetchMetadataFromSeeds,
  updateV1,
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

const mint = UMIPublicKey("BnxPRLrJvoRTngMExnY6d2Q6i4B2dExRHTVFWrDsrYM");
const nft = await fetchMetadataFromSeeds(umi, { mint });

await updateV1(umi, {
  mint,
  authority: umi.identity,
  data: {
    ...nft,
    sellerFeeBasisPoints: 0,
  },
  primarySaleHappened: true,
  isMutable: true,
}).sendAndConfirm(umi);

let link = getExplorerLink("address", mint, "devnet");

console.log(`NFT updated with new metadata uri: ${link}`);

console.log("🔥 finished");
