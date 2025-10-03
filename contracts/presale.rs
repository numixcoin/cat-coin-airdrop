use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("CATCoinPresaleProgram111111111111111111111");

#[program]
pub mod cat_presale {
    use super::*;

    /// Initialize the presale program
    pub fn initialize_presale(
        ctx: Context<InitializePresale>,
        token_price: u64, // Price in lamports per token (with decimals)
        total_tokens_for_sale: u64,
        min_purchase: u64,
        max_purchase: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let presale_info = &mut ctx.accounts.presale_info;
        presale_info.authority = ctx.accounts.authority.key();
        presale_info.token_mint = ctx.accounts.token_mint.key();
        presale_info.token_vault = ctx.accounts.token_vault.key();
        presale_info.sol_vault = ctx.accounts.sol_vault.key();
        presale_info.token_price = token_price; // 400 lamports per CAT token (1 SOL = 2.5M CAT)
        presale_info.total_tokens_for_sale = total_tokens_for_sale;
        presale_info.tokens_sold = 0;
        presale_info.sol_raised = 0;
        presale_info.total_buyers = 0;
        presale_info.min_purchase = min_purchase;
        presale_info.max_purchase = max_purchase;
        presale_info.start_time = start_time;
        presale_info.end_time = end_time;
        presale_info.is_active = true;

        msg!("CAT COIN Presale initialized!");
        msg!("Token price: {} lamports per CAT", token_price);
        msg!("Total tokens for sale: {}", total_tokens_for_sale);
        msg!("Min purchase: {} CAT", min_purchase);
        msg!("Max purchase: {} CAT", max_purchase);
        msg!("Start time: {}", start_time);
        msg!("End time: {}", end_time);

        Ok(())
    }

