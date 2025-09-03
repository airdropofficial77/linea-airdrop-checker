// --- selectors to your DOM ---
const form = document.getElementById("airdrop-form");
const resultsDiv = document.getElementById("results");
const progressBar = document.getElementById("progress-bar");
const statusText = document.getElementById("status");

// ------- constants you can tweak if needed -------
const INFURA_URL = "https://linea-mainnet.infura.io/v3/9d60b7d314be4567adf4530f4b9dd801";
// Real airdrop contract (extracted from your Multicall payload)
const AIRDROP_CONTRACT = "0x87baa1694381ae3ecae2660d97fe60404080eb64";
// Real function selector used by the airdrop contract (single address arg)
const FN_SELECTOR = "0x7debb959";

// ---------- helpers ----------
function padAddress(addr) {
  return addr.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

// Safe wei -> token string without floating-point loss.
// Shows up to 4 decimals, trims trailing zeros.
function weiToTokenString(hexWei, decimals = 18, dp = 4) {
  const wei = BigInt(hexWei);
  const base = 10n  BigInt(decimals);
  const whole = wei / base;
  const frac = wei % base;

  if (dp === 0) {
    return whole.toLocaleString();
  }

  // scale fractional to requested decimals
  const scale = 10n  BigInt(dp);
  const fracScaled = (frac * scale) / base;

  let fracStr = fracScaled.toString().padStart(dp, "0");
  // trim trailing zeros
  fracStr = fracStr.replace(/0+$/, "");
  return fracStr.length ? ${Number(whole).toLocaleString()}.${fracStr} : Number(whole).toLocaleString();
}

async function rpcEthCall(to, data) {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{ to, data }, "latest"],
    id: 1,
  };

  const res = await fetch(INFURA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok  json.error) {
    throw new Error(json?.error?.message  RPC error (${res.status}));
  }
  return json.result; // hex string like "0x0000...<32 bytes>"
}

// ---------- main check function (call this for each address) ----------
async function checkLineaAirdrop(address) {
  // Build call data: selector + 32-byte padded address
  const data = FN_SELECTOR + padAddress(address);

  // Call the contract directly (not the Multicall3 wrapper)
  const resultHex = await rpcEthCall(AIRDROP_CONTRACT, data);

  // If the contract returns a single uint256, resultHex is 32 bytes ABI-encoded
  // Convert to token string (18 decimals assumed)
  const tokensStr = weiToTokenString(resultHex, 18, 4); // show up to 4 decimals
  return tokensStr;
}

// ---------- UI wiring ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const addresses = document
    .getElementById("addresses")
    .value.split("\n")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  resultsDiv.innerHTML = "";
  progressBar.style.width = "0%";
  statusText.textContent = "Checking...";

  const results = {};
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    try {
      const tokens = await checkLineaAirdrop(addr);
      results[addr] = ${tokens} LINEA;
    } catch (err) {
      console.error(err);
      results[addr] = "❌ Error";
    }
    progressBar.style.width = ${Math.round(((i + 1) / addresses.length) * 100)}%;
  }

  statusText.textContent = "Done ✅";
  resultsDiv.innerHTML = <pre>${JSON.stringify(results, null, 2)}</pre>;
});
