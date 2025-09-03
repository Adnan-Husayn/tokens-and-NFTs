import "dotenv/config";
import {
  mplCore,
  create,
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

const assetImagePath = "kitten.png";

const buffer = await fs.readFile(assetImagePath);
let file = createGenericFile(buffer, assetImagePath, {
  contentType: "image/png",
});

const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

const metadata = {
  name: "Calico",
  description: "smol kitten",
  image,
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
  properties: {
    files: [
      {
        uri: image,
        type: "image/jpeg",
      },
    ],
    category: "image",
  },
};

const uri = await umi.uploader.uploadJson(metadata);
console.log("Asset offchain metadata URI:", uri);

const collection = await fetchCollection(
  umi,
  UMIPublicKey("AqZNbJkGjbfptMvuvzF66XJqkDUM4dysDskVcuGcqMEw"),
);
const asset = generateSigner(umi);

await create(umi, {
  asset,
  collection,
  name: "smol cat",
  uri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink("address", asset.publicKey, "devnet");
console.log(`Asset: ${explorerLink}`);
console.log(`Asset address: ${asset.publicKey}`);
