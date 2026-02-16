import { NextResponse } from 'next/server';

const RPC = 'https://rpc.testnet.arc.network';
const USDC = '0x3600000000000000000000000000000000000000';

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Timed out after ' + ms + 'ms')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
  });
}

async function rpcCall(method, params) {
  const res = await withTimeout(
    fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    }),
    12000
  );
  if (!res.ok) throw new Error('RPC HTTP ' + res.status);
  const data = await res.json();
  if (data.error) throw new Error('RPC: ' + (data.error.message || JSON.stringify(data.error)));
  return data.result;
}

async function getTxCount(addr) {
  const hex = await rpcCall('eth_getTransactionCount', [addr, 'latest']);
  return parseInt(hex, 16) || 0;
}

async function getUsdc(addr) {
  try {
    const padded = addr.replace('0x', '').toLowerCase().padStart(64, '0');
    const data = '0x70a08231' + padded;
    const result = await rpcCall('eth_call', [{ to: USDC, data }, 'latest']);
    if (!result || result === '0x') return 0;
    return parseInt(result, 16) / 1e6;
  } catch {
    return 0;
  }
}

async function getRecentTxs(addr) {
  try {
    const url = `https://testnet.arcscan.app/api?module=account&action=txlist&address=${addr}&sort=desc&page=1&offset=5`;
    const res = await withTimeout(fetch(url), 8000);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.result)) return [];
    return data.result.slice(0, 5).map(tx => ({
      hash: tx.hash,
      timeStamp: tx.timeStamp,
      isError: tx.isError,
    }));
  } catch {
    return [];
  }
}

function buildPrompt(addr, txc, usdc) {
  const angles = [];

  if (txc === 0) {
    angles.push('Zero transactions ever. Born, saw the blockchain, immediately gave up. A wallet-shaped void.');
  } else if (txc <= 3) {
    angles.push(`${txc} transaction(s) total lifetime. The blockchain equivalent of a snail doing one push-up.`);
  } else if (txc <= 20) {
    angles.push(`${txc} transactions — tourist behavior. One visit, one selfie, back home to tell nobody.`);
  } else if (txc > 5000) {
    angles.push(`${txc.toLocaleString()} transactions. This wallet IS the chain. It has transcended human existence.`);
  } else if (txc > 1000) {
    angles.push(`${txc.toLocaleString()} transactions on FAKE testnet money. Grinding with the intensity of a prop trading desk. For free tokens.`);
  } else if (txc > 200) {
    angles.push(`${txc} transactions on a network where currency is free. Overachieving in meaninglessness.`);
  }

  if (usdc === 0 && txc > 0) {
    angles.push(`${txc} txs sent, $0.00 left. Where did it all go? The void has claimed it.`);
  } else if (usdc === 0) {
    angles.push('$0.00 USDC on a testnet where USDC is FREE. Couldn\'t collect free money. Historic laziness.');
  } else if (usdc < 1) {
    angles.push(`$${usdc.toFixed(4)} USDC. That's not a balance, that's quantum foam.`);
  } else if (usdc > 500000) {
    angles.push(`$${usdc.toLocaleString()} in fake USDC. Hoarding monopoly money like it's real.`);
  }

  return `You are a savage crypto roast comedian. Roast this Arc Testnet wallet brutally and hilariously.

LIVE ON-CHAIN DATA:
- Address: ${addr}
- Transactions sent: ${txc.toLocaleString()}
- USDC balance: $${usdc.toFixed(2)}
- Network: Arc Testnet (Chain 5042002) — ALL TOKENS ARE FAKE AND FREE

ROAST ANGLES:
${angles.map((a, i) => `${i + 1}. ${a}`).join('\n')}

RULES:
- Write exactly 3 paragraphs of savage roast
- Reference exact numbers: ${txc.toLocaleString()} txs, $${usdc.toFixed(2)} USDC  
- Use web3 slang: ser, fren, ngmi, wagmi, degen, wen moon, probably nothing, have fun staying poor
- Mock the TESTNET angle hard — fake money, zero stakes, still failing somehow
- End with: VERDICT: [one brutal line in ALL CAPS]
- Plain text only, zero asterisks, zero markdown`;
}

// This is the App Router way — named export for each HTTP method
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const address = (body.address || '').trim();
  if (!/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  try {
    // All of this runs server-side on Vercel — zero CORS
    let txCount;
    try {
      txCount = await getTxCount(address);
    } catch (e) {
      return NextResponse.json({ error: 'Cannot reach Arc RPC: ' + e.message }, { status: 502 });
    }

    const [usdc, recentTxs] = await Promise.all([
      getUsdc(address),
      getRecentTxs(address),
    ]);

    const prompt = buildPrompt(address, txCount, usdc);

    const claudeRes = await withTimeout(
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      }),
      30000
    );

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      return NextResponse.json({ error: 'Claude error ' + claudeRes.status + ': ' + err.slice(0, 200) }, { status: 502 });
    }

    const claudeData = await claudeRes.json();
    const roast = claudeData.content?.[0]?.text;
    if (!roast) return NextResponse.json({ error: 'Empty roast from Claude' }, { status: 502 });

    return NextResponse.json({ address, txCount, usdcBalance: usdc, recentTxs, roast });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Unexpected error' }, { status: 500 });
  }
}
