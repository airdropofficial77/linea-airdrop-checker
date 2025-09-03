// script.js

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
      results[addr] = tokens;
    } catch (err) {
      results[addr] = "❌ Error";
    }

    // Update progress bar
    progressBar.style.width = `${Math.round(((i + 1) / addresses.length) * 100)}%`;
  }

  statusText.textContent = "Done ✅";
  resultsDiv.innerHTML = `<pre>${JSON.stringify(results, null, 2)}</pre>`;
});

async function checkLineaAirdrop(address) {
  // Infura Linea mainnet endpoint
  const url = "https://linea-mainnet.infura.io/v3/9d60b7d314be4567adf4530f4b9dd801";

  // Remove "0x" and pad address to 64 characters
  const cleanAddr = address.toLowerCase().replace("0x", "").padStart(64, "0");

  // Function selector for airdrop allocation check (from your network log: 0x82ad56cb)
  const data = "0x82ad56cb" + cleanAddr;

  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: "0xcA11bde05977b3631167028862bE2a173976CA11", // Airdrop contract address
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

  // Convert hex -> number (divide by 1e18 for LINEA token units)
  const tokens = BigInt(result.result).toString();
  const readable = Number(tokens) / 1e18;

  return readable;
}
