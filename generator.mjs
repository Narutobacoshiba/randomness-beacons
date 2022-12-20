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
        try{
            const ExecuteRequestRandomnessMsg = {
                get_random_value: {
                    job_id: job_ids[index],
                }
            }
            let register_res = await client.execute(
                accs[0].address, 
                abt_contract_address,
                ExecuteRequestRandomnessMsg,
                "auto",
                "randomness token",
                [{"amount":"300","denom":"ueaura"}]
            )
            console.log(register_res)
        }catch(err){
            console.log(err)
        }
    }
} 

await run(mnemonic, job_ids_1)
await run(mnemonic2, job_ids_2)

/*
const urls = config.get('drand.urls').slice() 
// Shuffle enpoints to reduce likelyhood of two bots ending up with the same endpoint
shuffle(urls);

const chainHash = config.get('drand.chainHash')
const publicKey = config.get('drand.publicKey')

const drandGenesis = 1595431050;
const drandRoundLength = 30;
  

async function main() {
    
    console.info(infoColor("\nGenerate key pair ..."));
    // generate privKey
    let privKey
    do {
    privKey = crypto.randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))
    console.log("Private key:",successColor(Buffer.from(privKey).toString('hex')))
    // get the public key in a compressed format
    const pubKey = secp256k1.publicKeyCreate(privKey)
    console.log("Public key:",successColor(Buffer.from(pubKey).toString('hex')))


    console.info(infoColor("\nRegistering ..."));

    try{
        const ExecuteRegisterMsg = {
            register: {
                public_key: Buffer.from(pubKey).toString("hex"),
            }
        }
        let register_res = await client.execute(
            accs[0].address, 
            abt_contract_address,
            ExecuteRegisterMsg,
            "auto",
            "register token"
        )
        console.log(register_res)
    }catch(err){
        console.log(err)
    }
        
    // See https://github.com/drand/drand-client#api
    const drand_options = { chainHash, disableBeaconVerification: true };
    const drandClient = await Client.wrap(HTTP.forURLs(urls, chainHash), drand_options);
    // Initialize local sign data
    for await (const res of drandClient.watch()) {
        try{
            console.info(infoColor("\nRecived beancon"))
            console.log("Round:",successColor(res.round))
            console.log("Randomness:", successColor(res.randomness))
            console.log("Signature:",successColor(res.signature))
            console.log("Previous_signature:",successColor(res.previous_signature))
            let verify = verify_beacon(publicKey, 
                                    res.round, 
                                    res.previous_signature, 
                                    res.signature)
            console.log("Verify: ",verify)
            
            let signObj = secp256k1.ecdsaSign(Buffer.from(res.randomness,'hex'), privKey)
            
            try{
                const ExecutePushMsg = {
                    push_randomness: {
                        "randomness": res.randomness,
                        "signature": Buffer.from(signObj.signature).toString("hex"),
                        "drand_response": {
                            round: res.round,
                            signature: res.signature,
                            previous_signature: res.previous_signature
                        },
                    }
                }
                let push_res = await client.execute(accs[0].address, abt_contract_address, ExecutePushMsg, "auto", "push token")
                console.log(push_res.logs[0].events[2].attributes)
            }catch(err){
                console.log(err)
            }

        }catch(err){
            console.error(errorColor(err))
        }
    }
}
  
main().then(
    () => {
      console.info("Done");
      process.exit(0);
    },
    (error) => {
      console.error(error);
      process.exit(1);
    },
);*/