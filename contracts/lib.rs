use anchor_lang::prelude::*;

pub mod cat_token;
pub mod airdrop;
pub mod presale;

pub use cat_token::*;
pub use airdrop::*;
pub use presale::*;

declare_id!("CATCoinMainProgram1111111111111111111111111");