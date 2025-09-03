async function checkAirdrop() {
  const textarea = document.getElementById("addresses");
  const addresses = textarea.value.split("\n").map(a => a.trim()).filter(a => a);

  if (addresses.length === 0) {
    alert("Please enter at least one address");
    return;
  }

  const results = {};
  for (let addr of addresses) {
    try {
      // Example API call to Linea (replace with the correct one you intercepted)
      const response = await fetch("https://linea-mainnet.infura.io/v3/9d60b7d314be4567adf4530f4b9dd801", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",   // <-- adjust if needed
          params: [{ to: "0xcA11bde05977b3631167028862bE2a173976CA11", data: addr }],
          id: 1
        })
      });
      const data = await response.json();
      results[addr] = data;
    } catch (e) {
      results[addr] = { error: e.message };
    }
  }

  document.getElementById("results").textContent = JSON.stringify(results, null, 2);
}
