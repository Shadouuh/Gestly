const services = [
  { name: 'server', url: 'http://127.0.0.1:3001/api/health', parseJson: true },
  { name: 'ocr', url: 'http://127.0.0.1:8765/health', parseJson: true },
  { name: 'client', url: 'http://localhost:5173', parseJson: false },
];

const probe = async (service) => {
  const startedAt = Date.now();
  try {
    const response = await fetch(service.url);
    const durationMs = Date.now() - startedAt;
    const payload = service.parseJson ? await response.json() : await response.text();

    return {
      name: service.name,
      ok: response.ok,
      status: response.status,
      durationMs,
      details: service.parseJson ? payload : { bodyLength: String(payload || '').length },
    };
  } catch (error) {
    return {
      name: service.name,
      ok: false,
      status: 'offline',
      durationMs: Date.now() - startedAt,
      details: { message: error.message || String(error) },
    };
  }
};

const results = await Promise.all(services.map(probe));

for (const result of results) {
  const state = result.ok ? 'OK' : 'FAIL';
  console.log(`[dev-status] ${result.name}: ${state} (${result.status}) ${result.durationMs}ms`);
  console.log(`[dev-status] ${result.name} details:`, result.details);
}

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
