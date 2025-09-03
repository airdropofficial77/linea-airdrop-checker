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
      const response = await fetch("https://linea-mainnet.infura.io/v3/9d60b7d314be4567adf4530f4b9dd801", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: "0xcA11bde05977b3631167028862bE2a173976CA11", // Airdrop contract
              data: addr // ⚠️ you may need to encode ABI properly here
            },
            "latest"
          ],
          id: 1
        })
      });

      const data = await response.json();

      // Convert hex result (wei) to tokens
      let tokenAmount = 0;
      if (data.result) {
        tokenAmount = parseInt(data.result, 16) / 1e18; // convert wei -> tokens
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
