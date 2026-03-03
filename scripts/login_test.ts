import 'dotenv/config'
async function main() {
  const email = process.argv[2] || 'carlos@devtrack.com'
  const password = process.argv[3] || 'password123'
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Fetch CSRF
  const csrfRes = await fetch(`${base}/api/auth/csrf`, { method: 'GET', credentials: 'include' })
  const csrfJson = await csrfRes.json()
  const setCookieHeader = csrfRes.headers.get('set-cookie') || ''

  // Build cookie header (take first parts before ';')
  const cookieHeader = setCookieHeader.split(',').map((c) => c.split(';')[0].trim()).join('; ')

  // Post to credentials callback
  const params = new URLSearchParams()
  params.append('csrfToken', csrfJson.csrfToken)
  params.append('callbackUrl', `${base}/`)
  params.append('json', 'true')
  params.append('email', email)
  params.append('password', password)

  const postRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieHeader,
    },
    body: params.toString(),
    redirect: 'manual',
  })

  const postSetCookie = postRes.headers.get('set-cookie') || ''
  const bodyText = await postRes.text()
}

main().catch((e)=>{console.error(e); process.exit(1)})
