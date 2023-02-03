import * as dotenv from "dotenv"
import ky from "ky-universal"
import putAfter from "put-after"
import { SigningCosmWasmClient, Secp256k1HdWallet, CosmWasmClient } from "cosmwasm"
import { stringToPath } from "@cosmjs/crypto"
import { assertIsDeliverTxSuccess, calculateFee, GasPrice } from "@cosmjs/stargate"
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js"
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js"
import { assert, sleep} from "@cosmjs/utils"
import { toUtf8 } from "@cosmjs/encoding"
import crypto from "crypto";
import chalk from "chalk"
import { ADDRGETNETWORKPARAMS } from "dns"

dotenv.config();


// Required env vars
assert(process.env.MNEMONIC, "MNEMONIC must be set");
const mnemonic = process.env.MNEMONIC;
assert(process.env.MONIKER, "MONIKER must be set");
const moniker = process.env.MONIKER;
assert(process.env.PREFIX, "PREFIX must be set");
const prefix = process.env.PREFIX;
assert(process.env.DENOM, "DENOM must be set");
// The fee denom
const denom = process.env.DENOM;
assert(process.env.ENDPOINT, "ENDPOINT must be set");
const endpoint = process.env.ENDPOINT;
assert(process.env.AURAGIFT_CONTRACT, "AURAGIFT_CONTRACT must be set");
const auragiftContract = process.env.AURAGIFT_CONTRACT;
assert(process.env.GAS_PRICE, "GAS_PRICE must be set. E.g. '0.025unois'");
const gasPrice = GasPrice.fromString(process.env.GAS_PRICE);
const gasWanted = parseInt(process.env.GAS_WANTED)
//random org api key
assert(process.env.API_KEY, "API_KEY must be set");
const api_key = process.env.API_KEY;
//delay between 2 add randomness request
assert(process.env.DELAY, "DELAY must be set. E.g. '5' (second)");
const delay = process.env.DELAY;

// Optional env vars
const endpoint2 = process.env.ENDPOINT2 || null;
const endpoint3 = process.env.ENDPOINT3 || null;


const errorColor = chalk.red;
const warningColor = chalk.hex("#FFA500");
const successColor = chalk.green;
const infoColor = chalk.gray;

// Create a wallet
const path = stringToPath("m/44'/118'/0'/0/0");
const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, 
        {hdPaths:[path], "prefix":prefix});
const [firstAccount] = await wallet.getAccounts();
const client = await SigningCosmWasmClient.connectWithSigner(endpoint, wallet, {
  prefix,
  gasPrice,
});
const botAddress = firstAccount.address;

const balance = await client.getBalance(botAddress,denom)
console.log("\n------------------------------------------------------------------------------------")
console.log(successColor("SigningCosmWasmClient CONNECTION Success"))
console.info(infoColor("account:",botAddress));
console.info(infoColor("balance:"),balance); 
/*
let res = await client.sendTokens(
  "aura1l5mqxps2t749dmcdjmslvhfedvuuw3pwhp4nug",
  "aura1k473nespptmf3ajplq9qr8f83q7d5rpw0hejhw",
  [{"amount":"5000000","denom":"ueaura"}],
  "auto")

console.log(res)
*/
const ExecuteCommand = {
  request_hex_randomness: {
    request_id: "4"
  }
}
let res = await client.execute(
    botAddress, 
    auragiftContract,
    ExecuteCommand,
    "auto",
    "roll token",
    [{"amount":"600","denom":"ueaura"}]
)

console.log(res)