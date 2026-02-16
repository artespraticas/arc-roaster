import { useState } from 'react';
import Head from 'next/head';

const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--f:#ff4500;--e:#ff8c00;--g:#ffd700;--bg:#08080f;--cr:#fff5e6;--dm:#55556a;--br:rgba(255,69,0,.2)}
html,body{min-height:100%;background:var(--bg);color:var(--cr);font-family:'Syne',sans-serif}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(ellipse 65% 45% at 12% 92%,rgba(255,50,0,.09) 0%,transparent 55%),
  radial-gradient(ellipse 55% 40% at 88% 8%,rgba(255,120,0,.06) 0%,transparent 55%),
  linear-gradient(rgba(255,69,0,.02) 1px,transparent 1px) 0 0/52px 52px,
  linear-gradient(90deg,rgba(255,69,0,.02) 1px,transparent 1px) 0 0/52px 52px}
.pg{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:48px 20px 96px}

.hdr{text-align:center;margin-bottom:48px}
.fl{display:block;font-size:64px;line-height:1;margin-bottom:4px;animation:sw 2s ease-in-out infinite alternate;transform-origin:50% 90%}
@keyframes sw{from{transform:rotate(-4deg) scale(.94)}to{transform:rotate(4deg) scale(1.06)}}
h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(60px,13vw,104px);letter-spacing:6px;line-height:.86;
  background:linear-gradient(150deg,#fff9f0 0%,#ffb347 38%,var(--f) 68%,#a02800 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{margin-top:12px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--dm);font-weight:700}
.bdg{display:inline-flex;align-items:center;gap:7px;margin-top:16px;padding:5px 16px;
  background:rgba(255,69,0,.08);border:1px solid var(--br);border-radius:99px;
  font-size:11px;color:var(--e);font-weight:700;letter-spacing:2px;text-transform:uppercase}
.dot{width:6px;height:6px;border-radius:50%;background:var(--f);animation:bl 1.5s ease-in-out infinite}
@keyframes bl{0%,100%{opacity:1}50%{opacity:.2}}

.ic{background:rgba(255,255,255,.028);border:1px solid var(--br);border-radius:18px;padding:28px;margin-bottom:24px;backdrop-filter:blur(12px)}
.il{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--e);font-weight:700;margin-bottom:12px}
.ir{display:flex;gap:10px}
.ii{flex:1;min-width:0;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:13px 16px;font-family:'DM Mono',monospace;font-size:13px;color:var(--cr);outline:none;
  transition:border-color .2s,box-shadow .2s}
.ii:focus{border-color:rgba(255,69,0,.5);box-shadow:0 0 0 3px rgba(255,69,0,.1)}
.ii::placeholder{color:rgba(255,255,255,.14)}
.ii:disabled{opacity:.4;pointer-events:none}
.ib{background:linear-gradient(135deg,var(--f),#ff7400);border:none;border-radius:11px;padding:13px 22px;
  color:#fff;font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:2.5px;cursor:pointer;
  white-space:nowrap;box-shadow:0 4px 24px rgba(255,69,0,.28);transition:transform .15s,box-shadow .15s,opacity .15s}
.ib:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 32px rgba(255,69,0,.45)}
.ib:active:not(:disabled){transform:translateY(0)}
.ib:disabled{opacity:.35;cursor:not-allowed}
@media(max-width:480px){.ir{flex-direction:column}}

.lb{text-align:center;padding:60px 16px}
.lf{display:block;font-size:52px;margin-bottom:18px;animation:bn .65s ease-in-out infinite alternate}
@keyframes bn{from{transform:scale(.87) rotate(-6deg);filter:brightness(.85)}to{transform:scale(1.13) rotate(6deg);filter:brightness(1.25)}}
.lt{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:4px;color:var(--e);margin-bottom:8px}
.ls{font-size:13px;color:var(--dm);margin-top:4px}

.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.sb{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:13px;padding:16px 10px;text-align:center}
.sn{font-family:'Bebas Neue',sans-serif;font-size:30px;color:var(--g);letter-spacing:1px;line-height:1}
.sl{font-size:9px;color:var(--dm);text-transform:uppercase;letter-spacing:2px;margin-top:5px;font-weight:700}
@media(max-width:480px){.sg{grid-template-columns:repeat(2,1fr)}}

