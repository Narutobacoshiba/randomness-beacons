#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{Binary, Deps, DepsMut, Env, MessageInfo, Addr,
                    Reply, Response, StdResult, to_binary, Coin};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::state::{Generators, GENERATORS, RandomState, RANDOM_STATE_HISTORY};
use crate::msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg, RandomStateResponse, IsRegisterResponse};

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:vrf-contract";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");
const COIN_DENOM: &str = "uaura";

/// Handling contract instantiation
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let init_random_state = RandomState {
        round: 0,
        randomness: String::from(""),
        signature:  String::from(""),
        generator: None,
        block_height: 0,
    };

    RANDOM_STATE_HISTORY.push_back(deps.storage, &init_random_state)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender))
}

/// Handling contract migration
/// To make a contract migratable, you need
/// - this entry_point implemented
/// - only contract admin can migrate, so admin has to be set at contract initiation time
/// Handling contract execution
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, msg: MigrateMsg) -> Result<Response, ContractError> {
    match msg {
        // Find matched incoming message variant and execute them with your custom logic.
        //
        // With `Response` type, it is possible to dispatch message to invoke external logic.
        // See: https://github.com/CosmWasm/cosmwasm/blob/main/SEMANTICS.md#dispatching-messages
    }
}

/// Handling contract execution
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        // Find matched incoming message variant and execute them with your custom logic.
        //
        // With `Response` type, it is possible to dispatch message to invoke external logic.
        // See: https://github.com/CosmWasm/cosmwasm/blob/main/SEMANTICS.md#dispatching-messages
    
        ExecuteMsg::Register{public_key} => execute::register(_deps,_info,public_key),
        ExecuteMsg::Push{randomness,signature} => execute::push(_deps,_info,_env,randomness,signature),
        ExecuteMsg::GetRandomValue{} => execute::get_random_value(_deps,_info),
        ExecuteMsg::ClaimReward{} => execute::claim_reward(_deps,_info),
    }
}

pub mod execute {
    use super::*;

    pub fn get_random_value(_deps: DepsMut, _info: MessageInfo) -> Result<Response, ContractError>{
        let last_random_state_op = RANDOM_STATE_HISTORY.back(_deps.storage)?;

        if last_random_state_op.is_some() {
            let last_random_state = last_random_state_op.unwrap();

            if last_random_state.generator != None {
                if GENERATORS.has(_deps.storage, last_random_state.generator.clone().expect("error")) {
                    let mut generator = GENERATORS.load(_deps.storage, last_random_state.generator.expect("error"))?;
                    
                    for fund in _info.funds {
                        let coin: Coin = fund;
                        if coin.denom.eq(&COIN_DENOM) {
                            generator.reward.amount += coin.amount;
                            break;
                        }
                    }
                }
            }
        
            return Ok(Response::new()
                    .add_attribute("round", last_random_state.round.to_string())
                    .add_attribute("randomness", last_random_state.randomness)
                    .add_attribute("signature", last_random_state.signature)
                );
        }
        return Ok(Response::new()
                    .add_attribute("round", "".to_string())
                    .add_attribute("randomness", "".to_string())
                    .add_attribute("signature", "".to_string())
                );
    }

    pub fn register(_deps: DepsMut, _info: MessageInfo, public_key: String) -> Result<Response, ContractError>{
        if GENERATORS.has(_deps.storage, _info.sender.clone()) {
            return Err(ContractError::CustomError{val:"address has been registered!".to_string()});
        }else{
            let public_key_bytes = hex::decode(public_key.clone()).unwrap();
            if public_key_bytes.len() != 33 || (public_key_bytes[0] != 2 && public_key_bytes[0] != 3) {
                return Err(ContractError::CustomError{val:"invalid public key".to_string()});
            }

            GENERATORS.save(_deps.storage, _info.sender.clone(), &Generators{
                addr: _info.sender.clone(),
                public_key: public_key,
                reward: Coin::new(0,COIN_DENOM),
            })?;
        }
        return Ok(Response::new().add_attribute("action", "register"));
    }


