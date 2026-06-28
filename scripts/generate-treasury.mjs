import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log("Treasury public key:");
console.log(keypair.publicKey.toBase58());
console.log("");
console.log("Add these to .env.local:");
console.log(`NEXT_PUBLIC_TREASURY_PUBKEY=${keypair.publicKey.toBase58()}`);
console.log(`TREASURY_SECRET_KEY=${JSON.stringify(Array.from(keypair.secretKey))}`);
console.log("");
console.log("Fund the treasury wallet:");
console.log("  SOL  — transaction fees (withdrawals + ATA creation)");
console.log("  SPL  — seed test tokens for withdrawal testing");
console.log("");
console.log("After you have a pump.fun test token CA:");
console.log("  npm run configure-token -- <MINT_CA>");
console.log("  npm run verify-treasury");
