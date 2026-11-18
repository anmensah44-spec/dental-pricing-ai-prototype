/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
*/
import http from 'node:http';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {dirname,join,resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import {openStore,passwordHash,checkPassword,hash} from './store.mjs';
import {CATALOG,POLICY} from './catalog.mjs';
import {estimate} from './pricing.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
class Failure extends Error {constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new Failure(status,message);};
const roles=(user,...allowed)=>{if(!allowed.includes(user.role))fail(403,'Role is not authorized for this action');};
const text=(value,max=160)=>{if(typeof value!=='string'||!value.trim()||value.length>max)fail(400,'Invalid text field');return value.trim();};
const version=(entity,v)=>{if(v!==entity.version)fail(409,'Stale version; refresh before retrying');};
export function createApplication(options={}) {
 const dbPath=options.dbPath||process.env.DB_PATH||join(ROOT,'data/clarity.sqlite');
 if(dbPath!==':memory:')mkdirSync(dirname(dbPath),{recursive:true,mode:0o700});
 const store=openStore(dbPath),{db}=store;
 const model=JSON.parse(readFileSync(join(ROOT,'dist/cost-model.json'),'utf8'));
 const clock=options.clock||(()=>Date.now());const loginAttempts=new Map();
 const demoPassword=options.password||process.env.DEMO_PASSWORD||'Clarity-Demo-2026!';
 if(process.env.APP_MODE&&process.env.APP_MODE!=='synthetic')throw Error('Only synthetic mode is supported. Real patient/bank operation is not authorized.');
 const userDefinitions=[['director','admin'],['coordinator','coordinator'],['dentist','clinician'],['reviewer','reviewer'],['patient','patient']];
 store.transaction(()=>{
  for(const [id,role] of userDefinitions)if(!db.prepare('SELECT id FROM users WHERE id=?').get(id))db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(id,role,passwordHash(demoPassword),role==='patient'?'patient-001':null);
  for(let i=1;i<=3;i++)if(!store.get(`patient-00${i}`)){store.save('patient',{id:`patient-00${i}`,patientId:`patient-00${i}`,version:1,reference:`Demo patient 00${i}`,contactConsent:false,created:new Date(clock()).toISOString()});store.event('system','PATIENT_CREATED',`patient-00${i}`,{synthetic:true});}
 });
 const scoped=(user,e)=>{if(!e)fail(404,'Record not found');if(user.role==='patient'&&e.patientId!==user.patient_id)fail(404,'Record not found');return e;};
 const get=(user,id,kind)=>{const e=scoped(user,store.get(id));const row=db.prepare('SELECT kind FROM entities WHERE id=?').get(id);if(row.kind!==kind)fail(404,'Record not found');return e;};
 const visible=(user,kind)=>store.list(kind).filter(e=>user.role!=='patient'||e.patientId===user.patient_id);
 const save=(kind,e,user,action,details={})=>{e.version++;store.save(kind,e);store.event(user.id,action,e.id,details);return e;};
 const balance=quote=>{
  const paid=store.list('payment').filter(p=>p.quoteId===quote.id).reduce((a,p)=>a+p.amount,0);
  const funded=store.list('finance').filter(f=>f.quoteId===quote.id&&f.status==='FUNDED').reduce((a,f)=>a+f.amount,0);
  return {paid,funded,remaining:quote.balance-paid-funded};
 };
 function command(user,path,body){
  if(path==='/api/patients'){
   roles(user,'admin','coordinator');const reference=text(body.reference,40);
   if(!/^Demo patient [A-Za-z0-9 -]{1,20}$/.test(reference))fail(400,'Use a fictional reference beginning with Demo patient');
   const id=randomUUID();const e={id,version:0,patientId:id,reference,contactConsent:false,created:new Date(clock()).toISOString()};return save('patient',e,user,'PATIENT_CREATED',{synthetic:true});
  }
  if(path==='/api/plans'){
   roles(user,'admin','coordinator','clinician');get(user,body.patientId,'patient');
   const c=CATALOG.find(c=>c.code===body.family);if(!c)fail(400,'Unknown treatment');
   const minutes=body.minutes,lab=body.lab;
   if(!Number.isFinite(minutes)||minutes<15||minutes>180||!Number.isFinite(lab)||lab<0||lab>1500)fail(400,'Unsupported model inputs');
   return save('plan',{id:randomUUID(),patientId:body.patientId,version:0,family:c.code,minutes,lab,status:'DRAFT',appointments:[],created:new Date(clock()).toISOString()},user,'PLAN_CREATED');
  }
  if(path==='/api/quotes'){
   roles(user,'admin','coordinator');const plan=get(user,body.planId,'plan');
   version(plan,body.planVersion);if(store.list('quote').some(q=>q.planId===plan.id&&q.accepted))fail(409,'An accepted estimate already exists for this plan');if(plan.status!=='APPROVED'&&plan.status!=='SCHEDULED')fail(409,'An approved active clinical plan is required');
   if(body.benefits!=='CURRENT')fail(409,'Current synthetic benefits verification is required');
   let priced;try{priced=estimate({...body,family:plan.family,minutes:plan.minutes,lab:plan.lab},model);}catch(e){fail(400,e.message);}
   const e={...priced,id:randomUUID(),patientId:plan.patientId,planId:plan.id,planVersion:plan.version,version:0,input:{family:plan.family,minutes:plan.minutes,lab:plan.lab,insurance:body.insurance,loyalty:body.loyalty,financing:body.financing,deposit:body.deposit},accepted:false,created:new Date(clock()).toISOString(),expires:new Date(clock()+POLICY.quoteDays*86400000).toISOString()};return save('quote',e,user,'QUOTE_'+priced.route,{model:model.version,policy:POLICY.version});
  }
  const match=path.match(/^\/api\/(patients|plans|quotes|finance)\/([^/]+)\/([a-z-]+)$/);if(!match)fail(404,'Unknown command');
  const [,plural,id,action]=match;const kind=({patients:'patient',plans:'plan',quotes:'quote',finance:'finance'})[plural];const e=get(user,id,kind);version(e,body.version);
  if(kind==='patient'&&action==='consent'){
   roles(user,'admin','coordinator','patient');if(typeof body.consent!=='boolean')fail(400,'Consent must be explicit');e.contactConsent=body.consent;return save(kind,e,user,'CONTACT_CONSENT_CHANGED',{consent:body.consent});
  }
  if(kind==='plan'){
   if(action==='approve'){
    roles(user,'clinician');if(e.status!=='DRAFT')fail(409,'Only a draft can be clinically approved');e.status='APPROVED';e.approvedBy=user.id;
   }else if(action==='schedule'){
    roles(user,'admin','coordinator','clinician');if(!['APPROVED','SCHEDULED'].includes(e.status))fail(409,'Plan is not schedulable');
    const when=Date.parse(body.when);if(!Number.isFinite(when)||when<clock())fail(400,'Use a future appointment date');
    const c=CATALOG.find(c=>c.code===e.family);if(e.appointments.length>=c.visits)fail(409,'All pathway visits are already scheduled');
    e.appointments.push({id:randomUUID(),when:new Date(when).toISOString(),status:'SCHEDULED'});e.status='SCHEDULED';
   }else if(action==='complete-visit'){
    roles(user,'clinician');if(e.status!=='SCHEDULED')fail(409,'Plan has no active appointments');
    const a=e.appointments.find(a=>a.id===body.appointmentId&&a.status==='SCHEDULED');if(!a)fail(409,'Appointment is not active');
    if(Date.parse(a.when)>clock())fail(409,'A future visit cannot be recorded as completed');a.status='COMPLETED';a.completedBy=user.id;a.completedAt=new Date(clock()).toISOString();
    if(e.appointments.length===CATALOG.find(c=>c.code===e.family).visits&&e.appointments.every(a=>a.status==='COMPLETED'))e.status='COMPLETED';
   }else if(action==='cancel'){
    roles(user,'clinician','coordinator','admin');if(['COMPLETED','CANCELLED'].includes(e.status))fail(409,'Plan is already terminal');
    if(store.list('finance').some(f=>['PENDING','OFFERED','ACCEPTED','FUNDED'].includes(f.status)&&store.get(f.quoteId)?.planId===e.id))fail(409,'Withdraw or refund active financing before cancelling the plan');
    e.status='CANCELLED';e.appointments=e.appointments.map(a=>a.status==='SCHEDULED'?{...a,status:'CANCELLED'}:a);
   }else fail(404,'Unknown plan command');
   return save(kind,e,user,'PLAN_'+action.toUpperCase());
  }
  if(kind==='quote'){
   if(action==='accept'){
    roles(user,'patient','coordinator');if(e.route!=='ISSUED'||e.accepted)fail(409,'Estimate cannot be accepted');if(clock()>=Date.parse(e.expires))fail(409,'Estimate expired');
    const plan=get(user,e.planId,'plan');if(['DRAFT','CANCELLED','COMPLETED'].includes(plan.status))fail(409,'Clinical plan is not active');
    if(store.list('quote').some(q=>q.id!==e.id&&q.planId===e.planId&&q.accepted))fail(409,'Another estimate is already accepted for this plan');
    if(body.consent!==true)fail(400,'Explicit estimate acceptance consent is required');e.accepted=true;e.acceptedAt=new Date(clock()).toISOString();e.acceptedBy=user.id;return save(kind,e,user,'ESTIMATE_ACCEPTED',{consent:true});
   }
   if(action==='review'){
    roles(user,'reviewer');if(e.route!=='REVIEW'||e.disposition)fail(409,'No open review');if(!['SOURCE_REWORK','POLICY_REVIEW'].includes(body.disposition))fail(400,'Choose a review disposition');
    e.disposition=body.disposition;return save(kind,e,user,'REVIEW_DISPOSITION',{disposition:body.disposition});
   }
   if(action==='payment'){
    roles(user,'coordinator','admin');if(!e.accepted)fail(409,'Accept the estimate first');if(!Number.isSafeInteger(body.amount)||body.amount<=0||body.amount>balance(e).remaining)fail(409,'Payment exceeds unpaid balance or is invalid');
    return save('payment',{id:randomUUID(),patientId:e.patientId,quoteId:e.id,version:0,amount:body.amount,synthetic:true,created:new Date(clock()).toISOString()},user,'SYNTHETIC_PAYMENT_RECORDED');
   }
   if(action==='finance'){
    roles(user,'patient','coordinator');if(!e.accepted||e.route!=='ISSUED')fail(409,'Accepted issued estimate required');
    if(body.consent!==true)fail(400,'Separate financing consent required');if(clock()>=Date.parse(e.expires))fail(409,'Estimate expired');
    const plan=get(user,e.planId,'plan');if(plan.status==='CANCELLED')fail(409,'Clinical plan is cancelled');
    const existing=store.list('finance').find(f=>f.quoteId===e.id&&!['DECLINED','WITHDRAWN','REFUNDED'].includes(f.status));if(existing)fail(409,'An application already exists');
    const amount=balance(e).remaining;if(amount<=0)fail(409,'No balance remains');
    return save('finance',{id:randomUUID(),patientId:e.patientId,quoteId:e.id,version:0,amount,status:'PENDING',synthetic:true,adapter:'local-simulator',consentedAt:new Date(clock()).toISOString(),created:new Date(clock()).toISOString()},user,'SIMULATED_APPLICATION_SUBMITTED',{consent:true});
   }
  }
  if(kind==='finance'){
   if(action==='provider-event'){
    roles(user,'admin');if(body.source!=='local-simulator')fail(400,'No live lender adapter is configured');
    const next=({offer:'OFFERED',decline:'DECLINED',fund:'FUNDED',refund:'REFUNDED'})[body.event];
    const valid=({PENDING:['OFFERED','DECLINED'],ACCEPTED:['FUNDED'],FUNDED:['REFUNDED']})[e.status]||[];
    if(!valid.includes(next))fail(409,'Out-of-order provider event');
    const quote=get(user,e.quoteId,'quote');if(next==='FUNDED'&&(balance(quote).remaining<e.amount||get(user,quote.planId,'plan').status==='CANCELLED'))fail(409,'Funding no longer matches active plan and balance');e.status=next;
   }else if(action==='accept-offer'){
    roles(user,'patient','coordinator');if(body.consent!==true)fail(400,'Separate simulated offer consent required');if(e.status!=='OFFERED')fail(409,'No offer available');e.status='ACCEPTED';
   }else if(action==='withdraw'){
    roles(user,'patient','coordinator');if(!['PENDING','OFFERED','ACCEPTED'].includes(e.status))fail(409,'Application cannot be withdrawn');e.status='WITHDRAWN';
   }else fail(404,'Unknown financing command');
   return save(kind,e,user,'SIMULATED_FINANCE_'+e.status,{synthetic:true});
  }
  fail(404,'Unknown command');
 }
 const headers={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'",'Cache-Control':'no-store'};
 const json=(res,status,data,extra={})=>{res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(data));};
 async function body(req){
  if(req.headers['content-type']?.split(';')[0]!=='application/json')fail(415,'Use application/json');
  let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>32768)fail(413,'Request too large');}
  try{const obj=JSON.parse(data);if(!obj||Array.isArray(obj)||typeof obj!=='object')throw Error();return obj;}catch{fail(400,'Invalid JSON object');}
 }
 const server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');const path=url.pathname;
   if(path==='/healthz'&&req.method==='GET')return json(res,200,{status:'ok',mode:'synthetic',database:db.prepare('SELECT 1 AS ok').get().ok===1,auditVerified:store.verify()});
   if(path.startsWith('/api/')){
    if(req.method!=='GET'&&req.method!=='POST')fail(405,'Method not allowed');
    const expected=options.publicOrigin||process.env.PUBLIC_ORIGIN||`http://${req.headers.host}`;
    if(req.headers.origin&&req.headers.origin!==expected)fail(403,'Origin is not authorized');
    if(path==='/api/login'&&req.method==='POST'){
     const b=await body(req);const ip=req.socket.remoteAddress;const now=clock();let attempts=loginAttempts.get(ip)||[];attempts=attempts.filter(t=>now-t<60000);loginAttempts.set(ip,attempts);
     if(attempts.length>=15)fail(429,'Too many sign-in attempts');attempts.push(now);
     const username=text(b.username,40);if(typeof b.password!=='string'||b.password.length>128)fail(401,'Invalid credentials');
     const u=db.prepare('SELECT * FROM users WHERE id=?').get(username);
     if(!u||!checkPassword(b.password,u.password))fail(401,'Invalid credentials');
     const token=randomBytes(32).toString('hex'),csrf=randomBytes(24).toString('hex');
     db.prepare('DELETE FROM sessions WHERE expires<=?').run(now);db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hash(token),u.id,csrf,now+8*3600000);
     store.event(u.id,'LOGIN','session');
     return json(res,200,{user:{id:u.id,role:u.role},csrf},{'Set-Cookie':`clarity_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.COOKIE_SECURE==='true'?'; Secure':''}`});
    }
    const token=(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith('clarity_session='))?.slice(16);
    const session=token&&db.prepare('SELECT s.*,u.role,u.patient_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE token=? AND expires>?').get(hash(token),clock());if(!session)fail(401,'Sign in required');
    const user={id:session.user_id,role:session.role,patient_id:session.patient_id};
    if(req.method==='GET'){
     if(path==='/api/session')return json(res,200,{user:{id:user.id,role:user.role},csrf:session.csrf});
     if(path==='/api/catalog')return json(res,200,{catalog:CATALOG,policy:POLICY,model});
     if(path==='/api/workspace')return json(res,200,{patients:visible(user,'patient'),plans:visible(user,'plan'),quotes:visible(user,'quote').map(q=>q.route==='ISSUED'?{...q,ledger:balance(q)}:q),finance:visible(user,'finance'),payments:visible(user,'payment')});
     if(path==='/api/audit'){roles(user,'admin','reviewer');return json(res,200,{verified:store.verify(),events:db.prepare('SELECT * FROM audit ORDER BY seq DESC LIMIT 500').all()});}
     const m=path.match(/^\/api\/quotes\/([^/]+)\/export$/);if(m){const q=get(user,m[1],'quote');return json(res,200,{syntheticOnly:true,quote:q,ledger:q.route==='ISSUED'?balance(q):null,events:db.prepare('SELECT time,actor,action,entity,details,digest FROM audit WHERE entity=? ORDER BY seq').all(q.id)});}
     fail(404,'API endpoint not found');
    }
    if(req.headers['x-csrf-token']!==session.csrf)fail(403,'CSRF token is required');
    if(path==='/api/logout'){db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));return json(res,200,{ok:true},{'Set-Cookie':'clarity_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});}
    const b=await body(req);const key=req.headers['idempotency-key'];if(typeof key!=='string'||!/^[\w-]{8,100}$/.test(key))fail(400,'Use an idempotency key of 8–100 characters');
    const payloadHash=hash(JSON.stringify([path,b]));
    const result=store.transaction(()=>{
     const prior=db.prepare('SELECT * FROM requests WHERE actor=? AND key=?').get(user.id,key);
     if(prior){if(prior.payload_hash!==payloadHash)fail(409,'Idempotency key reused with different command');return JSON.parse(prior.result);}
     const data=command(user,path,b);db.prepare('INSERT INTO requests VALUES(?,?,?,?)').run(user.id,key,payloadHash,JSON.stringify(data));return data;
    });return json(res,200,result);
   }
   if(req.method!=='GET'&&req.method!=='HEAD')fail(405,'Method not allowed');
   const relative=path==='/'?'index.html':decodeURIComponent(path.slice(1));
   if(!['index.html','app.mjs','engine.mjs','styles.css','model.json','cost-model.json','catalog.mjs','pricing.mjs','icons.mjs','studio-adapter.mjs','designer.html','designer.mjs','designer.css','design-screens.json','vendor/grapes.min.js','vendor/grapes.min.css','vendor/GRAPESJS-LICENSE.txt','vendor/version.json'].includes(relative))fail(404,'File not found');
   const file=join(ROOT,'dist',relative);if(!existsSync(file))fail(404,'File not found');
   const assetHeaders=relative==='designer.html'?{...headers,'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; frame-src 'self' blob:; frame-ancestors 'none'; form-action 'self'; base-uri 'self'"}:headers;
   res.writeHead(200,{...assetHeaders,'Content-Type':({'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'})[extname(file)]});res.end(req.method==='HEAD'?undefined:readFileSync(file));
  }catch(e){if(!res.headersSent)json(res,e.status||500,{error:e.status?e.message:'Internal server error'});else res.end();if(!e.status)console.error(e.message);}
 });
 return {server,store,close:async()=>{await new Promise(resolve=>server.close(resolve));db.close();}};
}
