import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';

/**
 * Generate Solana address with CAT prefix
 * Uses brute force method to find address starting with "CAT"
 */
class CatAddressGenerator {
    constructor() {
        this.attempts = 0;
        this.startTime = Date.now();
    }

    /**
     * Generate a single keypair and check if address starts with prefix
     */
    generateKeypair(prefix = 'CAT') {
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        
        this.attempts++;
        
        // Log progress every 10000 attempts
        if (this.attempts % 10000 === 0) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const rate = this.attempts / elapsed;
            console.log(`🔍 Attempts: ${this.attempts.toLocaleString()} | Rate: ${rate.toFixed(0)}/sec | Elapsed: ${elapsed.toFixed(1)}s`);
        }
        
        return {
            keypair,
            publicKey,
            privateKey: bs58.encode(keypair.secretKey),
            matches: publicKey.startsWith(prefix)
        };
    }

    /**
     * Keep generating until we find an address with the desired prefix
     */
    async findAddressWithPrefix(prefix = 'CAT', maxAttempts = 1000000) {
        console.log(`🐱 Starting CAT address generation...`);
        console.log(`🎯 Target prefix: "${prefix}"`);
        console.log(`📊 Max attempts: ${maxAttempts.toLocaleString()}`);
        console.log(`⏰ Started at: ${new Date().toLocaleTimeString()}`);
        console.log('═'.repeat(60));

        while (this.attempts < maxAttempts) {
            const result = this.generateKeypair(prefix);
            
            if (result.matches) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                const rate = this.attempts / elapsed;
                
                console.log('\n🎉 SUCCESS! Found CAT address!');
                console.log('═'.repeat(60));
                console.log(`🔑 Public Key:  ${result.publicKey}`);
                console.log(`🔐 Private Key: ${result.privateKey}`);
                console.log('═'.repeat(60));
                console.log(`📈 Statistics:`);
                console.log(`   • Total attempts: ${this.attempts.toLocaleString()}`);
                console.log(`   • Time elapsed: ${elapsed.toFixed(2)} seconds`);
                console.log(`   • Generation rate: ${rate.toFixed(0)} addresses/sec`);
                console.log(`   • Probability: ~1 in ${Math.pow(58, prefix.length).toLocaleString()}`);
                console.log('═'.repeat(60));
                
                return {
                    success: true,
                    publicKey: result.publicKey,
                    privateKey: result.privateKey,
                    attempts: this.attempts,
                    timeElapsed: elapsed,
                    generationRate: rate
                };
            }
        }

        console.log(`\n❌ Max attempts (${maxAttempts.toLocaleString()}) reached without finding prefix "${prefix}"`);
        return {
            success: false,
            attempts: this.attempts,
            timeElapsed: (Date.now() - this.startTime) / 1000
        };
    }

    /**
     * Generate multiple addresses with CAT prefix
     */
    async generateMultiple(count = 1, prefix = 'CAT') {
        const results = [];
        
        console.log(`🎯 Generating ${count} address(es) with prefix "${prefix}"`);
        
        for (let i = 0; i < count; i++) {
            console.log(`\n🔄 Generating address ${i + 1}/${count}...`);
            
            // Reset for each generation
            this.attempts = 0;
            this.startTime = Date.now();
            
            const result = await this.findAddressWithPrefix(prefix);
            
            if (result.success) {
                results.push(result);
                console.log(`✅ Address ${i + 1} generated successfully!`);
            } else {
                console.log(`❌ Failed to generate address ${i + 1}`);
                break;
            }
        }
        
        return results;
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🐱 CAT COIN Address Generator');
    console.log('═'.repeat(60));
    
    const generator = new CatAddressGenerator();
    
    // Generate single CAT address
    const result = await generator.findAddressWithPrefix('CAT', 500000);
    
    if (result.success) {
        console.log('\n💾 Save this information securely!');
        console.log('⚠️  NEVER share your private key with anyone!');
        console.log('⚠️  Store it in a secure location!');
        
        // Save to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `cat-address-${timestamp}.json`;
        
        const addressData = {
            publicKey: result.publicKey,
            privateKey: result.privateKey,
            generatedAt: new Date().toISOString(),
            attempts: result.attempts,
            timeElapsed: result.timeElapsed,
            generationRate: result.generationRate
        };
        
        fs.writeFileSync(filename, JSON.stringify(addressData, null, 2));
        console.log(`\n💾 Address saved to: ${filename}`);
    }
}

// Export for use as module
export { CatAddressGenerator };

// Run if called directly
main().catch(console.error);