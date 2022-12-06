import axios from "axios"
import { SigningCosmWasmClient, Secp256k1HdWallet, coin, parseCoins } from "cosmwasm";
import { stringToPath } from "@cosmjs/crypto";
import { GasPrice } from "@cosmjs/stargate"
import crypto from "crypto";
import secp256k1 from 'secp256k1';

const rpcEndpoint = "https://rpc.serenity.aura.network"; // which is local testnet RPC node URL
const prefix = 'aura'
const denom = 'uaura'
const chainId = 'serenity-testnet-001'
const abt_contract_address = "aura1zl5wzcm0z05zxtgt8xh4klejul7utrghc8zdvnu9xal5vq8m3d0svdylny"
const broadcastTimeoutMs = 5000
const broadcastPollIntervalMs = 1000
// Using mnemonic
// You must change mnemonic if you use your mnemonic
const mnemonic = "fat history among correct tribe face armed rough language wonder era ribbon puppy car subject cube provide video math address simple skate swap oval";

// Create a wallet
const path = stringToPath("m/44'/118'/0'/0/0");
const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {hdPaths:[path], "prefix":prefix});
const accs = await wallet.getAccounts();
const gasPrice = GasPrice.fromString(`0.025${denom}`);

// Create Wasm Client
const client = await SigningCosmWasmClient.connectWithSigner(
    rpcEndpoint,
    wallet,
    {gasPrice}
);
const balance = await client.getBalance(accs[0].address,denom)
console.log("------------------------------------------------------------------------------------")
console.log("SigningCosmWasmClient CONNECTION Success")
console.log("account:",accs[0].address);
console.log("balance:",balance); 


const ExecuteGetMsg = {
    get_random_value: {}
}
let push_res = await client.execute(accs[0].address, abt_contract_address, ExecuteGetMsg, "auto", "get token")
console.log(push_res.logs[0].events[2].attributes)
