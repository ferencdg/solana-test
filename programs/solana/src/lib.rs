use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("EzY26ZmMNMgsuRE14A92VUNkt6SiXJ6H6GfuYna4FWTV");

#[program]
mod hello_anchor {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("works");
        Ok(())
    }

    pub fn increase_size(ctx: Context<IncreaseSize>, len: u32) -> Result<()> {
        msg!("works");
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, ind: u32, data: [u8; 32]) -> Result<()> {
        ctx.accounts.new_account.load_mut()?.data_state[ind as usize..(ind + 32) as usize]
            .copy_from_slice(&data);
        Ok(())
    }

    pub fn get_data(ctx: Context<GetData>, ind: u32) -> Result<[u8; 32]> {
        let source =
            &ctx.accounts.new_account.load()?.data_state[ind as usize..(ind + 32) as usize];
        let mut destination: [u8; 32] = [0; 32];
        destination.copy_from_slice(source);
        msg!("val: {:?}", destination);

        Ok(destination)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init_if_needed, seeds = [b"habla"], bump, payer = signer, space = 10 * 1024)]
    pub new_account: AccountLoader<'info, NewAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(len: u16)]
pub struct IncreaseSize<'info> {
    #[account(mut, seeds = [b"habla"], bump, realloc = len as usize, realloc::zero = true, realloc::payer=signer)]
    pub new_account: AccountLoader<'info, NewAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut, seeds = [b"habla"], bump)]
    pub new_account: AccountLoader<'info, NewAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetData<'info> {
    #[account(seeds = [b"habla"], bump)]
    pub new_account: AccountLoader<'info, NewAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account(zero_copy(unsafe))]
pub struct NewAccount {
    pub data_state: [u8; 20480 - 8],
}
