
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { walletAddress, feeTransactionHash, feePaid } = await req.json()

    console.log('Processing airdrop claim:', { walletAddress, feeTransactionHash, feePaid })

    // Validate required fields
    if (!walletAddress || !feeTransactionHash || !feePaid) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if wallet already claimed
    const { data: existingClaim } = await supabaseClient
      .from('airdrop_claims')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (existingClaim) {
      return new Response(
        JSON.stringify({ error: 'Wallet has already claimed airdrop', claim: existingClaim }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate fee amount (should be 0.01 SOL)
    const expectedFee = 0.01
    if (Math.abs(feePaid - expectedFee) > 0.001) {
      return new Response(
        JSON.stringify({ error: `Invalid fee amount. Expected ${expectedFee} SOL` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create initial claim record
    const { data: newClaim, error: insertError } = await supabaseClient
      .from('airdrop_claims')
      .insert({
        wallet_address: walletAddress,
        fee_paid: feePaid,
        fee_transaction_hash: feeTransactionHash,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating claim:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create claim record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Simulate treasury transaction (in production, this would be actual Solana transaction)
    const mockTokenTxHash = `token_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Background task to process the token transfer
    EdgeRuntime.waitUntil(processTokenTransfer(supabaseClient, newClaim.id, walletAddress, mockTokenTxHash))

    return new Response(
      JSON.stringify({ 
        success: true, 
        claim: newClaim,
        message: 'Claim is being processed. Tokens will be sent shortly.' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing airdrop:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processTokenTransfer(supabaseClient: any, claimId: string, walletAddress: string, tokenTxHash: string) {
  try {
    console.log('Processing token transfer for claim:', claimId)
    
    // Simulate network delay for token transfer
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // In production, this would:
    // 1. Create and sign Solana transaction from treasury wallet
    // 2. Send 50,000 CHIMPZY tokens to walletAddress
    // 3. Get real transaction hash
    
    // Update claim as completed
    const { error: updateError } = await supabaseClient
      .from('airdrop_claims')
      .update({
        status: 'completed',
        token_transaction_hash: tokenTxHash,
        completed_at: new Date().toISOString()
      })
      .eq('id', claimId)

    if (updateError) {
      console.error('Error updating claim:', updateError)
      // Mark as failed
      await supabaseClient
        .from('airdrop_claims')
        .update({
          status: 'failed',
          error_message: `Failed to update claim: ${updateError.message}`
        })
        .eq('id', claimId)
    } else {
      console.log('Successfully completed token transfer for claim:', claimId)
    }

  } catch (error) {
    console.error('Error in token transfer:', error)
    
    // Mark claim as failed
    await supabaseClient
      .from('airdrop_claims')
      .update({
        status: 'failed',
        error_message: `Token transfer failed: ${error.message}`
      })
      .eq('id', claimId)
  }
}
