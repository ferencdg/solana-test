use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("DqYtppY28U5emwRQoVTBp871PBZRWhxnHTzKov4xSoN3");

#[program]
mod hello_anchor {
    use anchor_lang::system_program;

    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data_param: String) -> Result<u64> {
        ctx.accounts.new_account.data_state = data_param;
        msg!("works");
        // if (ctx.accounts.unchecked_acc.lamports() == 0) {
        //     msg!("ZERO LAMPORT");
        // }

        // msg!(
        //     "Changed data to: {}!",
        //     ctx.accounts.unchecked_acc.lamports()
        // ); // Message will show up in the tx logs
        Ok(3)
    }
}

#[derive(Accounts)]
#[instruction(data3: String)]
pub struct Initialize<'info> {
    // pub non_pda_acc: Account<'info, NewAccount>,
    /// CHECK: ...
    // #[account(seeds = [b"newee", non_pda_acc.data4.as_ref()], bump)]
    // pub unchecked_acc: UncheckedAccount<'info>,
    #[account(init_if_needed, seeds = [b"habla"], bump, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data_state: String,
}
