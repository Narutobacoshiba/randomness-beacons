use cosmwasm_schema::{cw_serde};
use cosmwasm_std::{Addr};
/// Message type for `instantiate` entry_point
#[cw_serde]
pub struct InstantiateMsg {}

/// Message type for `execute` entry_point
#[cw_serde]
pub enum ExecuteMsg {
    Register{public_key:String},
    Push{randomness:String, signature:String},
    GetRandomValue{},
    ClaimReward{}
}

/// Message type for `migrate` entry_point
#[cw_serde]
pub enum MigrateMsg {}

/// Message type for `query` entry_point
#[cw_serde]
pub enum QueryMsg {
    // This example query variant indicates that any client can query the contract
    // using `YourQuery` and it will return `YourQueryResponse`
    // This `returns` information will be included in contract's schema
    // which is used for client code generation.
    //
    // #[returns(YourQueryResponse)]
    // YourQuery {},
    GetRandomState{},
    IsRegister{account:Addr},
}

// We define a custom struct for each query response
// #[cw_serde]
// pub struct YourQueryResponse {}


#[cw_serde]
pub struct RandomStateResponse {
    pub round: u64,
    pub randomness: String,
    pub signature: String,
}

#[cw_serde]
pub struct IsRegisterResponse {
    pub public_key: String,
}
