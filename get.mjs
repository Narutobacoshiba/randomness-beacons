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

// Create a wallet
const path = stringToPath("m/44'/118'/0'/0/0");
const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, 
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

const QueryRandomnessMsg = {
	get_randomness: {
	}
};
const res = await client.queryContractSmart(abt_contract_address, QueryRandomnessMsg);
console.log("")
console.log(res)
console.log("")
