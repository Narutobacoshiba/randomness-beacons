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
const abt_contract_address = config.get('chain.abt_contract_address')


// Using mnemonic
// You must change mnemonic if you use your mnemonic
const mnemonic = config.get('user.mnemonic')
const mnemonic2 = config.get('user.mnemonic2')

const job_ids_1 = ["job 1","job 2", "job 3", "job 4", "job 5"]
const job_ids_2 = ["job 6","job 7", "job 8", "job 9", "job 10"]

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
    
    for(const index in job_ids){
        const QueryRandomnessMsg = {
            get_randomness: {
                job_id: job_ids[index]
            }
        };
        const res = await client.queryContractSmart(abt_contract_address, QueryRandomnessMsg);
        console.log(res)
        console.log("")
    }
}

await run(mnemonic, job_ids_1)
await run(mnemonic2, job_ids_2)

