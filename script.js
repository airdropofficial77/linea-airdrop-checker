const form = document.getElementById("airdrop-form");
const resultsDiv = document.getElementById("results");
const progressBar = document.getElementById("progress-bar");
const statusText = document.getElementById("status");

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

  let results = {};
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    try {
      const tokens = await checkLineaAirdrop(addr);
      results[addr] = tokens.toLocaleString("en-US") + " LINEA";
    } catch (err) {
      results[addr] = "❌ Error";
    }

    progressBar.style.width = `${Math.round(
      ((i + 1) / addresses.length) * 100
    )}%`;
  }

  statusText.textContent = "Done ✅";

  // Build results as a table
  let html = `
    <table border="1" cellspacing="0" cellpadding="8" style="width:100%; text-align:left; border-collapse:collapse;">
      <tr style="background:#f4f4f4;">
        <th>Address</th>
        <th>Tokens</th>
      </tr>
  `;
  for (const [addr, val] of Object.entries(results)) {
    html += `<tr><td>${addr}</td><td><strong>${val}</strong></td></tr>`;
  }
  html += `</table>`;

  // Add follow buttons
  html += `
    <div style="margin-top:20px; text-align:center;">
      <a href="https://t.me/airdropofficial7" target="_blank" style="text-decoration:none; margin:5px; display:inline-block; padding:10px 20px; background:#0088cc; color:#fff; border-radius:5px;">
        🚀 Join Telegram
      </a>
      <a href="https://x.com/its_airdrop" target="_blank" style="text-decoration:none; margin:5px; display:inline-block; padding:10px 20px; background:#1DA1F2; color:#fff; border-radius:5px;">
        🐦 Follow on Twitter
      </a>
    </div>
  `;

  resultsDiv.innerHTML = html;
});

async function checkLineaAirdrop(address) {
  const url =
    "https://linea-mainnet.infura.io/v3/9d60b7d314be4567adf4530f4b9dd801";

  // build call data for smart contract
  const cleanAddr = address.toLowerCase().replace("0x", "").padStart(64, "0");
  const data = "0x82ad56cb" + cleanAddr;

  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: "0xcA11bde05977b3631167028862bE2a173976CA11",
        data: data,
      },
      "latest",
    ],
    id: 1,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.result) {
    throw new Error("Invalid response");
  }

  const tokens = BigInt(result.result).toString();
  return Math.floor(Number(tokens) / 1e18); // round down to whole number
}