.rc{background:rgba(255,50,0,.05);border:1px solid rgba(255,69,0,.28);border-radius:18px;padding:30px;margin-bottom:16px;position:relative;overflow:hidden}
.rc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--f) 25%,var(--g) 55%,var(--e) 80%,transparent)}
.rh{display:flex;align-items:center;gap:9px;margin-bottom:14px}
.rt{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:3px;color:var(--f)}
.vt{margin-left:auto;background:linear-gradient(135deg,var(--f),var(--e));border-radius:99px;
  padding:4px 14px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
.ap{font-family:'DM Mono',monospace;font-size:11px;color:var(--dm);background:rgba(0,0,0,.3);
  border-radius:7px;padding:8px 11px;margin-bottom:18px;word-break:break-all;border:1px solid rgba(255,255,255,.05)}
.rx{font-size:15px;line-height:1.8;color:var(--cr);white-space:pre-wrap}

.ts{margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.06)}
.tl{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--e);font-weight:700;margin-bottom:9px}
.tr{display:flex;justify-content:space-between;padding:6px 10px;background:rgba(0,0,0,.18);
  border-radius:7px;margin-bottom:4px;font-family:'DM Mono',monospace;font-size:11px;color:var(--dm)}
.th{color:rgba(255,145,0,.65)}.te{color:#ff6060;font-size:10px}

.ac{display:flex;gap:9px;flex-wrap:wrap}
.ab{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:9px;
  padding:9px 16px;color:var(--cr);font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;
  text-decoration:none;display:inline-flex;align-items:center;gap:7px}
.ab:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}

