import "dotenv/config";
import {
  mplCore,
  create,
  fetchAsset,
  update,
  fetchCollection,
} from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");
console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection).use(mplCore()).use(irysUploader());

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiKeypair));

const metadata = {
  name: "My Updated Asset",
  description: "My Updated Asset Description",
  external_url: "https://example.com",
  attributes: [
    {
      trait_type: "trait1",
      value: "value1",
    },
    {
      trait_type: "trait2",
      value: "value2",
    },
  ],
};

const uri = await umi.uploader.uploadJson(metadata);
console.log("Asset offchain metadata URI:", uri);

const asset = await fetchAsset(
  umi,
  UMIPublicKey("4zTXyPuJRFad2pZ6L2Jm2KCDdnE9QUyymhXnFXrmnx9n"),
);
const collection = await fetchCollection(
  umi,
  UMIPublicKey("AqZNbJkGjbfptMvuvzF66XJqkDUM4dysDskVcuGcqMEw"),
);

await update(umi, {
  asset,
  collection,
  name: "My Updated Asset",
  uri,
}).sendAndConfirm(umi);

let explorerLink = getExplorerLink("address", asset.publicKey, "devnet");
console.log(`Asset updated with new metadata URI: ${explorerLink}`);

console.log("✅ Finished successfully!");
