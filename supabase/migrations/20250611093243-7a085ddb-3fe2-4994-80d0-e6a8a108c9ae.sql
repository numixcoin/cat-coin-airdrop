
-- Create table to track airdrop claims
CREATE TABLE public.airdrop_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  claim_amount NUMERIC NOT NULL DEFAULT 50000,
  fee_paid NUMERIC NOT NULL,
  fee_transaction_hash TEXT NOT NULL,
  token_transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.airdrop_claims ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (users can check claim status)
CREATE POLICY "Anyone can view claim status" 
  ON public.airdrop_claims 
  FOR SELECT 
  USING (true);

-- Create policy for inserting new claims
CREATE POLICY "Anyone can create claims" 
  ON public.airdrop_claims 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for backend service to update claims (using service role)
CREATE POLICY "Service can update claims" 
  ON public.airdrop_claims 
  FOR UPDATE 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_airdrop_claims_wallet ON public.airdrop_claims(wallet_address);
CREATE INDEX idx_airdrop_claims_status ON public.airdrop_claims(status);
