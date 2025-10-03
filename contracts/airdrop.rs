use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("CATCoinAirdropProgram1111111111111111111111");

#[program]
pub mod cat_airdrop {
    use super::*;

    /// Initialize the airdrop program
    pub fn initialize_airdrop(
        ctx: Context<InitializeAirdrop>,
        total_airdrop_amount: u64,
        claim_amount: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let airdrop_info = &mut ctx.accounts.airdrop_info;
        airdrop_info.authority = ctx.accounts.authority.key();
        airdrop_info.token_mint = ctx.accounts.token_mint.key();
        airdrop_info.token_vault = ctx.accounts.token_vault.key();
        airdrop_info.total_airdrop_amount = total_airdrop_amount;
        airdrop_info.claim_amount = claim_amount; // 50,000 CAT per user
        airdrop_info.claimed_amount = 0;
        airdrop_info.total_claimers = 0;
        airdrop_info.start_time = start_time;
        airdrop_info.end_time = end_time;
        airdrop_info.is_active = true;

        msg!("CAT COIN Airdrop initialized!");
        msg!("Total airdrop amount: {}", total_airdrop_amount);
        msg!("Claim amount per user: {}", claim_amount);
        msg!("Start time: {}", start_time);
        msg!("End time: {}", end_time);

        Ok(())
    }

    /// Claim airdrop tokens
    pub fn claim_airdrop(
        ctx: Context<ClaimAirdrop>,
    ) -> Result<()> {
        let airdrop_info = &mut ctx.accounts.airdrop_info;
        let claim_record = &mut ctx.accounts.claim_record;
        let clock = Clock::get()?;

        // Check if airdrop is active
        require!(airdrop_info.is_active, ErrorCode::AirdropNotActive);

        // Check time bounds
        require!(
            clock.unix_timestamp >= airdrop_info.start_time,
            ErrorCode::AirdropNotStarted
        );
        require!(
            clock.unix_timestamp <= airdrop_info.end_time,
            ErrorCode::AirdropEnded
        );

        // Check if user has already claimed
        require!(!claim_record.has_claimed, ErrorCode::AlreadyClaimed);

        // Check if there are enough tokens left
        require!(
            airdrop_info.claimed_amount + airdrop_info.claim_amount <= airdrop_info.total_airdrop_amount,
            ErrorCode::InsufficientTokens
        );

        // Mark as claimed
        claim_record.has_claimed = true;
        claim_record.claimed_at = clock.unix_timestamp;
        claim_record.amount_claimed = airdrop_info.claim_amount;

        // Update airdrop stats
        airdrop_info.claimed_amount += airdrop_info.claim_amount;
        airdrop_info.total_claimers += 1;

        // Transfer tokens from vault to user
        let seeds = &[
            b"airdrop_info",
            &[ctx.bumps.airdrop_info],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.token_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.airdrop_info.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::transfer(cpi_ctx, airdrop_info.claim_amount)?;

        msg!("Airdrop claimed successfully!");
        msg!("User: {}", ctx.accounts.user.key());
        msg!("Amount: {}", airdrop_info.claim_amount);
        msg!("Total claimed: {}", airdrop_info.claimed_amount);
        msg!("Total claimers: {}", airdrop_info.total_claimers);

        Ok(())
    }

    /// Add tokens to airdrop vault (only authority)
    pub fn fund_airdrop(
        ctx: Context<FundAirdrop>,
        amount: u64,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.authority_token_account.to_account_info(),
            to: ctx.accounts.token_vault.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        msg!("Airdrop funded with {} CAT tokens", amount);

        Ok(())
    }

    /// Update airdrop settings (only authority)
    pub fn update_airdrop(
        ctx: Context<UpdateAirdrop>,
        new_claim_amount: Option<u64>,
        new_end_time: Option<i64>,
        new_is_active: Option<bool>,
    ) -> Result<()> {
        let airdrop_info = &mut ctx.accounts.airdrop_info;

        if let Some(claim_amount) = new_claim_amount {
            airdrop_info.claim_amount = claim_amount;
            msg!("Updated claim amount to: {}", claim_amount);
        }

        if let Some(end_time) = new_end_time {
            airdrop_info.end_time = end_time;
            msg!("Updated end time to: {}", end_time);
        }

        if let Some(is_active) = new_is_active {
            airdrop_info.is_active = is_active;
            msg!("Updated active status to: {}", is_active);
        }

        Ok(())
    }

    /// Withdraw remaining tokens (only authority, after airdrop ends)
    pub fn withdraw_remaining(
        ctx: Context<WithdrawRemaining>,
    ) -> Result<()> {
        let airdrop_info = &ctx.accounts.airdrop_info;
        let clock = Clock::get()?;

        // Check if airdrop has ended
        require!(
            clock.unix_timestamp > airdrop_info.end_time || !airdrop_info.is_active,
            ErrorCode::AirdropStillActive
        );

        let remaining_balance = ctx.accounts.token_vault.amount;

        if remaining_balance > 0 {
            let seeds = &[
                b"airdrop_info",
                &[ctx.bumps.airdrop_info],
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.authority_token_account.to_account_info(),
                authority: ctx.accounts.airdrop_info.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

            token::transfer(cpi_ctx, remaining_balance)?;

            msg!("Withdrawn {} remaining CAT tokens", remaining_balance);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAirdrop<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + AirdropInfo::INIT_SPACE,
        seeds = [b"airdrop_info"],
        bump
    )]
    pub airdrop_info: Account<'info, AirdropInfo>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = airdrop_info,
        seeds = [b"token_vault"],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimAirdrop<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"airdrop_info"],
        bump
    )]
    pub airdrop_info: Account<'info, AirdropInfo>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + ClaimRecord::INIT_SPACE,
        seeds = [b"claim_record", user.key().as_ref()],
        bump
    )]
    pub claim_record: Account<'info, ClaimRecord>,

    #[account(
        mut,
        seeds = [b"token_vault"],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        token::mint = airdrop_info.token_mint,
        token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FundAirdrop<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"airdrop_info"],
        bump,
        has_one = authority
    )]
    pub airdrop_info: Account<'info, AirdropInfo>,

    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"token_vault"],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateAirdrop<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"airdrop_info"],
        bump,
        has_one = authority
    )]
    pub airdrop_info: Account<'info, AirdropInfo>,
}

#[derive(Accounts)]
pub struct WithdrawRemaining<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"airdrop_info"],
        bump,
        has_one = authority
    )]
    pub airdrop_info: Account<'info, AirdropInfo>,

    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"token_vault"],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct AirdropInfo {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault: Pubkey,
    pub total_airdrop_amount: u64,
    pub claim_amount: u64,
    pub claimed_amount: u64,
    pub total_claimers: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub is_active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct ClaimRecord {
    pub user: Pubkey,
    pub has_claimed: bool,
    pub claimed_at: i64,
    pub amount_claimed: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Airdrop is not active")]
    AirdropNotActive,
    #[msg("Airdrop has not started yet")]
    AirdropNotStarted,
    #[msg("Airdrop has ended")]
    AirdropEnded,
    #[msg("User has already claimed")]
    AlreadyClaimed,
    #[msg("Insufficient tokens in vault")]
    InsufficientTokens,
    #[msg("Airdrop is still active")]
    AirdropStillActive,
}