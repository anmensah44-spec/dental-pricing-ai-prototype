/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
AI-assisted implementation developed under his direction.
*/
import test from 'node:test';import assert from 'node:assert/strict';import {createApplication} from '../server/app.mjs';
test('login rate limiter blocks repeated invalid attempts without crashing health checks',async()=>{
 const app=createApplication({dbPath:':memory:'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${app.server.address().port}`;
 try{for(let i=0;i<15;i++){const r=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'unknown',password:'invalid'})});assert.equal(r.status,401);}
 const blocked=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'unknown',password:'invalid'})});assert.equal(blocked.status,429);assert.equal((await fetch(base+'/healthz')).status,200);
 }finally{await app.close();}
});
test('concurrent retries commit exactly one clinical draft and one audit event',async()=>{
 const app=createApplication({dbPath:':memory:'});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${app.server.address().port}`;
 try{const r=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'coordinator',password:'Clarity-Demo-2026!'})});const login=await r.json(),cookie=r.headers.get('set-cookie').split(';')[0];
 const responses=await Promise.all(Array.from({length:10},()=>fetch(base+'/api/plans',{method:'POST',headers:{'Content-Type':'application/json','Cookie':cookie,'X-CSRF-Token':login.csrf,'Idempotency-Key':'concurrent-retry-123'},body:JSON.stringify({patientId:'patient-001',family:'CROWN01',minutes:75,lab:280})})));
 const data=await Promise.all(responses.map(async r=>{assert.equal(r.status,200);return r.json();}));assert.equal(new Set(data.map(x=>x.id)).size,1);assert.equal(app.store.list('plan').length,1);assert.equal(app.store.db.prepare("SELECT COUNT(*) AS n FROM audit WHERE action='PLAN_CREATED'").get().n,1);
 }finally{await app.close();}
});