    pub fn push(_deps: DepsMut, _info: MessageInfo, _env: Env, randomness: String, signature: String) -> Result<Response, ContractError>{
        let randomness_bytes = hex::decode(randomness.clone()).unwrap();
        let signature_bytes = hex::decode(signature.clone()).unwrap();

        if GENERATORS.has(_deps.storage, _info.sender.clone()) {
            let generator = GENERATORS.load(_deps.storage, _info.sender.clone())?;
            
            let key_bytes = hex::decode(generator.public_key.clone()).unwrap();
            let result = _deps
                        .api
                        .secp256k1_verify(&randomness_bytes, &signature_bytes, &key_bytes);

            match result {
                Ok(true) => {
                    let last_random_state_op = RANDOM_STATE_HISTORY.back(_deps.storage)?;

                    if last_random_state_op.is_some() {
                        let last_random_state = last_random_state_op.unwrap();

                        let current_block_height = _env.block.height;
                        if current_block_height >= last_random_state.block_height + 30 {
                            RANDOM_STATE_HISTORY.push_back(_deps.storage,&RandomState {
                                round: last_random_state.round + 1,
                                randomness: randomness,
                                signature:  signature,
                                generator: Some(_info.sender.clone()),
                                block_height: current_block_height,
                            })?;
                        }
                    }
                },
                Ok(false) => return Err(ContractError::CustomError{val:"some error".to_string()}),
                Err(_err) => return Err(ContractError::CustomError{val:"some error".to_string()}),
            }
        }else{
            return Err(ContractError::CustomError{val:"Unregistered address!".to_string()});
        }
        return Ok(Response::new().add_attribute("action", "push"));
    }


    pub fn claim_reward(_deps: DepsMut, _info: MessageInfo) -> Result<Response, ContractError>{
        if GENERATORS.has(_deps.storage, _info.sender.clone()) {
            
        }else{
            return Err(ContractError::CustomError{val:"Unregistered address!".to_string()});
        }
        return Ok(Response::new().add_attribute("action", "claim_reward"));
    }
}


/// Handling contract query
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(_deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        // Find matched incoming message variant and query them your custom logic
        // and then construct your query response with the type usually defined
        // `msg.rs` alongside with the query message itself.
        //
        // use `cosmwasm_std::to_binary` to serialize query response to json binary.
        QueryMsg::GetRandomState{} => to_binary(&query_random_state(_deps)?),
        QueryMsg::IsRegister{account} => to_binary(&query_is_register(_deps,account)?),
    }
}

fn query_random_state(_deps: Deps) -> StdResult<RandomStateResponse>{
    return Ok(RandomStateResponse {
        round: 0,
        randomness: "".to_string(),
        signature: "".to_string(),
    })
}

fn query_is_register(_deps: Deps, account:Addr) -> StdResult<IsRegisterResponse>{
    if GENERATORS.has(_deps.storage, account.clone()) {
        let generator = GENERATORS.load(_deps.storage, account.clone())?;
        return Ok(IsRegisterResponse{public_key:generator.public_key})
    }
    return Ok(IsRegisterResponse{public_key:"".to_string()});
}

/// Handling submessage reply.
/// For more info on submessage and reply, see https://github.com/CosmWasm/cosmwasm/blob/main/SEMANTICS.md#submessages
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(_deps: DepsMut, _env: Env, _msg: Reply) -> Result<Response, ContractError> {
    // With `Response` type, it is still possible to dispatch message to invoke external logic.
    // See: https://github.com/CosmWasm/cosmwasm/blob/main/SEMANTICS.md#dispatching-messages

    todo!()
}

#[cfg(test)]
mod tests {
    use cosmwasm_std::testing::{
        mock_dependencies, mock_info,
    };

    //const NFT_CONTRACT_ADDR: &str = "nftcontract"; // Fake address we will use to mock_info of cw721_address


    #[test]
    fn initialization() {
        let deps = mock_dependencies();
        let info = mock_info("owner", &[]);
        assert_eq!("","");
    }
    
    #[test]
    fn instantiate_works(){
        let deps = mock_dependencies();
        /*
        let register_msg = ExecuteMsg::Register {
            generator: "a".to_string(),
            public_key: "a".to_string(),
        };

        let info = mock_info("owner", &[]);
        execute(deps.as_mut(), mock_env(), info.clone(), register_msg.clone());
        let res = execute(deps.as_mut(), mock_env(), info, register_msg).unwrap_err();
        //let expected:Response<&str> = Response::new().add_attribute("action", "register");
        let expected = String::from("register");
        match res {
            ContractError::Unauthorized{val:expected} => {},
            _ => panic!("unexpected error")
        }*/
        assert_eq!("","");
    }

    #[test]
    fn test_verify_message_works(){
        let mut deps = mock_dependencies();
        
    }
}