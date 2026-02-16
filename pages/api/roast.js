// pages/api/roast.js
// ONE endpoint does everything: fetches chain data + generates roast
// Runs 100% server-side on Vercel → zero CORS issues

const RPC = 'https://rpc.testnet.arc.network';
const USDC = '0x3600000000000000000000000000000000000000';

// ─── bare fetch with manual timeout (no AbortSignal.timeout) ────
function timedFetch(url, opts, ms) {
  ms = ms || 12000;
  return new Promise(function(resolve, reject) {
    var done = false;
    var t = setTimeout(function() {
      if (done) return;
      done = true;
      reject(new Error('Timeout after ' + ms + 'ms: ' + url));
    }, ms);
    fetch(url, opts || {}).then(function(r) {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(r);
    }).catch(function(e) {
      if (done) return;
      done = true;
      clearTimeout(t);
      reject(e);
    });
  });
}

// ─── JSON-RPC call ───────────────────────────────────────────────
async function rpc(method, params) {
  var r = await timedFetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params })
  });
  if (!r.ok) throw new Error('RPC HTTP ' + r.status);
  var d = await r.json();
  if (d.error) throw new Error('RPC: ' + (d.error.message || JSON.stringify(d.error)));
  return d.result;
}

// ─── get USDC balance ────────────────────────────────────────────
async function getUsdc(addr) {
  try {
    var padded = addr.replace('0x', '').toLowerCase().padStart(64, '0');
    var data = '0x70a08231' + padded;
    var result = await rpc('eth_call', [{ to: USDC, data: data }, 'latest']);
    if (!result || result === '0x') return 0;
    return parseInt(result, 16) / 1e6;
  } catch (e) {
    console.log('USDC err:', e.message);
    return 0;
  }
}

// ─── get tx count (nonce) ────────────────────────────────────────
async function getTxCount(addr) {
  var result = await rpc('eth_getTransactionCount', [addr, 'latest']);
  return parseInt(result, 16) || 0;
}

// ─── get recent txs from Blockscout (server-side = no CORS) ─────
async function getRecentTxs(addr) {
  try {
    var url = 'https://testnet.arcscan.app/api?module=account&action=txlist&address=' + addr + '&sort=desc&page=1&offset=5';
    var r = await timedFetch(url, {}, 10000);
    if (!r.ok) return [];
    var d = await r.json();
    if (!Array.isArray(d.result)) return [];
    return d.result.slice(0, 5).map(function(tx) {
      return {
        hash: tx.hash,
        timeStamp: tx.timeStamp,
        isError: tx.isError
      };
    });
  } catch (e) {
    console.log('Blockscout err:', e.message);
    return [];
  }
}

// ─── build roast prompt ──────────────────────────────────────────
function buildPrompt(addr, txc, usdc) {
  var angles = [];

  if (txc === 0) {
    angles.push('Zero transactions ever. Born, looked around, gave up immediately. A digital corpse.');
  } else if (txc <= 3) {
    angles.push('Only ' + txc + ' transaction(s). The blockchain equivalent of a snail on sedatives. Technically alive, practically useless.');
  } else if (txc <= 20) {
    angles.push(txc + ' transactions — tourist behavior. Visited once, took a selfie, went home. Participation trophy energy.');
  } else if (txc > 5000) {
    angles.push(txc.toLocaleString() + ' transactions. No human does this. This wallet IS the chain. It has transcended personhood and become pure transaction throughput.');
  } else if (txc > 1000) {
    angles.push(txc.toLocaleString() + ' transactions on FAKE money. Grinding testnet tokens with the intensity of a prop trading desk. Please seek help.');
  } else if (txc > 200) {
    angles.push(txc + ' transactions where every token is free. Overachieving on a network where the currency costs nothing. This wallet has no chill.');
  }

  if (usdc === 0 && txc > 0) {
    angles.push(txc + ' transactions, $0.00 left. Where did it all go? Performance art in financial self-destruction.');
  } else if (usdc === 0) {
    angles.push('Zero USDC on a testnet where USDC is FREE. Couldn\'t be bothered to claim free money. Talent.');
  } else if (usdc < 1) {
    angles.push('$' + usdc.toFixed(4) + ' — that\'s not a balance, that\'s quantum foam. Barely observable by science.');
  } else if (usdc > 500000) {
    angles.push('$' + usdc.toLocaleString() + ' in fake USDC. Dragon-hoarding monopoly money. This wallet needs an intervention.');
  }

  return [
    'You are a savage crypto roast comedian. Roast this Arc Testnet wallet:',
    '',
    'Address: ' + addr,
    'Transactions sent: ' + txc.toLocaleString(),
    'USDC balance: $' + usdc.toFixed(2),
    'Network: Arc Testnet (Chain 5042002) — ALL TOKENS ARE FAKE AND FREE',
    '',
    'Roast angles:',
    angles.map(function(a, i) { return (i+1) + '. ' + a; }).join('\n'),
    '',
    'Write 3 savage paragraphs. Rules:',
    '- Reference exact numbers: ' + txc.toLocaleString() + ' txs, $' + usdc.toFixed(2) + ' USDC',
    '- Use web3 slang: ser, fren, ngmi, wagmi, degen, wen moon, probably nothing',
    '- Destroy the TESTNET angle — fake money, zero stakes, still failing',
    '- End with: VERDICT: [one brutal all-caps line]',
    '- Plain text only, zero markdown, zero asterisks'
  ].join('\n');
}

// ─── call Claude ─────────────────────────────────────────────────
async function callClaude(prompt) {
  var r = await timedFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  }, 30000);

  if (!r.ok) {
    var t = await r.text();
    throw new Error('Claude API ' + r.status + ': ' + t.slice(0, 200));
  }

  var d = await r.json();
  var text = d.content && d.content[0] && d.content[0].text;
  if (!text) throw new Error('No text from Claude');
  return text;
}

// ─── MAIN HANDLER ────────────────────────────────────────────────
export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  var address = (req.body && req.body.address) ? req.body.address.trim() : '';
  if (!/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    return res.status(400).json({ error: 'Invalid address: must be 0x + 40 hex chars' });
  }

  try {
    // Fetch chain data server-side (no CORS here — this is Node.js on Vercel)
    var txCount, usdc, recentTxs;

    try {
      txCount = await getTxCount(address);
    } catch (e) {
      return res.status(502).json({ error: 'Arc RPC unreachable: ' + e.message });
    }

    usdc = await getUsdc(address);
    recentTxs = await getRecentTxs(address);

    // Generate roast
    var prompt = buildPrompt(address, txCount, usdc);
    var roastText = await callClaude(prompt);

    return res.status(200).json({
      address: address,
      txCount: txCount,
      usdcBalance: usdc,
      recentTxs: recentTxs,
      roast: roastText
    });

  } catch (e) {
    console.error('Handler error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
