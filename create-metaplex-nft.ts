import {
  createProgrammableNft,
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
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
import "dotenv/config";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log("User Loaded: ", user.publicKey.toBase58());

const umi = createUmi(connection);

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());

const collectionAddress = UMIPublicKey(
  "96jbE4RwiRa7isQa37MLGQALiCq4cWcr4TttwYQtUUjV",
);

const nftData = {
  name: "Fency",
  symbol: "FNCY",
  description: "My Cat Boy",
  sellerFeeBasisPoints: 0,
  imageFile: "catto.png",
};

const NFTImagePath = path.resolve(__dirname, "catto.png");

const buffer = await fs.readFile(NFTImagePath);
let file = createGenericFile(buffer, NFTImagePath, {
  contentType: "image/png",
});

const [image] = await umi.uploader.upload([file]);

const uri = await umi.uploader.uploadJson({
  name: "Fency",
  symbol: "FNCY",
  description: "My Boy Cat",
  image,
});

console.log("NFT offchain metadata URI: ", uri);

const mint = generateSigner(umi);

await createProgrammableNft(umi, {
  mint,
  name: "Fency",
  symbol: "FNCY",
  uri,
  updateAuthority: umi.identity.publickey,
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let link = getExplorerLink("address", mint.publicKey, "devnet");

console.log(`Token Mint: ${link}`);
