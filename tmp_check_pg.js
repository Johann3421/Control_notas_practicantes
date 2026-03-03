const {Pool}=require('pg');
const fs=require('fs');
let env=fs.readFileSync('.env','utf8');
let m = env.split(/\r?\n/).map(l=>l.match(/^\s*DATABASE_URL=(.*)$/)).filter(Boolean)[0];
if(!m){console.error('DATABASE_URL not found'); process.exit(2);} 
let v = m[1].trim();
if((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1,-1);
v = v.trim();
const pool=new Pool({connectionString:v,ssl:false});
pool.connect().then(c=>{ c.release(); pool.end();}).catch(e=>{ console.error('CONNECT_ERROR_CODE:', e.code); console.error(e.toString()); pool.end(); process.exit(1);});
