import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fromCoin, toCoin, fromAmount, toAmount, rate } = await request.json();

    if (!fromCoin || !toCoin || !fromAmount || !toAmount) {
      return NextResponse.json({ error: 'Missing required conversion parameters' }, { status: 400 });
    }

    // 1. Fetch user's current balances
    const { data: balances, error: balanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', user.id);

    if (balanceError) {
      return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
    }

    const fromBalance = balances?.find((b) => b.coin === fromCoin)?.balance || 0;

    if (fromBalance < fromAmount) {
      return NextResponse.json({ error: `Insufficient ${fromCoin} balance` }, { status: 400 });
    }

    // 2. Perform balance deduction and addition (Transaction logic)
    // Deduct fromCoin
    const newFromBalance = fromBalance - fromAmount;
    await supabase
      .from('user_balances')
      .upsert({ user_id: user.id, coin: fromCoin, balance: newFromBalance }, { onConflict: 'user_id,coin' });

    // Add toCoin
    const existingToBalance = balances?.find((b) => b.coin === toCoin)?.balance || 0;
    const newToBalance = existingToBalance + toAmount;
    await supabase
      .from('user_balances')
      .upsert({ user_id: user.id, coin: toCoin, balance: newToBalance }, { onConflict: 'user_id,coin' });

    // 3. Record the transaction history
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'CONVERT',
      details: `Converted ${fromAmount} ${fromCoin} to ${toAmount} ${toCoin} at rate ${rate}`,
      amount: fromAmount,
      currency: fromCoin,
      status: 'COMPLETED',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Conversion successful',
      newBalances: {
        [fromCoin]: newFromBalance,
        [toCoin]: newToBalance
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
