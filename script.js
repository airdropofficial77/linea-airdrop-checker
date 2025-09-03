async function checkEligibility() {
  const input = document.getElementById("addresses").value;
  const addresses = input.split("\n").map(a => a.trim()).filter(a => a.length > 0);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "⏳ Checking...";

  let results = {};

  for (const address of addresses) {
    try {
      // Fetch from Linea Infura RPC
      const response = await fetch("https://linea-mainnet.infura.io/v3/9d60b7d314be4567adf4530f4b9dd801", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              // Contract that manages the eligibility
              to: "0xcA11bde05977b3631167028862bE2a173976CA11",
              // Function selector (0x82ad56cb) + padded address
              data: `0x82ad56cb${address.slice(2).padStart(64, "0")}`
            },
            "latest"
          ],
          id: 1
        })
      });

      const data = await response.json();

      // Result comes in hex → convert
      const hexValue = data.result || "0x0";
      const tokenAmount = parseInt(hexValue, 16) / 1e18;

      results[address] = tokenAmount.toLocaleString();
    } catch (err) {
      results[address] = "⚠️ Error fetching";
    }
  }

  resultsDiv.innerHTML = JSON.stringify(results, null, 2);
}
