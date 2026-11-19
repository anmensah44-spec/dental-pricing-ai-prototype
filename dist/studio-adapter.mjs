/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
Browser workspace adapter for the interactive design studio. Server mode uses the authenticated API.
*/
import {CATALOG,POLICY} from './catalog.mjs';
import {estimate} from './pricing.mjs';
import {createVerification,requireVerification,assertQuoteCoverage} from './insurance.mjs';
const ROLES={coordinator:'coordinator',dentist:'clinician',reviewer:'reviewer',director:'admin',patient:'patient'};
export function createStudioAdapter(model,storage,clock=()=>Date.now()){
 const KEY='clarity-design-workspace-v4-insurance';let db;
 const stamp=()=>new Date(clock()).toISOString();
 const event=(action,id)=>db.events.unshift({seq:db.events.length+1,time:stamp(),actor:db.username,action,entity:id});
 const persist=()=>{try{storage?.setItem(KEY,JSON.stringify(db));}catch{}};
 function seed(){
  db={schema:4,username:'coordinator',patients:[],plans:[],quotes:[],finance:[],payments:[],insurance:[],events:[]};
  for(let i=1;i<=3;i++)db.patients.push({id:`patient-00${i}`,patientId:`patient-00${i}`,reference:`Demo patient 00${i}`,version:1,contactConsent:i!==2,created:stamp()});
  const configs=[['CROWN01','APPROVED','patient-001'],['PERIO','DRAFT','patient-002'],['IMPLANT','APPROVED','patient-003'],['FILL01','APPROVED','patient-002'],['EXAM','APPROVED','patient-003']];
  configs.forEach(([family,status,patientId],i)=>{const c=CATALOG.find(c=>c.code===family);db.plans.push({id:`plan-${i+1}`,patientId,family,minutes:i===4?180:c.minutes,lab:i===4?1500:c.lab,status,version:2,appointments:[],created:stamp(),approvedBy:status==='APPROVED'?'dentist':null});});
  for(const [i,planId,insurance,accepted] of [[1,'plan-1',true,true],[2,'plan-4',false,false],[3,'plan-5',false,false]]){
   const p=db.plans.find(p=>p.id===planId),input={family:p.family,minutes:p.minutes,lab:p.lab,deposit:i===1?10000:0,insurance,loyalty:false,financing:i===1};
   if(insurance){const v=createVerification({payer:'Aetna Dental',memberSuffix:'0044',serviceDate:stamp().slice(0,10),source:'sample-active'},{...p,reference:CATALOG.find(c=>c.code===p.family).reference},{now:clock(),id:'verification-1'});db.insurance.push(v);input.benefitsRecord=v;}
   const q={...estimate(input,model,clock()),id:`quote-${i}`,planId,patientId:p.patientId,planVersion:p.version,version:accepted?2:1,input,accepted,created:stamp(),expires:new Date(clock()+14*86400000).toISOString()};db.quotes.push(q);event('QUOTE_'+q.route,q.id);
  }
  db.finance.push({id:'finance-1',patientId:'patient-001',quoteId:'quote-1',amount:db.quotes.find(q=>q.id==='quote-1').balance,status:'OFFERED',version:2,adapter:'local-simulator',created:stamp()});event('WORKSPACE_LOADED','workspace');persist();
 }
 try{db=JSON.parse(storage?.getItem(KEY));if(db?.schema!==4||!Array.isArray(db.plans)||!ROLES[db.username])seed();}catch{seed();}
 const check=(condition,message)=>{if(!condition)throw Error(message);};
 const role=()=>ROLES[db.username];
 const allowed=(...roles)=>check(roles.includes(role()),'Switch to the appropriate role to perform this action.');
 const scoped=e=>{check(e,'Record not found');check(role()!=='patient'||e.patientId==='patient-001','Record not found');return e;};
 const get=(kind,id)=>scoped(db[kind].find(e=>e.id===id));
 const ledger=q=>{const paid=db.payments.filter(p=>p.quoteId===q.id).reduce((s,p)=>s+p.amount,0),funded=db.finance.filter(f=>f.quoteId===q.id&&f.status==='FUNDED').reduce((s,f)=>s+f.amount,0);return {paid,funded,remaining:q.balance-paid-funded};};
 const state=()=>Object.fromEntries(['patients','plans','quotes','finance','payments','insurance'].map(kind=>[kind,db[kind].filter(e=>role()!=='patient'||e.patientId==='patient-001').map(e=>kind==='quotes'&&e.route==='ISSUED'?{...e,ledger:ledger(e)}:{...e})]));
 async function request(path,b){
  if(path==='/api/session')return {user:{id:db.username,role:role()},csrf:'studio'};
  if(path==='/api/login'){check(ROLES[b.username],'Unknown role');db.username=b.username;persist();return {user:{id:db.username,role:role()},csrf:'studio'};}
  if(path==='/api/logout')return {ok:true};
  if(path==='/api/catalog')return {catalog:CATALOG,policy:POLICY,model};
  if(path==='/api/workspace')return structuredClone(state());
  if(path==='/api/audit'){allowed('admin','reviewer');return {verified:false,storage:'browser',events:structuredClone(db.events)};}
  if(path==='/api/studio/reset'){seed();return {ok:true};}
  const exp=path.match(/^\/api\/quotes\/([^/]+)\/export$/);if(exp){const q=get('quotes',exp[1]);return {environment:'browser-studio',quote:q,ledger:q.route==='ISSUED'?ledger(q):null,events:db.events.filter(e=>e.entity===q.id)};}
  let e,kind,action;
  if(path==='/api/patients'){allowed('admin','coordinator');check(/^Demo patient [A-Za-z0-9 -]{1,20}$/.test(b.reference),'Use a sample patient reference');e={id:crypto.randomUUID(),patientId:'',reference:b.reference,contactConsent:false,version:1,created:stamp()};e.patientId=e.id;db.patients.unshift(e);event('PATIENT_CREATED',e.id);persist();return structuredClone(e);}
  if(path==='/api/plans'){allowed('admin','coordinator','clinician');get('patients',b.patientId);check(CATALOG.some(c=>c.code===b.family),'Choose a treatment');check(Number.isFinite(b.minutes)&&b.minutes>=15&&b.minutes<=180&&Number.isFinite(b.lab)&&b.lab>=0&&b.lab<=1500,'Inputs outside model support');e={...b,id:crypto.randomUUID(),version:1,status:'DRAFT',appointments:[],created:stamp()};db.plans.unshift(e);event('PLAN_CREATED',e.id);persist();return structuredClone(e);}
  if(path==='/api/insurance'){allowed('admin','coordinator');const p=get('plans',b.planId);const v=createVerification(b,{...p,reference:CATALOG.find(c=>c.code===p.family).reference},{now:clock(),actor:db.username});db.insurance.push(v);event('INSURANCE_'+v.status,v.id);persist();return structuredClone(v);}
  if(path==='/api/quotes'){
   allowed('admin','coordinator');const p=get('plans',b.planId);check(p.version===b.planVersion,'Refresh the clinical plan');check(['APPROVED','SCHEDULED'].includes(p.status),'Clinical approval is required');check(!db.quotes.some(q=>q.planId===p.id&&q.accepted),'A plan already has an accepted estimate');check(b.benefits==='CURRENT','Refresh benefits before pricing');
   const v=b.insurance?db.insurance.filter(v=>v.planId===p.id).at(-1):null;if(b.insurance){check(v?.id===b.verificationId,'Select the latest insurance verification');requireVerification(v,p,clock());}
   const input={family:p.family,minutes:p.minutes,lab:p.lab,deposit:b.deposit,insurance:b.insurance,loyalty:b.loyalty,financing:b.financing,benefitsRecord:v};e={...estimate(input,model,clock()),id:crypto.randomUUID(),patientId:p.patientId,planId:p.id,planVersion:p.version,version:1,input,accepted:false,created:stamp(),expires:new Date(clock()+14*86400000).toISOString()};db.quotes.unshift(e);event('QUOTE_'+e.route,e.id);persist();return structuredClone(e);
  }
  const m=path.match(/^\/api\/(patients|plans|quotes|finance)\/([^/]+)\/([a-z-]+)$/);check(m,'Unknown operation');[,kind,,action]=m;e=get(kind,m[2]);check(e.version===b.version,'This record changed. Refresh and try again.');
  if(kind==='patients'&&action==='consent'){allowed('admin','coordinator','patient');check(typeof b.consent==='boolean','Record consent explicitly');e.contactConsent=b.consent;}
  else if(kind==='plans'){
   if(action==='approve'){allowed('clinician');check(e.status==='DRAFT','Only a draft can be approved');e.status='APPROVED';e.approvedBy=db.username;}
   else if(action==='schedule'){allowed('admin','coordinator','clinician');check(['APPROVED','SCHEDULED'].includes(e.status),'Approve the plan first');check(Number.isFinite(Date.parse(b.when))&&Date.parse(b.when)>clock(),'Choose a future appointment');check(e.appointments.length<CATALOG.find(c=>c.code===e.family).visits,'All visits are already scheduled');e.appointments.push({id:crypto.randomUUID(),when:b.when,status:'SCHEDULED'});e.status='SCHEDULED';}
   else if(action==='complete-visit'){allowed('clinician');const a=e.appointments.find(a=>a.id===b.appointmentId);check(a?.status==='SCHEDULED'&&Date.parse(a.when)<=clock(),'Visit must be due and scheduled');a.status='COMPLETED';if(e.appointments.length===CATALOG.find(c=>c.code===e.family).visits&&e.appointments.every(a=>a.status==='COMPLETED'))e.status='COMPLETED';}
   else if(action==='cancel'){allowed('admin','coordinator','clinician');check(!['CANCELLED','COMPLETED'].includes(e.status),'Plan already closed');check(!db.finance.some(f=>db.quotes.find(q=>q.id===f.quoteId)?.planId===e.id&&['PENDING','OFFERED','ACCEPTED','FUNDED'].includes(f.status)),'Withdraw or refund financing first');e.status='CANCELLED';e.appointments.forEach(a=>{if(a.status==='SCHEDULED')a.status='CANCELLED';});}
   else throw Error('Unknown plan action');
  }else if(kind==='quotes'){
   if(action==='supersede'){allowed('admin','coordinator');check(e.route==='ISSUED','Only an issued estimate can be replaced');check(!db.finance.some(f=>f.quoteId===e.id&&!['DECLINED','WITHDRAWN','REFUNDED'].includes(f.status))&&ledger(e).paid===0,'Withdraw or reconcile financing and payments before replacement');e.accepted=false;e.route='SUPERSEDED';}
   else if(action==='accept'){allowed('patient','coordinator');assertQuoteCoverage(e,db.insurance,db.plans,clock());check(e.route==='ISSUED'&&!e.accepted,'Estimate cannot be accepted');check(b.consent===true,'Separate consent is required');check(clock()<Date.parse(e.expires),'Estimate expired');check(!['CANCELLED','COMPLETED','DRAFT'].includes(get('plans',e.planId).status),'Plan is not active');check(!db.quotes.some(q=>q.id!==e.id&&q.planId===e.planId&&q.accepted),'Another estimate is accepted');e.accepted=true;}
   else if(action==='review'){allowed('reviewer');check(e.route==='REVIEW'&&!e.disposition,'No open review');check(['SOURCE_REWORK','POLICY_REVIEW'].includes(b.disposition),'Choose disposition');e.disposition=b.disposition;}
   else if(action==='payment'){allowed('coordinator','admin');check(e.accepted&&Number.isSafeInteger(b.amount)&&b.amount>0&&b.amount<=ledger(e).remaining,'Payment must fit the accepted unpaid balance');const payment={id:crypto.randomUUID(),patientId:e.patientId,quoteId:e.id,amount:b.amount,version:1,created:stamp()};db.payments.unshift(payment);event('PAYMENT_RECORDED',e.id);persist();return payment;}
   else if(action==='finance'){allowed('patient','coordinator');assertQuoteCoverage(e,db.insurance,db.plans,clock());check(e.accepted&&b.consent===true,'Accepted estimate and separate consent required');check(clock()<Date.parse(e.expires),'Estimate expired');check(get('plans',e.planId).status!=='CANCELLED','Plan cancelled');check(!db.finance.some(f=>f.quoteId===e.id&&!['DECLINED','WITHDRAWN','REFUNDED'].includes(f.status)),'Application already exists');const amount=ledger(e).remaining;check(amount>0,'No unpaid balance');const f={id:crypto.randomUUID(),patientId:e.patientId,quoteId:e.id,amount,status:'PENDING',version:1,adapter:'local-simulator',created:stamp()};db.finance.unshift(f);event('FINANCE_SUBMITTED',f.id);persist();return f;}
   else throw Error('Unknown quote action');
  }else if(kind==='finance'){
   if(action==='accept-offer'){allowed('patient','coordinator');check(e.status==='OFFERED'&&b.consent===true,'Offer and separate consent required');e.status='ACCEPTED';}
   else if(action==='withdraw'){allowed('patient','coordinator');check(['PENDING','OFFERED','ACCEPTED'].includes(e.status),'Cannot withdraw this application');e.status='WITHDRAWN';}
   else if(action==='provider-event'){allowed('admin');check(b.source==='local-simulator','Choose the sandbox adapter');const next={offer:'OFFERED',decline:'DECLINED',fund:'FUNDED',refund:'REFUNDED'}[b.event];check(({PENDING:['OFFERED','DECLINED'],ACCEPTED:['FUNDED'],FUNDED:['REFUNDED']})[e.status]?.includes(next),'Event is out of sequence');if(next==='FUNDED'){const q=get('quotes',e.quoteId);assertQuoteCoverage(q,db.insurance,db.plans,clock());check(ledger(q).remaining>=e.amount&&get('plans',q.planId).status!=='CANCELLED','Balance or care plan changed');}e.status=next;}
   else throw Error('Unknown financing action');
  }else throw Error('Unknown operation');
  e.version++;event(`${kind.toUpperCase()}_${action.toUpperCase()}`,e.id);persist();return structuredClone(e);
 }
 return {request,reset:seed};
}