.eb{background:rgba(255,0,0,.06);border:1px solid rgba(255,80,80,.22);border-radius:13px;
  padding:20px 22px;color:#ff8080;font-size:14px;line-height:1.65}
.eb b{color:#ff5a5a;display:block;margin-bottom:7px;font-size:15px}
.eb pre{margin-top:10px;background:rgba(0,0,0,.3);border-radius:6px;padding:9px 11px;
  font-family:'DM Mono',monospace;font-size:11px;color:#ffaaaa;white-space:pre-wrap;word-break:break-all}

footer{text-align:center;margin-top:64px;padding-top:20px;border-top:1px solid rgba(255,255,255,.05);
  font-size:11px;color:rgba(255,255,255,.16);line-height:1.9}
footer a{color:rgba(255,140,0,.38);text-decoration:none}
`;

function verd(tx, u) {
  if (tx===0&&u===0)  return '💀 CERTIFIED GHOST';
  if (tx===0)         return '💀 DEAD ON ARRIVAL';
  if (tx<=3)          return '🐌 ABSOLUTE NGMI';
  if (tx<10)          return '😴 SLEEPING ON CHAIN';
  if (tx>5000)        return '🤖 DEFINITELY A BOT';
  if (tx>1000)        return '🤡 UNHINGED DEGEN';
  if (tx>200)         return '🔄 COMPULSIVE CLICKER';
  if (u>100000)       return '🐳 FAKE WHALE ALERT';
  if (u<1&&tx>20)    return '🪨 BROKE BUT BUSY';
  return '🤷 MEDIOCRE AT BEST';
}

function fU(n){const v=parseFloat(n||0);return v>=1e6?(v/1e6).toFixed(2)+'M':v>=1e3?(v/1e3).toFixed(1)+'K':v.toFixed(2);}
function fH(h){return h?h.slice(0,10)+'…'+h.slice(-6):'';}
function fD(ts){return ts?new Date(parseInt(ts)*1000).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'}):''}

export default function Home() {
  const [addr,   setAddr]   = useState('');
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState('');
  const [data,   setData]   = useState(null);
  const [copied, setCopied] = useState(false);
  const [dots,   setDots]   = useState('');

  async function go() {
    const a = addr.trim();
    if (!/^0x[0-9a-fA-F]{40}$/i.test(a)) {
      setErr('Invalid address — must be 42 characters starting with 0x.');
      return;
    }
    setErr(''); setData(null); setBusy(true);

    // Animate dots while loading
    let d = 0;
    const timer = setInterval(() => { d=(d+1)%4; setDots('.'.repeat(d)); }, 400);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: a })
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch {
        throw new Error('Server returned non-JSON: ' + text.slice(0, 200));
      }
      if (!res.ok) throw new Error(json.error || 'Server error ' + res.status);
      setData(json);
    } catch (e) {
      setErr(e.message);
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  }

  function copy() {
    const el = document.getElementById('rt');
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() { setAddr(''); setData(null); setErr(''); }

  const v = data ? verd(data.txCount, data.usdcBalance) : '';
  const vibe = data ? (data.txCount===0?'💀':data.txCount>200?'🤡':data.txCount<5?'🐌':'🔥') : '';

  return (<>
    <Head>
      <title>🔥 ARC Roaster</title>
      <meta name="description" content="AI wallet roaster for Arc Testnet"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
    </Head>
    <style dangerouslySetInnerHTML={{__html:G}}/>

    <main className="pg">
      <header className="hdr">
        <span className="fl">🔥</span>
        <h1>ARC ROASTER</h1>
        <p className="sub">No mercy for your testnet wallet</p>
        <span className="bdg"><span className="dot"/>Arc Testnet · Chain 5042002</span>
      </header>

      <div className="ic">
        <div className="il">Wallet address to roast</div>
        <div className="ir">
          <input className="ii" id="addr-in" type="text"
            placeholder="0x… paste any Arc Testnet wallet address"
            value={addr} onChange={e=>setAddr(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&!busy&&go()}
            disabled={busy} autoComplete="off" spellCheck={false}/>
          <button className="ib" onClick={go} disabled={busy}>
            {busy ? `⏳ COOKING${dots}` : '🔥 ROAST IT'}
          </button>
        </div>
      </div>

      {err && !busy && (
        <div className="eb">
          <b>⚠️ Error</b>
          {err}
        </div>
      )}

      {busy && (
        <div className="lb">
          <span className="lf">🔥</span>
          <div className="lt">Cooking your roast{dots}</div>
          <div className="ls">Fetching live chain data · Writing savage roast · This takes ~10s</div>
        </div>
      )}

      {data && !busy && (<>
        <div className="sg">
          <div className="sb"><div className="sn">{parseInt(data.txCount||0).toLocaleString()}</div><div className="sl">Txs Sent</div></div>
          <div className="sb"><div className="sn">${fU(data.usdcBalance)}</div><div className="sl">USDC Balance</div></div>
          <div className="sb"><div className="sn">{vibe}</div><div className="sl">Vibe Check</div></div>
        </div>

        <div className="rc">
          <div className="rh"><span>🔥</span><span className="rt">THE ROAST</span><span className="vt">{v}</span></div>
          <div className="ap">{data.address}</div>
          <div id="rt" className="rx">{data.roast}</div>
          {data.recentTxs&&data.recentTxs.length>0&&(
            <div className="ts">
              <div className="tl">Evidence used against you</div>
              {data.recentTxs.map((tx,i)=>(
                <div className="tr" key={i}>
                  <span className="th">{fH(tx.hash)}</span>
                  <span>{fD(tx.timeStamp)}</span>
                  {tx.isError==='1'&&<span className="te">FAILED</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ac">
          <button className="ab" onClick={copy}>{copied?'✅ Copied!':'📋 Copy Roast'}</button>
          <a className="ab" href={`https://testnet.arcscan.app/address/${data.address}`} target="_blank" rel="noopener">🔍 View on Arcscan</a>
          <button className="ab" onClick={reset}>🔄 Roast Another</button>
        </div>
      </>)}

      <footer>
        Data: <a href="https://rpc.testnet.arc.network" target="_blank" rel="noopener">Arc Testnet RPC</a>
        {' · '}<a href="https://testnet.arcscan.app" target="_blank" rel="noopener">Arcscan</a>
        {' · '}Claude AI<br/>
        🔥 Roasting fake wallets since 2025 · ngmi · have fun staying poor
      </footer>
    </main>
  </>);
}
