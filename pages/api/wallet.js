// pages/api/wallet.js — server-side, no CORS issues

const RPC_URLS = [
  'https://rpc.testnet.arc.network',
  'https://5042002.rpc.thirdweb.com',
];

// USDC system contract on Arc Testnet
const USDC = '0x3600000000000000000000000000000000000000';
const EXPLORER = 'https://testnet.arcscan.app/api';

function fetchWithTimeout(url, options, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out')), ms);
    fetch(url, options)
      .then(r => { clearTimeout(timer); resolve(r); })
      .catch(e => { clearTimeout(timer); reject(e); });
  });
}

async function rpc(method, params, idx) {
  idx = idx || 0;
  if (idx >= RPC_URLS.length) throw new Error('All RPC endpoints unreachable');
  try {
    const r = await fetchWithTimeout(
      RPC_URLS[idx],
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params }),
      },
      10000
    );
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || 'RPC error');
    return d.result;
  } catch (e) {
    console.warn('RPC ' + RPC_URLS[idx] + ' failed: ' + e.message);
    return rpc(method, params, idx + 1);
  }
}

async function getUsdcBalance(addr) {
  try {
    const padded = addr.replace('0x', '').toLowerCase().padStart(64, '0');
    const calldata = '0x70a08231' + padded;
    const raw = await rpc('eth_call', [{ to: USDC, data: calldata }, 'latest']);
    if (!raw || raw === '0x' || raw === '0x0000000000000000000000000000000000000000000000000000000000000000') return 0;
    const wei = parseInt(raw, 16);
    return wei / 1e6;
  } catch (e) {
    console.warn('USDC balance failed: ' + e.message);
    return 0;
  }
}

async function getTxCount(addr) {
  try {
    const raw = await rpc('eth_getTransactionCount', [addr, 'latest']);
    return parseInt(raw, 16) || 0;
  } catch (e) {
    console.warn('TxCount failed: ' + e.message);
    return 0;
  }
}

async function getRecentTxs(addr) {
  try {
    const url = EXPLORER + '?module=account&action=txlist&address=' + addr + '&sort=desc&page=1&offset=5';
    const r = await fetchWithTimeout(url, {}, 10000);
    if (!r.ok) return [];
    const d = await r.json();
    if (!Array.isArray(d.result)) return [];
    return d.result.slice(0, 5).map(function(tx) {
      return { hash: tx.hash, timeStamp: tx.timeStamp, isError: tx.isError };
    });
  } catch (e) {
    console.warn('Explorer txs failed: ' + e.message);
    return [];
  }
}

async function checkIsContract(addr) {
  try {
    const code = await rpc('eth_getCode', [addr, 'latest']);
    return typeof code === 'string' && code.length > 4 && code !== '0x';
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const address = req.query.address;

  if (!address || !/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  try {
    const results = await Promise.allSettled([
      getUsdcBalance(address),
      getTxCount(address),
      getRecentTxs(address),
      checkIsContract(address),
    ]);

    const usdcBalance = results[0].status === 'fulfilled' ? results[0].value : 0;
    const txCount     = results[1].status === 'fulfilled' ? results[1].value : 0;
    const recentTxs   = results[2].status === 'fulfilled' ? results[2].value : [];
    const isContract  = results[3].status === 'fulfilled' ? results[3].value : false;

    return res.status(200).json({
      address: address,
      txCount: txCount,
      usdcBalance: usdcBalance,
      recentTxs: recentTxs,
      isContract: isContract,
    });
  } catch (e) {
    console.error('Wallet handler error:', e);
    return res.status(500).json({ error: e.message || 'Unexpected error' });
  }
}
