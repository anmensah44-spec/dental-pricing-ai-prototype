/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
AI-assisted implementation developed under his direction.
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApplication} from '../server/app.mjs';
import {CATALOG} from '../server/catalog.mjs';
import {estimate,decimalCents} from '../server/pricing.mjs';
const model=JSON.parse(readFileSync(new URL('../dist/cost-model.json',import.meta.url)));
test('exact decimal parsing rejects rounding, signs, scientific notation and excess precision',()=>{
 assert.equal(decimalCents('100.01'),10001);assert.equal(decimalCents('0.1'),10);
 for(const v of ['1.005','-1','1e2','Infinity','',1])assert.throws(()=>decimalCents(v));
});
test('all 16 treatment families reconcile and respect permitted fee and margin constraints',()=>{
 for(const c of CATALOG)for(const insurance of [false,true])for(const loyalty of [false,true])for(const financing of [false,true]){
  const q=estimate({family:c.code,minutes:c.minutes,lab:c.lab,deposit:0,insurance,loyalty,financing},model);
  if(q.route==='REVIEW'){assert.equal(q.code,'INFEASIBLE');continue;}assert.equal(q.route,'ISSUED',c.code);assert.equal(q.net,q.patient+q.payer);assert.equal(q.balance+q.deposit,q.patient);
  if(!insurance){assert.ok(q.gross>=c.reference*.95&&q.gross<=c.reference*1.05);assert.ok(BigInt(q.net-q.cost.upper-q.fee)*10000n>=BigInt(q.net)*3000n);}else{assert.equal(q.gross,c.reference);assert.equal(q.discount,0);}
 }
});
test('server integration and complete synthetic patient journeys',async t=>{
 const folder=mkdtempSync(join(tmpdir(),'clarity-test-')),dbPath=join(folder,'app.sqlite');let now=Date.now();
 let app,base;const start=async()=>{app=createApplication({dbPath,clock:()=>now});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${app.server.address().port}`;};await start();
 t.after(async()=>{await app.close();rmSync(folder,{recursive:true,force:true});});
 const call=async(session,path,data,extra={})=>{const response=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(session?{'Cookie':session.cookie,'X-CSRF-Token':session.csrf}:{}),...(data!==undefined?{'Idempotency-Key':crypto.randomUUID()}:{}),...extra},...(data===undefined?{}:{body:JSON.stringify(data)})});let body;try{body=await response.json();}catch{body=null;}return {status:response.status,body,headers:response.headers};};
 const login=async username=>{const response=await fetch(base+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:'Clarity-Demo-2026!'})});const b=await response.json();assert.equal(response.status,200);return {cookie:response.headers.get('set-cookie').split(';')[0],csrf:b.csrf};};
 const coord=await login('coordinator'),dentist=await login('dentist'),director=await login('director'),patient=await login('patient'),reviewer=await login('reviewer');
 const command=async(s,path,data)=>{const r=await call(s,path,data);assert.equal(r.status,200,JSON.stringify(r.body));return r.body;};
 const plan=async(code='CROWN01',patientId='patient-001',patch={})=>{const c=CATALOG.find(c=>c.code===code);let p=await command(coord,'/api/plans',{patientId,family:code,minutes:c.minutes,lab:c.lab,...patch});return command(dentist,`/api/plans/${p.id}/approve`,{version:p.version});};
 const quote=async(p,patch={})=>command(coord,'/api/quotes',{planId:p.id,planVersion:p.version,benefits:'CURRENT',deposit:0,insurance:false,loyalty:false,financing:false,...patch});
 let accepted,application;
 await t.test('authentication, CSRF, origin isolation, content limits and static path protections',async()=>{
  assert.equal((await call(null,'/api/workspace')).status,401);
  assert.equal((await call(coord,'/api/patients',{reference:'Demo patient 004'},{'X-CSRF-Token':''})).status,403);
  assert.equal((await call(coord,'/api/patients',{reference:'Demo patient 004'},{Origin:'https://evil.example'})).status,403);
  assert.equal((await call(coord,'/api/plans',{patientId:'patient-001',family:'EXAM',minutes:40,lab:0},{'Content-Type':'text/plain'})).status,415);
  assert.equal((await call(coord,'/api/patients',{reference:'x'.repeat(33000)})).status,413);
  assert.equal((await fetch(base+'/server/app.mjs')).status,404);assert.equal((await fetch(base+'/data/clarity.sqlite')).status,404);
  const home=await fetch(base+'/');assert.equal(home.status,200);assert.match(home.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 });
 await t.test('CRM validation, explicit consent, roles and patient record isolation',async()=>{
  assert.equal((await call(coord,'/api/patients',{reference:'Actual Patient Name'})).status,400);
  const p=await command(coord,'/api/patients',{reference:'Demo patient 004'});assert.equal(p.contactConsent,false);
  assert.equal((await call(patient,`/api/patients/${p.id}/consent`,{version:p.version,consent:true})).status,404);
  const data=(await call(patient,'/api/workspace')).body;assert.equal(data.patients.length,1);assert.equal(data.patients[0].id,'patient-001');
  const own=data.patients[0];assert.equal((await command(patient,`/api/patients/${own.id}/consent`,{version:own.version,consent:true})).contactConsent,true);
  assert.equal((await call(patient,'/api/audit')).status,403);
 });
 await t.test('only a clinician approves; approval and source freshness enforced on server',async()=>{
  const p=await command(coord,'/api/plans',{patientId:'patient-001',family:'CROWN01',minutes:75,lab:280});
  assert.equal((await call(coord,`/api/plans/${p.id}/approve`,{version:p.version})).status,403);
  assert.equal((await call(coord,'/api/quotes',{planId:p.id,planVersion:p.version})).status,409);
  const approved=await command(dentist,`/api/plans/${p.id}/approve`,{version:p.version});
  assert.equal((await call(coord,'/api/quotes',{planId:p.id,planVersion:approved.version,benefits:'STALE'})).status,409);
  assert.equal((await call(coord,'/api/quotes',{planId:p.id,planVersion:p.version,benefits:'CURRENT'})).status,409);
 });
 await t.test('quote idempotency prevents duplicates and rejects conflicting key reuse',async()=>{
  const p=await plan(),body={planId:p.id,planVersion:p.version,benefits:'CURRENT',deposit:10000,insurance:true,loyalty:true,financing:true},key='same-command-123';
  const a=await call(coord,'/api/quotes',body,{'Idempotency-Key':key}),b=await call(coord,'/api/quotes',body,{'Idempotency-Key':key});assert.equal(a.status,200);assert.equal(a.body.id,b.body.id);
  assert.equal((await call(coord,'/api/quotes',{...body,deposit:20000},{'Idempotency-Key':key})).status,409);
  accepted=a.body;assert.equal(accepted.discount,0);assert.equal(accepted.payer,50000);
 });
 await t.test('acceptance requires consent, correct role, active version and immutable money',async()=>{
  assert.equal((await call(director,`/api/quotes/${accepted.id}/accept`,{version:accepted.version,consent:true})).status,403);
  assert.equal((await call(patient,`/api/quotes/${accepted.id}/accept`,{version:accepted.version,consent:false})).status,400);
  const net=accepted.net;accepted=await command(patient,`/api/quotes/${accepted.id}/accept`,{version:accepted.version,consent:true,net:1});assert.equal(accepted.net,net);
  assert.equal((await call(patient,`/api/quotes/${accepted.id}/accept`,{version:accepted.version,consent:true})).status,409);
 });
 await t.test('complete financing submission, provider offer, separate acceptance and funding',async()=>{
  assert.equal((await call(patient,`/api/quotes/${accepted.id}/finance`,{version:accepted.version,consent:false})).status,400);
  application=await command(patient,`/api/quotes/${accepted.id}/finance`,{version:accepted.version,consent:true});assert.equal(application.status,'PENDING');
  assert.equal((await call(patient,`/api/quotes/${accepted.id}/finance`,{version:accepted.version,consent:true})).status,409);
  assert.equal((await call(patient,`/api/finance/${application.id}/provider-event`,{version:application.version,source:'local-simulator',event:'offer'})).status,403);
  assert.equal((await call(director,`/api/finance/${application.id}/provider-event`,{version:application.version,source:'local-simulator',event:'fund'})).status,409);
  application=await command(director,`/api/finance/${application.id}/provider-event`,{version:application.version,source:'local-simulator',event:'offer'});
  application=await command(patient,`/api/finance/${application.id}/accept-offer`,{version:application.version,consent:true});
  application=await command(director,`/api/finance/${application.id}/provider-event`,{version:application.version,source:'local-simulator',event:'fund'});assert.equal(application.status,'FUNDED');
  const q=(await call(patient,'/api/workspace')).body.quotes.find(q=>q.id===accepted.id);assert.equal(q.ledger.remaining,0);assert.equal(q.ledger.funded,accepted.balance);
  assert.equal((await call(coord,`/api/quotes/${accepted.id}/payment`,{version:accepted.version,amount:1})).status,409);
 });
 await t.test('refund reverses simulated funding; direct payment reconciles the outstanding balance',async()=>{
  application=await command(director,`/api/finance/${application.id}/provider-event`,{version:application.version,source:'local-simulator',event:'refund'});assert.equal(application.status,'REFUNDED');
  const payment=await command(coord,`/api/quotes/${accepted.id}/payment`,{version:accepted.version,amount:accepted.balance});assert.equal(payment.amount,accepted.balance);
  const q=(await call(coord,'/api/workspace')).body.quotes.find(q=>q.id===accepted.id);assert.equal(q.ledger.remaining,0);
 });
 await t.test('decline and withdrawal are terminal, duplicate/out-of-order events fail',async()=>{
  for(const terminal of ['decline','withdraw']){
   const p=await plan();let q=await quote(p);q=await command(coord,`/api/quotes/${q.id}/accept`,{version:q.version,consent:true});let f=await command(coord,`/api/quotes/${q.id}/finance`,{version:q.version,consent:true});
   f=terminal==='decline'?await command(director,`/api/finance/${f.id}/provider-event`,{version:f.version,source:'local-simulator',event:'decline'}):await command(coord,`/api/finance/${f.id}/withdraw`,{version:f.version});
   assert.ok(['DECLINED','WITHDRAWN'].includes(f.status));assert.equal((await call(director,`/api/finance/${f.id}/provider-event`,{version:f.version,source:'local-simulator',event:'offer'})).status,409);
  }
 });
 await t.test('review route cannot become issued through a reviewer disposition',async()=>{
  const p=await plan('EXAM','patient-001',{minutes:180,lab:1500});let q=await quote(p);assert.equal(q.route,'REVIEW');
  assert.equal((await call(coord,`/api/quotes/${q.id}/review`,{version:q.version,disposition:'SOURCE_REWORK'})).status,403);
  q=await command(reviewer,`/api/quotes/${q.id}/review`,{version:q.version,disposition:'SOURCE_REWORK'});assert.equal(q.route,'REVIEW');assert.equal(q.disposition,'SOURCE_REWORK');
 });
 await t.test('future appointment cannot complete early; all visits complete the pathway',async()=>{
  let p=await plan('CROWN01');const initial=now;
  p=await command(coord,`/api/plans/${p.id}/schedule`,{version:p.version,when:new Date(now+60000).toISOString()});
  assert.equal((await call(dentist,`/api/plans/${p.id}/complete-visit`,{version:p.version,appointmentId:p.appointments[0].id})).status,409);
  now+=60001;p=await command(dentist,`/api/plans/${p.id}/complete-visit`,{version:p.version,appointmentId:p.appointments[0].id});assert.equal(p.status,'SCHEDULED');
  p=await command(coord,`/api/plans/${p.id}/schedule`,{version:p.version,when:new Date(now+60000).toISOString()});now+=60001;
  p=await command(dentist,`/api/plans/${p.id}/complete-visit`,{version:p.version,appointmentId:p.appointments[1].id});assert.equal(p.status,'COMPLETED');now=initial;
 });
 await t.test('expiry and cancellation block acceptance and funding',async()=>{
  let p=await plan();let q=await quote(p);const original=now;now+=15*86400000;assert.equal((await call(coord,`/api/quotes/${q.id}/accept`,{version:q.version,consent:true})).status,401);now=original;
  // New session after elapsed simulated time; quote itself still expired.
  const fresh=await login('coordinator');now=original+15*86400000;const live=await login('coordinator');assert.equal((await call(live,`/api/quotes/${q.id}/accept`,{version:q.version,consent:true})).status,409);now=original;
  for(const [account,session] of [['coordinator',coord],['dentist',dentist],['director',director],['patient',patient],['reviewer',reviewer]])Object.assign(session,await login(account));
  p=await command(coord,`/api/plans/${p.id}/cancel`,{version:p.version});assert.equal((await call(coord,`/api/quotes/${q.id}/accept`,{version:q.version,consent:true})).status,409);
 });
 await t.test('accepted plans cannot be repriced; alternate quotes and active financing cannot bypass lifecycle',async()=>{
  const p=await plan();let q=await quote(p);const alternate=await quote(p);q=await command(coord,`/api/quotes/${q.id}/accept`,{version:q.version,consent:true});
  assert.equal((await call(coord,'/api/quotes',{planId:p.id,planVersion:p.version})).status,409);
  assert.equal((await call(coord,`/api/quotes/${alternate.id}/accept`,{version:alternate.version,consent:true})).status,409);
  let f=await command(coord,`/api/quotes/${q.id}/finance`,{version:q.version,consent:true});
  assert.equal((await call(coord,`/api/plans/${p.id}/cancel`,{version:p.version})).status,409);
  await command(coord,`/api/finance/${f.id}/withdraw`,{version:f.version});
  assert.equal((await command(coord,`/api/plans/${p.id}/cancel`,{version:p.version})).status,'CANCELLED');
 });
 await t.test('decision export and database audit chain are verifiable and append only',async()=>{
  const exported=await call(patient,`/api/quotes/${accepted.id}/export`);assert.equal(exported.status,200);assert.equal(exported.body.syntheticOnly,true);assert.ok(exported.body.events.length>=2);
  assert.equal((await call(reviewer,'/api/audit')).body.verified,true);
  assert.throws(()=>app.store.db.exec("UPDATE audit SET actor='tampered' WHERE seq=1"),/append only/);
 });
 await t.test('SQLite records, sessions and audit survive a server restart',async()=>{
  const before=(await call(coord,'/api/workspace')).body;await app.close();await start();const after=(await call(coord,'/api/workspace')).body;assert.equal(after.plans.length,before.plans.length);assert.equal(after.finance.length,before.finance.length);assert.equal(app.store.verify(),true);
 });
 await t.test('logout revokes session and health endpoint reports storage integrity',async()=>{
  assert.equal((await call(null,'/healthz')).body.auditVerified,true);await command(patient,'/api/logout',{});assert.equal((await call(patient,'/api/workspace')).status,401);
 });
});
