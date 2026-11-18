/* Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah. */
export const WORKSPACES={
 coordinator:{name:'Nursing & coordination',short:'Care team',title:'A clear next step for every patient.',description:'Prepare the patient, coordinate care and keep the journey moving.',focus:'Your patient worklist',icon:'users',pages:['overview','crm','plans','approvals','quotes','finance','status']},
 clinician:{name:'Dentist / clinician',short:'Clinical workspace',title:'Clinical decisions, with the context you need.',description:'Review treatment plans, approve appropriate care and complete due visits.',focus:'Your clinical worklist',icon:'tooth',pages:['overview','crm','plans','approvals','quotes','evidence','status']},
 reviewer:{name:'Pricing & risk reviewer',short:'Review workspace',title:'Every exception deserves a clear decision.',description:'Inspect the evidence and route pricing exceptions to the right owner.',focus:'Your review worklist',icon:'shield',pages:['overview','approvals','quotes','evidence','status']},
 admin:{name:'Executive / director',short:'Executive workspace',title:'The whole journey. A clear line of sight.',description:'See delivery readiness, approval ownership and unresolved decisions in one place.',focus:'Leadership attention',icon:'grid',pages:['overview','approvals','crm','plans','quotes','finance','evidence','status']},
 patient:{name:'Patient',short:'My care',title:'Your care. Your choices. Clearly explained.',description:'See your treatment plan, understand your estimate and choose your next step.',focus:'Your next steps',icon:'tooth',pages:['overview','plans','quotes','finance','status']}
};
export const PAGE_LABELS={overview:'My workspace',crm:'Patient records',plans:'Treatment plans',approvals:'Approval center',quotes:'Pricing & estimates',finance:'Financing',evidence:'AI & governance',status:'Project details'};
export const workspaceFor=role=>WORKSPACES[role]||WORKSPACES.coordinator;
export function summarize(w,now=Date.now()){
 const activePlans=w.plans.filter(p=>!['CANCELLED','COMPLETED'].includes(p.status));
 const validQuotes=w.quotes.filter(q=>q.route==='ISSUED'&&Date.parse(q.expires)>now&&activePlans.some(p=>p.id===q.planId));
 return {activePlans,drafts:activePlans.filter(p=>p.status==='DRAFT'),approved:activePlans.filter(p=>['APPROVED','SCHEDULED'].includes(p.status)),reviews:w.quotes.filter(q=>q.route==='REVIEW'&&!q.disposition),consents:validQuotes.filter(q=>!q.accepted),accepted:validQuotes.filter(q=>q.accepted),offers:w.finance.filter(f=>f.status==='OFFERED'),pending:w.finance.filter(f=>f.status==='PENDING'),readyFunding:w.finance.filter(f=>f.status==='ACCEPTED'),funded:w.finance.filter(f=>f.status==='FUNDED'),appointments:activePlans.flatMap(p=>(p.appointments||[]).filter(a=>a.status==='SCHEDULED').map(a=>({...a,planId:p.id,patientId:p.patientId,family:p.family}))).sort((a,b)=>Date.parse(a.when)-Date.parse(b.when)),balance:w.quotes.filter(q=>q.route==='ISSUED').reduce((n,q)=>n+q.ledger.remaining,0)};
}
export function worklist(w,role,now=Date.now()){
 const s=summarize(w,now),out=[],task=(kind,id,patientId,family,title,owner,action,page,priority='Routine')=>out.push({kind,id,patientId,family,title,owner,action,page,priority});
 if(['coordinator','clinician','admin'].includes(role))s.drafts.forEach(p=>task('plan',p.id,p.patientId,p.family,'Treatment plan awaiting clinical review','Dentist / clinician',role==='clinician'?'Review plan':'View handoff','plans','Review needed'));
 if(role==='coordinator'){
  w.patients.filter(p=>!p.contactConsent).forEach(p=>task('patient',p.id,p.id,null,'Contact permission needs confirmation','Patient / care team','Open patient','crm','Consent needed'));
  s.approved.filter(p=>!(p.appointments||[]).some(a=>a.status==='SCHEDULED')).forEach(p=>task('plan',p.id,p.patientId,p.family,'Coordinate the next appointment','Nursing / coordination','Schedule visit','plans'));
 }
 if(role==='clinician')s.appointments.filter(a=>Date.parse(a.when)<=now).forEach(a=>task('plan',a.planId,a.patientId,a.family,'Scheduled visit is due for completion','Dentist / clinician','Review visit','plans','Due'));
 if(['reviewer','admin','coordinator'].includes(role))s.reviews.forEach(q=>task('quote',q.id,q.patientId,q.input.family,'Pricing exception requires review','Pricing & risk reviewer',role==='reviewer'?'Review exception':'Inspect exception','quotes','Blocked'));
 if(['patient','coordinator'].includes(role)){
  s.consents.forEach(q=>task('quote',q.id,q.patientId,q.input.family,'Review your itemized treatment estimate','Patient','Review estimate','quotes','Consent needed'));
  s.offers.forEach(f=>task('finance',f.id,f.patientId,null,'A financing offer is ready to review','Patient','Review offer','finance','Consent needed'));
 }
 if(role==='admin'){
  s.pending.forEach(f=>task('finance',f.id,f.patientId,null,'Financing submission awaits provider response','Financing provider','View application','finance'));
  s.readyFunding.forEach(f=>task('finance',f.id,f.patientId,null,'Accepted offer awaits funding event','Financing provider','View settlement','finance'));
 }
 return out;
}
