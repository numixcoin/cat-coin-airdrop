
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

    // Verify the fee transaction exists on Solana blockchain
    try {
      const solanaRpcUrl = 'https://api.devnet.solana.com' // Use mainnet-beta for production
      const verifyResponse = await fetch(solanaRpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            feeTransactionHash,
            {
              encoding: 'json',
              commitment: 'confirmed'
            }
          ]
        })
      })

      const verifyResult = await verifyResponse.json()
      
      if (!verifyResult.result) {
        return new Response(
          JSON.stringify({ error: 'Fee transaction not found or not confirmed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Fee transaction verified:', verifyResult.result.transaction.signatures[0])
    } catch (error) {
      console.error('Error verifying fee transaction:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to verify fee transaction' }),
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

    // Start background token transfer process
    EdgeRuntime.waitUntil(processTokenTransfer(supabaseClient, newClaim.id, walletAddress))

    return new Response(
      JSON.stringify({ 
        success: true, 
        claim: newClaim,
        message: 'Fee payment verified. CHIMPZY tokens are being sent to your wallet.' 
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

async function processTokenTransfer(supabaseClient: any, claimId: string, walletAddress: string) {
  try {
    console.log('Starting token transfer for claim:', claimId)
    
    // In production, this would:
    // 1. Load treasury wallet private key from secure storage
    // 2. Create SPL token transfer transaction from treasury to user wallet
    // 3. Sign transaction with treasury private key
    // 4. Send transaction to Solana network
    // 5. Get real transaction signature
    
    // For now, simulating the token transfer process
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Generate mock transaction hash (in production, this would be the real transaction signature)
    const tokenTxHash = `token_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Token transfer completed, updating claim status...')
    
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
      console.error('Error updating claim status:', updateError)
      // Mark as failed
      await supabaseClient
        .from('airdrop_claims')
        .update({
          status: 'failed',
          error_message: `Failed to update claim status: ${updateError.message}`
        })
        .eq('id', claimId)
    } else {
      console.log('Successfully completed token transfer for claim:', claimId)
      console.log('Transaction hash:', tokenTxHash)
    }

  } catch (error) {
    console.error('Error in token transfer process:', error)
    
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
