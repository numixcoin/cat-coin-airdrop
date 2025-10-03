import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Download, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Hash, Settings, CreditCard, Info, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationStats {
  attempts: number;
  timeElapsed: number;
  rate: number;
}

interface GeneratedAddress {
  publicKey: string;
  privateKey: number[];
}

const AddressGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState<GeneratedAddress | null>(null);
  const [stats, setStats] = useState<GenerationStats>({ attempts: 0, timeElapsed: 0, rate: 0 });
  const [pattern, setPattern] = useState('CAT');
  const [patternType, setPatternType] = useState<'prefix' | 'suffix' | 'random'>('suffix');
  const [matchCase, setMatchCase] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const workerRef = useRef<Worker | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const maxAttempts = 1000000; // 1 million attempts max

  // Initialize Web Worker for address generation
  useEffect(() => {
    // Create Web Worker from external file
    workerRef.current = new Worker('/address-generator-worker.js');

    workerRef.current.onmessage = (e) => {
      const { type } = e.data;
      
      if (type === 'success') {
        const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
        const generationRate = e.data.attempts / timeElapsed;
        
        setGeneratedAddress({
          publicKey: e.data.publicKey,
          privateKey: e.data.privateKey
        });
        
        setIsGenerating(false);
        setStats({
          attempts: e.data.attempts,
          timeElapsed,
          rate: generationRate
        });
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        toast.success(`Address generated successfully! Found in ${e.data.attempts.toLocaleString()} attempts.`);
      } else if (type === 'progress') {
        const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
        const rate = timeElapsed > 0 ? e.data.attempts / timeElapsed : 0;
        
        setStats({
          attempts: e.data.attempts,
          timeElapsed,
          rate
        });
      } else if (type === 'failure') {
        setIsGenerating(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        toast.error(`Generation failed after ${e.data.attempts.toLocaleString()} attempts. Try a shorter pattern.`);
      } else if (type === 'error') {
        setIsGenerating(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        toast.error(e.data.message || 'Generation failed');
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate estimated time based on pattern complexity and current rate
  const calculateEstimatedTime = (pattern: string, patternType: string, currentRate: number) => {
    if (patternType === 'random') return 0; // Random is instant
    
    const patternLength = pattern.length;
    const base58Chars = 58;
    
    // Estimate probability based on pattern type and length
    let estimatedAttempts;
    if (patternType === 'prefix') {
      estimatedAttempts = Math.pow(base58Chars, patternLength);
    } else if (patternType === 'suffix') {
      estimatedAttempts = Math.pow(base58Chars, patternLength);
    } else {
      estimatedAttempts = 1;
    }
    
    // Adjust for case sensitivity (roughly doubles the search space)
    if (!matchCase) {
      estimatedAttempts = estimatedAttempts * 0.6; // Mixed case is easier
    }
    
    // Use current rate if available, otherwise use estimated rate
    const rate = currentRate > 0 ? currentRate : getEstimatedRate(patternLength);
    
    return estimatedAttempts / rate;
  };
  
  // Get estimated generation rate based on pattern complexity
  const getEstimatedRate = (patternLength: number) => {
    // These are rough estimates based on typical performance
    if (patternLength <= 1) return 5000;  // ~5k attempts/sec
    if (patternLength <= 2) return 3000;  // ~3k attempts/sec
    if (patternLength <= 3) return 2000;  // ~2k attempts/sec
    return 1000; // ~1k attempts/sec for longer patterns
  };
  
  // Format time duration for display
  const formatDuration = (seconds: number) => {
    if (seconds < 1) return 'Less than 1 second';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    return `${Math.round(seconds / 86400)} days`;
  };

  const generateAddress = () => {
    if (!workerRef.current || isGenerating) return;
    
    // Validation
    if (patternType !== 'random') {
      if (!pattern.trim()) {
        toast.error('Please enter a pattern');
        return;
      }
      if (pattern.length > 10) {
        toast.error('Pattern too long (max 10 characters)');
        return;
      }
    }
    
    setIsGenerating(true);
    setGeneratedAddress(null);
    setStats({ attempts: 0, timeElapsed: 0, rate: 0 });
    startTimeRef.current = Date.now();
    
    // Send generation parameters to worker
    workerRef.current.postMessage({
      type: 'generate',
      pattern: patternType === 'random' ? '' : pattern,
      patternType,
      matchCase,
      maxAttempts
    });
  };

  const stopGeneration = () => {
    if (!workerRef.current || !isGenerating) return;
    
    workerRef.current.postMessage({ action: 'stop' });
    setIsGenerating(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    toast.info('Generation stopped');
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
      toast.success(`${type === 'public' ? 'Public key' : 'Private key'} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadAddress = () => {
    if (!generatedAddress) return;
    
    const addressData = {
      publicKey: generatedAddress.publicKey,
      privateKey: generatedAddress.privateKey,
      generatedAt: new Date().toISOString(),
      attempts: stats.attempts,
      timeElapsed: stats.timeElapsed,
      generationRate: stats.rate,
      pattern: patternType === 'random' ? 'random' : pattern,
      patternType,
      matchCase: patternType !== 'random' ? matchCase : false
    };
    
    const blob = new Blob([JSON.stringify(addressData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patternType}-${patternType === 'random' ? 'random' : pattern}-address-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Address file downloaded');
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-400 flex items-center justify-center gap-3">
              <Hash className="w-8 h-8" />
              Custom Address Generator
            </CardTitle>
            <p className="text-green-300/70 mt-2">
              Generate custom Solana wallet addresses with your desired prefix/suffix or completely random addresses
            </p>
          </CardHeader>
        </Card>

        {/* Generator Configuration */}
        <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-green-400 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Generator Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Generation Type */}
            <div className="space-y-2">
              <Label className="text-green-300">Generation Type</Label>
              <Select value={patternType} onValueChange={(value: 'prefix' | 'suffix' | 'random') => setPatternType(value)}>
                <SelectTrigger className="bg-black/20 border-green-500/30 text-green-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/30">
                  <SelectItem value="prefix" className="text-green-300">Prefix (starts with pattern)</SelectItem>
                  <SelectItem value="suffix" className="text-green-300">Suffix (ends with pattern)</SelectItem>
                  <SelectItem value="random" className="text-green-300">Random Address</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pattern Input */}
            {patternType !== 'random' && (
              <div className="space-y-2">
                <Label className="text-green-300">Custom Pattern</Label>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter your desired pattern (e.g., CAT, cat, MoOn)"
                  maxLength={10}
                  className="bg-black/20 border-green-500/30 text-green-300 placeholder-green-500/50"
                />
                <p className="text-xs text-yellow-400/70">
                  ⚠️ Longer patterns exponentially increase generation time (max 10 characters)
                </p>
              </div>
            )}

            {/* Match Casing */}
            {patternType !== 'random' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="matchCase"
                  checked={matchCase}
                  onCheckedChange={(checked) => setMatchCase(checked === true)}
                  className="border-green-500/30"
                />
                <Label htmlFor="matchCase" className="text-green-300 text-sm">
                  Match casing (case-sensitive)
                </Label>
                <div className="ml-2">
                  <p className="text-xs text-red-400/70">
                    ⚠️ Match casing may exponentially increase address generation time
                  </p>
                </div>
              </div>
            )}

            {/* Premium Feature Notice */}
            <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-400">Premium Feature</h3>
                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">SOON</span>
              </div>
              <p className="text-purple-300/70 text-sm">
                Pay with CAT tokens for faster generation and priority processing. Coming soon!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Generator Controls */}
        <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-green-400 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Generator Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Difficulty Estimate */}
            {patternType !== 'random' && pattern && (
              <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <div className="space-y-2">
                  <p className="text-yellow-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <strong>Estimated Difficulty:</strong> ~1 in {Math.pow(58, pattern.length).toLocaleString()} attempts
                    {matchCase && " (case-sensitive increases difficulty)"}
                  </p>
                  <p className="text-yellow-300 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <strong>Estimated Time:</strong> {formatDuration(calculateEstimatedTime(pattern, patternType, stats.rate))}
                    {stats.rate > 0 && " (based on current rate)"}
                  </p>
                  {stats.rate > 0 && (patternType === 'prefix' || patternType === 'suffix') && pattern && (
                    <p className="text-yellow-300 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <strong>Est. Remaining:</strong> {formatDuration(calculateEstimatedTime(pattern, patternType, stats.rate) - stats.timeElapsed)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex gap-4">
              <Button
                onClick={generateAddress}
                disabled={isGenerating || (patternType !== 'random' && !pattern.trim())}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate {patternType === 'random' ? 'Random' : patternType.charAt(0).toUpperCase() + patternType.slice(1)} Address
                  </>
                )}
              </Button>
              
              {isGenerating && (
                <Button
                  onClick={stopGeneration}
                  variant="destructive"
                  className="px-6"
                >
                  Stop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Statistics */}
        {isGenerating && (
          <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-green-400">Real-time Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {stats.attempts.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-300/70">Attempts</div>
                </div>
                <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {stats.timeElapsed.toFixed(1)}s
                  </div>
                  <div className="text-sm text-blue-300/70">Time Elapsed</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(stats.rate).toLocaleString()}/s
                  </div>
                  <div className="text-sm text-purple-300/70">Generation Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Address Display */}
        {generatedAddress && (
          <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-green-400 flex items-center gap-2">
                🎉 Success! Address Generated
                <div className="text-sm bg-green-600 text-white px-2 py-1 rounded">
                  {patternType === 'random' ? 'Random' : `${patternType.toUpperCase()}: ${pattern}`}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Public Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-300">Public Address:</label>
                <div className="flex items-center gap-2 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <code className="flex-1 text-green-400 font-mono text-sm break-all">
                    {generatedAddress.publicKey}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(generatedAddress.publicKey, 'public')}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {copySuccess === 'public' && (
                    <span className="text-xs text-green-400">Copied!</span>
                  )}
                </div>
              </div>

              {/* Private Key */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-300">Private Key:</label>
                <div className="flex items-center gap-2 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                  <code className="flex-1 text-red-400 font-mono text-sm break-all">
                    {Array.isArray(generatedAddress.privateKey) ? 
                      `[${generatedAddress.privateKey.join(',')}]` : 
                      generatedAddress.privateKey}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(
                      Array.isArray(generatedAddress.privateKey) ? 
                        `[${generatedAddress.privateKey.join(',')}]` : 
                        generatedAddress.privateKey, 
                      'private'
                    )}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {copySuccess === 'private' && (
                    <span className="text-xs text-red-400">Copied!</span>
                  )}
                </div>
                <p className="text-xs text-red-400/70">
                  ⚠️ Keep this private key secure! Never share it with anyone.
                </p>
              </div>

              {/* Download Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={downloadAddress}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Address File
                </Button>
              </div>

              {/* Generation Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-green-500/30">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {stats.attempts.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-300/70">Total Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {stats.timeElapsed.toFixed(2)}s
                  </div>
                  <div className="text-xs text-green-300/70">Time Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {Math.round(stats.rate).toLocaleString()}/s
                  </div>
                  <div className="text-xs text-green-300/70">Generation Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {patternType === 'random' ? 'N/A' : `1:${Math.pow(58, pattern.length).toLocaleString()}`}
                  </div>
                  <div className="text-xs text-green-300/70">Probability</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-3 text-sm text-green-300/70">
              <h3 className="text-lg font-semibold text-green-400 mb-3">
                📋 How it works:
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Choose your desired pattern: prefix (starts with), suffix (ends with), or random</li>
                <li>Enter your custom text (up to 10 characters) for prefix or suffix generation</li>
                <li>Toggle case-sensitive matching if you want exact letter case matching</li>
                <li>Click "Generate Address" and wait for your custom Solana address</li>
                <li>Copy your new address and private key when generation completes</li>
                <li>Download the address data as JSON file for backup</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <p className="text-blue-400 text-sm">
                  <strong>💡 Pro Tips:</strong> Shorter patterns generate faster. Longer patterns may take several minutes. 
                  The tool generates real Solana addresses that you can use immediately!
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <p className="text-yellow-400 text-sm">
                  <strong>⚠️ Security Notice:</strong> Keep your private key safe and never share it with anyone. 
                  This private key gives full access to your wallet and any funds stored in it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddressGenerator;