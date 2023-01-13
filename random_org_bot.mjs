import { SigningCosmWasmClient, Secp256k1HdWallet, coin, parseCoins } from "cosmwasm"
import { stringToPath } from "@cosmjs/crypto"
import { GasPrice } from "@cosmjs/stargate"
import Client, { HTTP } from "drand-client"
import { verify_beacon } from "./drand_verify.js"
import crypto from "crypto";
import secp256k1 from 'secp256k1';
import chalk from "chalk"
import config from "config"


const errorColor = chalk.red;
const warningColor = chalk.hex("#FFA500");
const successColor = chalk.green;
const infoColor = chalk.gray;

const rpcEndpoint = config.get('chain.rpcEndpoint') // which is local testnet RPC node URL
const prefix = config.get('chain.prefix')
const denom = config.get('chain.denom')
const chainId = config.get('chain.chainId')
const aurand_addr = config.get('chain.aurand_addr')
const test_addr = config.get('chain.test_addr')


// Using mnemonic
// You must change mnemonic if you use your mnemonic
const mnemonic = config.get('user.mnemonic')

const job_ids = ["job 1","job 2", "job 3", "job 4", "job 5"]
async function run(mne, job_ids) {
    // Create a wallet
    const path = stringToPath("m/44'/118'/0'/0/0");
    const wallet = await Secp256k1HdWallet.fromMnemonic(mne, 
        {hdPaths:[path], "prefix":prefix});
    const accs = await wallet.getAccounts();
    const gasPrice = GasPrice.fromString(`0.025${denom}`);


    // Create Wasm Client
    const client = await SigningCosmWasmClient.connectWithSigner(
        rpcEndpoint,
        wallet,
        {gasPrice}
    );
    const balance = await client.getBalance(accs[0].address,denom)
    console.log("\n------------------------------------------------------------------------------------")
    console.log(successColor("SigningCosmWasmClient CONNECTION Success"))
    console.info(infoColor("account:",accs[0].address));
    console.info(infoColor("balance:"),balance); 
    
    const QueryResponsesMsg = {
        get_responses: {}
    }
    const res = await  client.queryContractSmart(test_addr, QueryResponsesMsg);

    console.log(res)
    /*
    for(const index in job_ids){
        try{
            const ExecuteRequestHexRandomness = {
                request_hex_randomness: {
                    job_id: job_ids[index],
                }
            }
            let register_res = await client.execute(
                accs[0].address, 
                test_addr,
                ExecuteRequestHexRandomness,
                "auto",
                "randomness token",
                [{"amount":"300","denom":"ueaura"}]
            )
            console.log(register_res)
        }catch(err){
            console.log(err)
        }
    }*/

    const QueryPendingCommitmentsMsg = {
        get_pending_commitments: {}
    }
    const pending_commitments_res = await  client.queryContractSmart(aurand_addr, QueryPendingCommitmentsMsg);
    console.log(pending_commitments_res)

    const QueryCommitmentsMsg = {
        get_commitments: {}
    }
    const commitments_res = await  client.queryContractSmart(aurand_addr, QueryCommitmentsMsg);
    console.log(commitments_res)
    
    const randomness = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

    const ExecuteReceiveMsg = {
        receive: {
            callback: {
                job_id: "06ed32dd4bb686d73cbac4f2c166c7c7e56806714287052d44dce5b3bfda9d27",
                randomness: randomness
            }
        }
    }
    let receive_res = await client.execute(
        accs[0].address, 
        aurand_addr,
        ExecuteReceiveMsg,
        "auto",
        "randomness token",
    )

    console.log(receive_res.logs[0].events)
    console.log(receive_res.logs[0].events[0])
    console.log(receive_res.logs[0].events[1])
    console.log(receive_res.logs[0].events[2])
} 

await run(mnemonic, job_ids)
