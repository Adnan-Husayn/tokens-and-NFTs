import "dotenv/config";
import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
  sol,
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

const collectionImagePath = "kittens.png";

const buffer = await fs.readFile(collectionImagePath);
let file = createGenericFile(buffer, collectionImagePath, {
  contentType: "image/png",
});
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

const metadata = {
  name: "Smol Cats ",
  description: "a group of smol kittens",
  image,
  external_url: "https://example.com",
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
console.log("Collection offchain metadata URI:", uri);

const collection = generateSigner(umi);

await createCollection(umi, {
  collection,
  name: "Smol Cats ",
  uri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink("address", collection.publicKey, "devnet");
console.log(`Collection: ${explorerLink}`);
console.log(`Collection address is:  ${collection.publicKey}`);
console.log("✅ Finished successfully!");
