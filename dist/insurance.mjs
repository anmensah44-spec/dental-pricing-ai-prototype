/* Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah. */
import {rate} from './engine.mjs';
export const PAYERS=['Aetna Dental','Blue Cross Blue Shield Dental','Delta Dental','Cigna Dental','Other dental payer'];
export const INSURANCE_TTL=24*60*60*1000;
const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
const cents=(n,label)=>{if(!Number.isSafeInteger(n)||n<0||n>100000000)throw Error(`Invalid ${label}`);return n;};
export function createVerification(body,plan,{now=Date.now(),id=crypto.randomUUID(),actor='coordinator'}={}){
 if(!PAYERS.includes(body.payer))throw Error('Choose a dental payer');
 if(!validDate(body.serviceDate))throw Error('Choose a valid service date');
 const day=new Date(now).toISOString().slice(0,10);if(body.serviceDate<day)throw Error('Service date cannot be in the past');
 if(!['sample-active','sample-incomplete','sample-inactive','manual'].includes(body.source))throw Error('Choose an evidence source');
 if(typeof body.memberSuffix!=='string'||!/^[A-Za-z0-9]{4}$/.test(body.memberSuffix))throw Error('Enter only the last four member ID characters');
 const manual=body.source==='manual';
 if(manual&&(body.attested!==true||typeof body.sourceReference!=='string'||body.sourceReference.trim().length<5||body.sourceReference.length>120))throw Error('Record the source reference and attest to verified benefits');
 const status=body.source==='sample-inactive'?'INACTIVE':body.source==='sample-incomplete'?'REVIEW':'VERIFIED';
 const allowedAmount=manual?cents(body.allowedAmount,'allowed amount'):Math.round(plan.reference*.85);
 const deductibleRemaining=manual?cents(body.deductibleRemaining,'deductible'):10000;
 const annualRemaining=manual?cents(body.annualRemaining,'annual remaining maximum'):100000;
 const coverageBps=manual?body.coverageBps:5000;
 if(!Number.isInteger(coverageBps)||coverageBps<0||coverageBps>10000)throw Error('Coverage must be 0–100 percent');
 return {id,patientId:plan.patientId,planId:plan.id,family:plan.family,version:1,payer:body.payer,memberSuffix:body.memberSuffix,serviceDate:body.serviceDate,status,network:'IN_NETWORK',allowedAmount,deductibleRemaining,annualRemaining,coverageBps,source:body.source,sourceReference:manual?body.sourceReference.trim():'Sample response · no payer request sent',verifiedBy:actor,verifiedAt:new Date(now).toISOString(),expiresAt:new Date(now+INSURANCE_TTL).toISOString(),issues:status==='REVIEW'?['Procedure restrictions require confirmation']:status==='INACTIVE'?['Coverage is inactive for this scenario']:[],scope:'Single primary in-network PPO benefit; restrictions reviewed for this treatment family',notGuaranteed:true};
}
export function requireVerification(v,plan,now=Date.now()){
 if(!v||v.patientId!==plan.patientId||v.planId!==plan.id||v.family!==plan.family)throw Error('Matching insurance verification is required');
 if(v.status!=='VERIFIED'||v.issues?.length)throw Error('Insurance verification needs resolution before pricing');
 if(!Number.isFinite(Date.parse(v.expiresAt))||Date.parse(v.expiresAt)<=now)throw Error('Insurance verification expired; reverify benefits');
 if(v.serviceDate<new Date(now).toISOString().slice(0,10))throw Error('Service date passed; reverify benefits');
 for(const k of ['allowedAmount','deductibleRemaining','annualRemaining'])cents(v[k],k);
 if(!Number.isInteger(v.coverageBps)||v.coverageBps<0||v.coverageBps>10000)throw Error('Invalid coverage percentage');
 return v;
}
export function insuranceAllocation(charge,v){
 cents(charge,'charge');const allowed=Math.min(charge,v.allowedAmount),adjustment=charge-allowed,deductible=Math.min(allowed,v.deductibleRemaining),eligible=allowed-deductible;
 const payer=Math.min(rate(eligible,v.coverageBps),v.annualRemaining),patient=allowed-payer;
 return {allowed,adjustment,deductible,payer,patient,coinsurance:eligible-rate(eligible,v.coverageBps),maximumShortfall:Math.max(0,rate(eligible,v.coverageBps)-payer)};
}
export function assertQuoteCoverage(q,records,plans,now=Date.now()){
 if(!q.input.insurance)return;
 const latest=records.filter(v=>v.planId===q.planId).at(-1);
 if(!q.insuranceSnapshot||latest?.id!==q.insuranceSnapshot.id)throw Error('Insurance changed; create and accept a refreshed estimate');
 requireVerification(latest,plans.find(p=>p.id===q.planId)||{},now);
}
export function insuranceExplanation(v){return v.status==='VERIFIED'?`${v.payer}: insurer share uses ${v.coverageBps/100}% of the allowed amount after the applicable deductible, capped by remaining benefits. Contractual adjustments are not patient charges. Final payment depends on claim adjudication.`:v.issues.join('. ');}
