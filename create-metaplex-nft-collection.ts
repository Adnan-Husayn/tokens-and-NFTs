import "dotenv/config";
import {
  createProgrammableNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
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

console.log("User Loaded:", user.publicKey);

const umi = createUmi(connection);

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());

const collectionImagePath = path.resolve(__dirname, "collection.png");

const buffer = await fs.readFile(collectionImagePath);
let file = createGenericFile(buffer, collectionImagePath, {
  contentType: "image/png",
});

const [image] = await umi.uploader.upload([file]);
console.log("image uri: ", image);

const uri = await umi.uploader.uploadJson({
  name: "MyCollection",
  symbol: "MC",
  description: "My Collection description",
  image,
});

console.log("Collection offchain metadata URI: ", uri);

const collectionMint = generateSigner(umi);

await createProgrammableNft(umi, {
  mint: collectionMint,
  name: "MyCollection",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let link = getExplorerLink("address", collectionMint.publicKey, "devnet");

console.log(`Collection NFT: ${link}`);
console.log(`Collection NFT address is: `, collectionMint.publicKey);
console.log("Finished Successfully 🔥");
