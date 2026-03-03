(async ()=>{
  try{
    const fetch = globalThis.fetch;
    const creds = new URLSearchParams({ email: 'admin@devtrack.com', password: 'password123' });
    const res = await fetch('http://localhost:3000/api/auth/callback/credentials', { method: 'POST', body: creds, redirect: 'manual' });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const session = await fetch('http://localhost:3000/api/auth/session', { headers: { cookie: setCookie } });
      await session.text();
    }
  }catch(e){console.error(e);process.exit(1)}
})();
