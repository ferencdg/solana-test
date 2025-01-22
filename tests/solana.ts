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

    // call the smart contract
    try {
      console.log("## Creating PDA")
      let txHash = await program.methods
        .initialize()
        .accounts({
          //@ts-ignore
          newAccount: messagePda,
          signer: generatedkp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([generatedkp])
        .rpc();
      await confirmTransaction(txHash);
      let messagePdaAccountInfo = await connection.getAccountInfo(messagePda)
      console.log("Account size: ", messagePdaAccountInfo.data.length)

      console.log("## Increasing size")
      txHash = await program.methods
        .increaseSize(20 * 1024)
        .accounts({
          //@ts-ignore
          newAccount: messagePda,
          signer: generatedkp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([generatedkp])
        .rpc();
      await confirmTransaction(txHash);
      messagePdaAccountInfo = await connection.getAccountInfo(messagePda)
      console.log("Account size: ", messagePdaAccountInfo.data.length)

      console.log("## Set data")
      const byteArray: number[] = Array.from({ length: 32 }, (_, i) => i + 1);
      txHash = await program.methods
        .setData(10282, byteArray)
        .accounts({
          //@ts-ignore
          newAccount: messagePda,
          signer: generatedkp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([generatedkp])
        .rpc();

      await confirmTransaction(txHash);
      messagePdaAccountInfo = await connection.getAccountInfo(messagePda)

      console.log("## Get data")
      txHash = await program.methods
        .getData(10282)
        .accounts({
          //@ts-ignore
          newAccount: messagePda,
          signer: generatedkp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([generatedkp])
        .rpc();

      await confirmTransaction(txHash);
      printTxLog(txHash)
    }
    catch (e) {
      console.log("Initialize error: ", e)
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


