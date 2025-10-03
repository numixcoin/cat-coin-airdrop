// Web Worker for generating Solana addresses with custom patterns
importScripts('https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js');

const { Keypair } = solanaWeb3;

// Function to generate a single keypair and check pattern match
function generateKeypairWithPattern(pattern, patternType, matchCase) {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  
  let hasMatch = false;
  
  if (patternType === 'random') {
    hasMatch = true; // Random generation always matches
  } else if (patternType === 'prefix') {
    if (matchCase) {
      hasMatch = publicKey.startsWith(pattern);
    } else {
      hasMatch = publicKey.toLowerCase().startsWith(pattern.toLowerCase());
    }
  } else if (patternType === 'suffix') {
    if (matchCase) {
      hasMatch = publicKey.endsWith(pattern);
    } else {
      hasMatch = publicKey.toLowerCase().endsWith(pattern.toLowerCase());
    }
  }
  
  return {
    publicKey,
    privateKey: Array.from(keypair.secretKey),
    hasMatch
  };
}

// Optimized batch generation function
function generateBatch(pattern, patternType, matchCase, batchSize) {
  const results = [];
  for (let i = 0; i < batchSize; i++) {
    const result = generateKeypairWithPattern(pattern, patternType, matchCase);
    results.push(result);
    if (result.hasMatch) {
      return { found: true, result, totalGenerated: i + 1 };
    }
  }
  return { found: false, totalGenerated: batchSize };
}

// Main worker message handler
self.onmessage = function(e) {
  const { type, pattern, patternType, matchCase, maxAttempts } = e.data;
  
  if (type === 'generate') {
    let attempts = 0;
    const startTime = Date.now();
    let lastProgressUpdate = startTime;
    
    // Dynamic batch sizing based on pattern complexity
    let batchSize;
    if (patternType === 'random') {
      batchSize = 1; // Random only needs 1 attempt
    } else {
      const patternLength = pattern.length;
      if (patternLength <= 2) {
        batchSize = 1000; // Small patterns - larger batches
      } else if (patternLength <= 3) {
        batchSize = 500;  // Medium patterns
      } else {
        batchSize = 100;  // Long patterns - smaller batches
      }
    }
    
    // Send initial status
    self.postMessage({
      type: 'progress',
      attempts: 0,
      timeElapsed: 0,
      rate: 0
    });
    
    const generateLoop = () => {
      const currentTime = Date.now();
      const timeElapsed = (currentTime - startTime) / 1000;
      
      // Generate batch
      const batchResult = generateBatch(pattern, patternType, matchCase, Math.min(batchSize, maxAttempts - attempts));
      attempts += batchResult.totalGenerated;
      
      if (batchResult.found) {
        // Success - found matching address
        self.postMessage({
          type: 'success',
          publicKey: batchResult.result.publicKey,
          privateKey: batchResult.result.privateKey,
          attempts,
          timeElapsed,
          rate: attempts / timeElapsed,
          pattern,
          patternType,
          matchCase
        });
        return;
      }
      
      // Send progress update (throttled to every 500ms for better performance)
      if (currentTime - lastProgressUpdate >= 500) {
        const currentRate = timeElapsed > 0 ? attempts / timeElapsed : 0;
        self.postMessage({
          type: 'progress',
          attempts,
          timeElapsed,
          rate: currentRate
        });
        lastProgressUpdate = currentTime;
      }
      
      // Check if max attempts reached
      if (attempts >= maxAttempts) {
        self.postMessage({
          type: 'failure',
          attempts,
          timeElapsed: (Date.now() - startTime) / 1000,
          message: `Maximum attempts (${maxAttempts.toLocaleString()}) reached without finding matching address`,
          pattern,
          patternType
        });
        return;
      }
      
      // Continue generation with optimized scheduling
      if (timeElapsed < 1) {
        // First second - run immediately for quick patterns
        generateLoop();
      } else {
        // After 1 second - use setTimeout to prevent blocking
        setTimeout(generateLoop, 1);
      }
    };
    
    generateLoop();
  }
};