    /// Buy tokens in presale
    pub fn buy_tokens(
        ctx: Context<BuyTokens>,
        sol_amount: u64, // Amount of SOL to spend (in lamports)
    ) -> Result<()> {
        let presale_info = &mut ctx.accounts.presale_info;
        let purchase_record = &mut ctx.accounts.purchase_record;
        let clock = Clock::get()?;

        // Check if presale is active
        require!(presale_info.is_active, ErrorCode::PresaleNotActive);

        // Check time bounds
        require!(
            clock.unix_timestamp >= presale_info.start_time,
            ErrorCode::PresaleNotStarted
        );
        require!(
            clock.unix_timestamp <= presale_info.end_time,
            ErrorCode::PresaleEnded
        );

        // Calculate token amount: 1 SOL = 2,500,000 CAT
        // Price per CAT token = 1 SOL / 2,500,000 = 400 lamports per CAT token
        let token_amount = sol_amount * 2_500_000 / 1_000_000_000; // Convert lamports to SOL, then to CAT

        // Check minimum and maximum purchase limits
        require!(
            token_amount >= presale_info.min_purchase,
            ErrorCode::BelowMinimumPurchase
        );
        require!(
            purchase_record.total_purchased + token_amount <= presale_info.max_purchase,
            ErrorCode::ExceedsMaximumPurchase
        );

        // Check if there are enough tokens left
        require!(
            presale_info.tokens_sold + token_amount <= presale_info.total_tokens_for_sale,
            ErrorCode::InsufficientTokensForSale
        );

        // Check if user has enough SOL
        require!(
            ctx.accounts.buyer.lamports() >= sol_amount,
            ErrorCode::InsufficientSOL
        );

        // Transfer SOL from buyer to sol_vault
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.sol_vault.key(),
            sol_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.sol_vault.to_account_info(),
            ],
        )?;

        // Transfer tokens from vault to buyer
        let seeds = &[
            b"presale_info",
            &[ctx.bumps.presale_info],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.token_vault.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.presale_info.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::transfer(cpi_ctx, token_amount)?;

        // Update purchase record
        if purchase_record.total_purchased == 0 {
            purchase_record.buyer = ctx.accounts.buyer.key();
            purchase_record.first_purchase_at = clock.unix_timestamp;
            presale_info.total_buyers += 1;
        }
        purchase_record.total_purchased += token_amount;
        purchase_record.total_sol_spent += sol_amount;
        purchase_record.last_purchase_at = clock.unix_timestamp;

        // Update presale stats
        presale_info.tokens_sold += token_amount;
        presale_info.sol_raised += sol_amount;

        msg!("Tokens purchased successfully!");
        msg!("Buyer: {}", ctx.accounts.buyer.key());
        msg!("SOL spent: {} lamports", sol_amount);
        msg!("CAT tokens received: {}", token_amount);
        msg!("Total tokens sold: {}", presale_info.tokens_sold);
        msg!("Total SOL raised: {} lamports", presale_info.sol_raised);

        Ok(())
    }

    /// Add tokens to presale vault (only authority)
    pub fn fund_presale(
        ctx: Context<FundPresale>,
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

        msg!("Presale funded with {} CAT tokens", amount);

        Ok(())
    }

    /// Update presale settings (only authority)
    pub fn update_presale(
        ctx: Context<UpdatePresale>,
        new_token_price: Option<u64>,
        new_end_time: Option<i64>,
        new_is_active: Option<bool>,
        new_min_purchase: Option<u64>,
        new_max_purchase: Option<u64>,
    ) -> Result<()> {
        let presale_info = &mut ctx.accounts.presale_info;

        if let Some(token_price) = new_token_price {
            presale_info.token_price = token_price;
            msg!("Updated token price to: {} lamports per CAT", token_price);
        }

        if let Some(end_time) = new_end_time {
            presale_info.end_time = end_time;
            msg!("Updated end time to: {}", end_time);
        }

        if let Some(is_active) = new_is_active {
            presale_info.is_active = is_active;
            msg!("Updated active status to: {}", is_active);
        }

        if let Some(min_purchase) = new_min_purchase {
            presale_info.min_purchase = min_purchase;
            msg!("Updated min purchase to: {} CAT", min_purchase);
        }

        if let Some(max_purchase) = new_max_purchase {
            presale_info.max_purchase = max_purchase;
            msg!("Updated max purchase to: {} CAT", max_purchase);
        }

        Ok(())
    }

    /// Withdraw SOL raised (only authority)
    pub fn withdraw_sol(
        ctx: Context<WithdrawSOL>,
        amount: u64,
    ) -> Result<()> {
        let presale_info = &ctx.accounts.presale_info;

        // Check if withdrawal amount is available
        require!(
            ctx.accounts.sol_vault.lamports() >= amount,
            ErrorCode::InsufficientSOLInVault
        );

        // Transfer SOL from vault to authority
        **ctx.accounts.sol_vault.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.try_borrow_mut_lamports()? += amount;

        msg!("Withdrawn {} lamports SOL", amount);

        Ok(())
    }

    /// Withdraw remaining tokens (only authority, after presale ends)
    pub fn withdraw_remaining_tokens(
        ctx: Context<WithdrawRemainingTokens>,
    ) -> Result<()> {
        let presale_info = &ctx.accounts.presale_info;
        let clock = Clock::get()?;

        // Check if presale has ended
        require!(
            clock.unix_timestamp > presale_info.end_time || !presale_info.is_active,
            ErrorCode::PresaleStillActive
        );

        let remaining_balance = ctx.accounts.token_vault.amount;

        if remaining_balance > 0 {
            let seeds = &[
                b"presale_info",
                &[ctx.bumps.presale_info],
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.authority_token_account.to_account_info(),
                authority: ctx.accounts.presale_info.to_account_info(),
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
pub struct InitializePresale<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + PresaleInfo::INIT_SPACE,
        seeds = [b"presale_info"],
        bump
    )]
    pub presale_info: Account<'info, PresaleInfo>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = presale_info,
        seeds = [b"token_vault"],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    /// CHECK: This is a PDA that will hold SOL
    #[account(
        init,
        payer = authority,
        space = 0,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"presale_info"],
        bump
    )]
    pub presale_info: Account<'info, PresaleInfo>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + PurchaseRecord::INIT_SPACE,
        seeds = [b"purchase_record", buyer.key().as_ref()],
        bump
    )]
    pub purchase_record: Account<'info, PurchaseRecord>,

    #[account(
        mut,
        seeds = [b"token_vault"],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,

    /// CHECK: This is a PDA that holds SOL
    #[account(
        mut,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = presale_info.token_mint,
        token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FundPresale<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"presale_info"],
        bump,
        has_one = authority
    )]
    pub presale_info: Account<'info, PresaleInfo>,

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
pub struct UpdatePresale<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"presale_info"],
        bump,
        has_one = authority
    )]
    pub presale_info: Account<'info, PresaleInfo>,
}

#[derive(Accounts)]
pub struct WithdrawSOL<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"presale_info"],
        bump,
        has_one = authority
    )]
    pub presale_info: Account<'info, PresaleInfo>,

    /// CHECK: This is a PDA that holds SOL
    #[account(
        mut,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct WithdrawRemainingTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"presale_info"],
        bump,
        has_one = authority
    )]
    pub presale_info: Account<'info, PresaleInfo>,

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
pub struct PresaleInfo {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault: Pubkey,
    pub sol_vault: Pubkey,
    pub token_price: u64, // Price in lamports per token
    pub total_tokens_for_sale: u64,
    pub tokens_sold: u64,
    pub sol_raised: u64,
    pub total_buyers: u64,
    pub min_purchase: u64,
    pub max_purchase: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub is_active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct PurchaseRecord {
    pub buyer: Pubkey,
    pub total_purchased: u64,
    pub total_sol_spent: u64,
    pub first_purchase_at: i64,
    pub last_purchase_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Presale is not active")]
    PresaleNotActive,
    #[msg("Presale has not started yet")]
    PresaleNotStarted,
    #[msg("Presale has ended")]
    PresaleEnded,
    #[msg("Purchase amount is below minimum")]
    BelowMinimumPurchase,
    #[msg("Purchase amount exceeds maximum allowed")]
    ExceedsMaximumPurchase,
    #[msg("Insufficient tokens available for sale")]
    InsufficientTokensForSale,
    #[msg("Insufficient SOL balance")]
    InsufficientSOL,
    #[msg("Insufficient SOL in vault")]
    InsufficientSOLInVault,
    #[msg("Presale is still active")]
    PresaleStillActive,
}