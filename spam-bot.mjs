import { SigningCosmWasmClient, Secp256k1HdWallet, coin, parseCoins } from "cosmwasm"
import { stringToPath } from "@cosmjs/crypto"
import { GasPrice } from "@cosmjs/stargate"
import chalk from "chalk"
import config from "config"


const errorColor = chalk.red;
const warningColor = chalk.hex("#FFA500");
const successColor = chalk.green;
const infoColor = chalk.gray;

const rpcEndpoint = config.get('chain.rpcEndpoint') // which is local testnet RPC node URL
const prefix = config.get('chain.prefix')
const denom = config.get('chain.denom')
const abt_contract_address = config.get('chain.abt_contract_address')


// Using mnemonic
// You must change mnemonic if you use your mnemonic
const mnemonic = config.get('user.mnemonic')

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
        try{
            const ExecuteSpamMsg = {
                get_next_randomness: {
                    job_id: "spam-id",
                }
            }
            let register_res = await client.execute(
                accs[0].address, 
                abt_contract_address,
                ExecuteSpamMsg,
                "auto",
                "Spam token",
                [{"amount":"300","denom":"ueaura"}]
            )
            console.log(register_res)
        }catch(err){
            console.log(errorColor(err))
        }
    }
} 

await run(mnemonic)