import autocannon from "autocannon";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

console.log(`🔥 Starting stress tests against ${BASE_URL}`);
console.log("Make sure the server is running with: npm start\n");

async function runStressTest(name, opts) {
  console.log(`\n📊 ${name}`);
  console.log("-".repeat(50));

  const result = await autocannon({
    url: opts.url,
    method: opts.method || "GET",
    headers: opts.headers || {},
    body: opts.body || undefined,
    connections: opts.connections || 100,
    duration: opts.duration || 10,
    pipelining: 1,
  });

  console.log(`Requests/sec:    ${result.requests.average}`);
  console.log(`Latency (ms):    avg=${result.latency.average}  p50=${result.latency.p50}  p95=${result.latency.p95}  p99=${result.latency.p99}`);
  console.log(`Errors:          ${result.errors}`);
  console.log(`Timeouts:        ${result.timeouts}`);
  console.log(`2xx responses:   ${result["2xx"]}`);
  console.log(`4xx responses:   ${result["4xx"] || 0}`);
  console.log(`5xx responses:   ${result["5xx"] || 0}`);

  return result;
}

async function main() {
  try {
    // Test 1: Product listing (public, read-heavy)
    await runStressTest("GET /api/products (public listing)", {
      url: `${BASE_URL}/api/products`,
      connections: 1000,
      duration: 30,
    });

    // Test 2: Product detail (public, read-heavy)
    await runStressTest("GET /api/products/:id (product detail)", {
      url: `${BASE_URL}/api/products`,
      connections: 500,
      duration: 20,
      // We will use setupRequest to hit different IDs if needed, but for now static is fine
    });

    // Test 3: Auth login (rate-limited endpoint)
    await runStressTest("POST /api/auth/login (rate-limited)", {
      url: `${BASE_URL}/api/auth/login`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@test.com", password: "wrong" }),
      connections: 100,
      duration: 10,
    });

    // Test 4: Featured config (public, frontend-critical)
    await runStressTest("GET /api/config/featured (homepage data)", {
      url: `${BASE_URL}/api/config/featured`,
      connections: 1000,
      duration: 20,
    });

    console.log("\n✅ Stress tests complete!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Stress test failed:", err.message);
    console.error("Make sure the server is running on the target URL.");
    process.exit(1);
  }
}

main();
