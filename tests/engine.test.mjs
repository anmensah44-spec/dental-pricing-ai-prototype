/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
*/
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {price,predict,rate,financeState} from '../dist/engine.mjs';
const model=JSON.parse(readFileSync(new URL('../dist/model.json',import.meta.url)));const input={family:'CROWN01',minutes:75,lab:280,deposit:0,approved:true,stale:false,insurance:false,loyalty:false,financing:false};
test('basis point arithmetic rounds ties half up in cents',()=>{assert.equal(rate(101,5000),51);assert.equal(rate(470000,300),14100);});
test('clinical approval and freshness cannot be bypassed',()=>{assert.equal(price({...input,approved:false},model).code,'PLAN_UNAPPROVED');assert.equal(price({...input,stale:true},model).code,'STALE_SOURCE');});
test('unsupported model configurations route review',()=>{assert.equal(price({...input,minutes:111},model).code,'UNSUPPORTED');assert.equal(price({...input,family:'IMPLANT'},model).code,'UNSUPPORTED');});
test('self pay result respects exact balance and risk margin',()=>{const r=price(input,model);assert.equal(r.route,'ISSUED');assert.equal(r.patient+r.payer,r.net);assert.equal(r.balance+r.deposit,r.patient);assert.ok(r.gross>=171000&&r.gross<=189000);assert.ok((r.net-r.cost.upper-r.fee)/r.net>=.30);});
test('infeasible self pay treatment cannot loosen price cap',()=>{assert.equal(price({...input,family:'FILL01',lab:0,minutes:110},model).code,'INFEASIBLE');});
test('loyalty applied once and exact net preserved',()=>{const r=price({...input,loyalty:true},model);assert.equal(r.discount,rate(r.gross,500));assert.equal(r.gross-r.discount,r.net);});
test('payer contract is fixed and incompatible loyalty withheld',()=>{const r=price({...input,insurance:true,loyalty:true},model);assert.equal(r.gross,180000);assert.equal(r.discount,0);assert.equal(r.payer,50000);});
test('financing expense applies to remaining balance after payer and deposit',()=>{const r=price({...input,insurance:true,deposit:10000,financing:true},model);assert.equal(r.fee,rate(r.balance,300));});
test('overpayment and invalid deposit do not create negative funding',()=>{assert.equal(price({...input,deposit:999999},model).code,'DEPOSIT_EXCESS');assert.throws(()=>price({...input,deposit:-1},model));});
test('calibrated upper bound exceeds prediction; deterministic predictions',()=>{const p=predict(model,input);assert.ok(p.upper>p.mean);assert.deepEqual(p,predict(model,input));});
test('financing states represent simulator workflow not automatic credit qualification',()=>{assert.equal(financeState('submitted'),'PENDING');assert.equal(financeState('offer'),'SIMULATED_OFFER');assert.equal(financeState('unknown'),'NOT_STARTED');});
test('unsafe deposit integers and fractional cents are rejected',()=>{
 for(const deposit of [NaN,Infinity,0.5,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>price({...input,deposit},model));
});
test('corrupted artifacts cannot issue a quote',()=>{
 for(const bad of [null,{...model,coefficients:[1,2,3]}, {...model,coefficients:[1,NaN,3,4]}, {...model,interval_radius_usd:-1}])assert.equal(price(input,bad).route,'REVIEW');
});
test('boundary support and incompatible feature combinations fail closed',()=>{
 for(const patch of [{minutes:24.99},{minutes:110.01},{lab:421},{lab:-1},{family:'FILL01',lab:1},{minutes:NaN}])assert.equal(price({...input,...patch},model).code,'UNSUPPORTED');
});
test('scenario sweep reconciles every issued result and enforces all self-pay constraints',()=>{
 let issued=0,review=0;
 for(const family of ['FILL01','CROWN01'])for(const minutes of [25,50,75,110])for(const insurance of [false,true])for(const loyalty of [false,true])for(const financing of [false,true])for(const deposit of [0,10000]){
  const r=price({...input,family,minutes,lab:family==='FILL01'?0:280,insurance,loyalty,financing,deposit},model);
  if(r.route==='REVIEW'){review++;assert.ok(['INFEASIBLE','DEPOSIT_EXCESS'].includes(r.code));continue;}
  issued++;assert.equal(r.net,r.payer+r.patient);assert.equal(r.patient,r.deposit+r.balance);assert.ok(r.balance>=0);assert.equal(r.fee,financing?rate(r.balance,300):0);
  assert.equal(r.discount,loyalty&&!insurance?rate(r.gross,500):0);
  if(!insurance){assert.ok(r.gross>=r.reference-rate(r.reference,500));assert.ok(r.gross<=r.reference+rate(r.reference,500));assert.ok(BigInt(r.net-r.cost.upper-r.fee)*10000n>=BigInt(r.net)*3000n);}
  else assert.equal(r.gross,r.reference);
 }
 assert.ok(issued>0&&review>0);
});
