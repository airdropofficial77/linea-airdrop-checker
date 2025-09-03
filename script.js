// Replace with the actual airdrop contract address
const AIRDROP_CONTRACT = "0xcA11bde05977b3631167028862bE2a173976CA11";

// Linea RPC via Infura
const RPC_URL = "https://linea-mainnet.infura.io/v3/9d60b7d314be4567adf4530f4b9dd801";

// Encode "balanceOf(address)" ABI manually
function encodeBalanceOf(address) {
  const methodId = "0x70a08231"; // keccak256("balanceOf(address)") first 4 bytes
  const paddedAddr = address.toLowerCase().replace("0x", "").padStart(64, "0");
  return methodId + paddedAddr;
}

async function checkAirdrop() {
  const textarea = document.getElementById("addresses");
  const addresses = textarea.value.split("\n").map(a => a.trim()).filter(a => a);

  if (addresses.length === 0) {
    alert("Please enter at least one address");
    return;
  }

  const results = {};
  const progressContainer = document.getElementById("progress-container");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  progressContainer.style.display = "block";
  progressBar.value = 0;
  progressText.textContent = "Checking addresses...";

  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];

    try {
      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: AIRDROP_CONTRACT,
              data: encodeBalanceOf(addr)
            },
            "latest"
          ],
          id: 1
        })
      });

      const data = await response.json();

      let tokenAmount = 0;
      if (data.result) {
        tokenAmount = parseInt(data.result, 16) / 1e18; // wei → tokens
      }

      results[addr] = tokenAmount;
    } catch (e) {
      results[addr] = `Error: ${e.message}`;
    }

    // Update progress bar
    progressBar.value = ((i + 1) / addresses.length) * 100;
    progressText.textContent = `Checked ${i + 1} of ${addresses.length}`;
  }

  progressText.textContent = "Done ✅";
  document.getElementById("results").textContent = JSON.stringify(results, null, 2);
}
