/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
AI-assisted implementation developed under his direction.
*/
import {rate} from '../dist/engine.mjs';
import {CATALOG,POLICY} from './catalog.mjs';
export function decimalCents(value) {
  if(typeof value!=='string'||!/^\d{1,7}(\.\d{1,2})?$/.test(value))throw Error('Use a nonnegative USD amount with at most two decimals');
  const [whole,fraction='']=value.split('.');return Number(whole)*100+Number(fraction.padEnd(2,'0'));
}
export function estimate(input,model) {
  const c=CATALOG.find(c=>c.code===input.family);
  if(!c)throw Error('Unknown treatment');
  for(const key of ['insurance','loyalty','financing'])if(typeof input[key]!=='boolean')throw Error(`Invalid ${key}`);
  if(!Number.isFinite(input.minutes)||input.minutes<15||input.minutes>180||!Number.isFinite(input.lab)||input.lab<0||input.lab>1500||!Number.isSafeInteger(input.deposit)||input.deposit<0||input.deposit>100000000)throw Error('Inputs outside supported range');
  const index=model.families?.indexOf(c.code);
  if(!Number.isInteger(index)||index<0||!Array.isArray(model.coefficients)||model.coefficients.length!==CATALOG.length+2||!model.coefficients.every(Number.isFinite)||!Number.isFinite(model.interval_radius_usd)||model.interval_radius_usd<0)throw Error('Invalid model artifact');
  const mean=Math.round(Math.max(0,model.coefficients[index]+input.minutes*model.coefficients[CATALOG.length]+input.lab*model.coefficients[CATALOG.length+1])*100);
  const radius=model.interval_radius_usd*100;
  const cost={mean,lower:Math.max(0,Math.floor(mean-radius)),upper:Math.ceil(mean+radius)};
  const discountBps=input.loyalty&&!input.insurance?500:0;
  const target=c.reference-rate(c.reference,discountBps);
  const low=input.insurance?c.reference:c.reference-rate(c.reference,POLICY.movementBps);
  const high=input.insurance?c.reference:c.reference+rate(c.reference,POLICY.movementBps);
  let best;
  for(let gross=low;gross<=high;gross++){
    const discount=rate(gross,discountBps),net=gross-discount;
    const payer=input.insurance?Math.min(rate(Math.max(0,net-10000),8000),50000):0;
    const patient=net-payer;if(input.deposit>patient)continue;
    const balance=patient-input.deposit,fee=input.financing?rate(balance,POLICY.merchantBps):0;
    if(!input.insurance&&BigInt(net-cost.upper-fee)*10000n<BigInt(net)*BigInt(POLICY.marginBps))continue;
    const score=[Math.abs(net-target),Math.abs(gross-c.reference),net];
    if(!best||score.some((v,i)=>score.slice(0,i).every((x,k)=>x===best.score[k])&&v<best.score[i]))best={gross,discount,net,payer,patient,deposit:input.deposit,balance,fee,score};
  }
  if(!best)return {route:'REVIEW',code:input.deposit>high?'DEPOSIT_EXCESS':'INFEASIBLE',reason:'No permitted estimate satisfies the deposit and financial constraints',cost,policy:POLICY.version,model:model.version};
  return {route:'ISSUED',...best,cost,reference:c.reference,policy:POLICY.version,model:model.version};
}
