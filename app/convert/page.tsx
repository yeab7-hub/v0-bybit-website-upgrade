'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const COINS = ['USDT', 'BTC', 'ETH', 'SOL', 'XRP'];

const MOCK_RATES: Record<string, number> = {
  USDT: 1,
  BTC: 65000,
  ETH: 3500,
  SOL: 150,
  XRP: 0.60,
};

export default function ConvertPage() {
  const [fromCoin, setFromCoin] = useState('USDT');
  const [toCoin, setToCoin] = useState('BTC');
  const [fromAmount, setFromAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchBalances() {
      try {
        const res = await fetch('/api/trading/balances');
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, number> = {};
          data.balances?.forEach((b: any) => {
            map[b.coin] = b.balance;
          });
          setBalances(map);
        }
      } catch (e) {
        console.error('Failed to load balances');
      }
    }
    fetchBalances();
  }, []);

  const calculateReceiveAmount = () => {
    const amt = parseFloat(fromAmount) || 0;
    if (amt === 0) return '0.00';
    const fromRate = MOCK_RATES[fromCoin] || 1;
    const toRate = MOCK_RATES[toCoin] || 1;
    const result = (amt * fromRate) / toRate;
    return result.toFixed(6);
  };

  const handleSwapCoins = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
    setFromAmount('');
  };

  const handleConvert = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount to convert.');
      return;
    }

    const toAmountNum = parseFloat(calculateReceiveAmount());

    setLoading(true);
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCoin,
          toCoin,
          fromAmount: parseFloat(fromAmount),
          toAmount: toAmountNum,
          rate: MOCK_RATES[fromCoin] / MOCK_RATES[toCoin],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Conversion failed');

      toast.success('Successfully converted assets!');
      setFromAmount('');
      if (data.newBalances) {
        setBalances((prev) => ({ ...prev, ...data.newBalances }));
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto py-6 px-3 sm:px-4 w-full">
      <Card className="border-border bg-card shadow-xl w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold">Convert Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* From Section */}
          <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-background border border-border">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>You Pay</span>
              <span className="truncate max-w-[150px] sm:max-w-none">Balance: {balances[fromCoin] ?? '0.00'} {fromCoin}</span>
            </div>
            <div className="flex gap-2 sm:gap-4 items-center">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-xl sm:text-2xl font-semibold border-none bg-transparent focus-visible:ring-0 p-0 shadow-none w-full"
              />
              <Select value={fromCoin} onValueChange={setFromCoin}>
                <SelectTrigger className="w-[100px] sm:w-[110px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COINS.map((c) => (
                    <SelectItem key={c} value={c} disabled={c === toCoin}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 sm:-my-3 relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapCoins}
              className="rounded-full shadow-md bg-background hover:bg-muted h-10 w-10"
            >
              <DownUpIcon />
            </Button>
          </div>

          {/* To Section */}
          <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-background border border-border">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>You Receive (Estimated)</span>
              <span className="truncate max-w-[150px] sm:max-w-none">Balance: {balances[toCoin] ?? '0.00'} {toCoin}</span>
            </div>
            <div className="flex gap-2 sm:gap-4 items-center">
              <div className="text-xl sm:text-2xl font-semibold text-primary w-full overflow-hidden text-ellipsis">
                {calculateReceiveAmount()}
              </div>
              <Select value={toCoin} onValueChange={setToCoin}>
                <SelectTrigger className="w-[100px] sm:w-[110px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COINS.map((c) => (
                    <SelectItem key={c} value={c} disabled={c === fromCoin}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full py-5 sm:py-6 text-base sm:text-lg font-medium" 
            onClick={handleConvert}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
            {loading ? 'Converting...' : 'Convert Now'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DownUpIcon() {
  return <ArrowDownUp className="h-4 w-4" />;
}
