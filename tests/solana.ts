import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";
import * as web3 from "@solana/web3.js";
import BN from 'bn.js';

import * as fs from "fs";

function loadKeypair(filePath: string): web3.Keypair {
  const secretKey = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return web3.Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

describe("solana", () => {
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  let connection = provider.connection;
  const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;
  console.log("Program id: ", program.programId.toString())

  it("initialize", async () => {

    // generate new keypair and airdrop
    let generatedkp = web3.Keypair.generate();
    await confirmTransaction(await provider.connection.requestAirdrop(generatedkp.publicKey, 1 * web3.LAMPORTS_PER_SOL));

    // generate pdaAddress
    const [messagePda, messageBump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("habla")],
      program.programId
    );

    const [uncheckedPDA, _] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("neee")],
      program.programId
    );

    // call the smart contract
    try {
      const txHash = await program.methods
        .initialize("asf")
        .accounts({
          // nonPdaAcc: web3.Keypair.generate().publicKey,
          //@ts-ignore
          // uncheckedAcc: uncheckedPDA
          //@ts-ignore
          newAccount: messagePda,
          signer: generatedkp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([generatedkp])
        .rpc();
      // .view({
      //   skipPreflight: true,
      // })

      await confirmTransaction(txHash);

      // Fetch and print the transaction log 
      printTxLog(txHash)
    }
    catch (e) {
      console.log("ERROR HERE: ", e)
    }


  });

  async function confirmTransaction(txHash: any) {
    let latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txHash,
      },
      "confirmed"
    );
  }

  async function printTxLog(txHash: any) {
    const txDetails = await provider.connection.getTransaction(txHash, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,  // Use default to get all logs
    });

    if (txDetails && txDetails.meta && txDetails.meta.logMessages) {
      console.log("\nTransaction Logs:");
      txDetails.meta.logMessages.forEach((log: string) => {
        if (log.startsWith("Program log:"))
          console.log(log); // Print each log line
      });
    } else {
      console.log("No logs found for the transaction.");
    }
  }

  function printDeploymentKey() {
    const filePath = "/Users/dan/dev/sandbox/language/solana/target/deploy/fusolanalib-keypair.json";
    const keypair = loadKeypair(filePath);
    console.log("Public Key:", keypair.publicKey.toBase58());
  }
});


