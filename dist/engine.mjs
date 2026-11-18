/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
*/
export const POLICY=Object.freeze({version:'DEMO-P1',marginBps:3000,movementBps:500,merchantBps:300,quoteDays:14});
export const money=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(c/100);
export function rate(cents,bps){if(!Number.isSafeInteger(cents)||cents<0||!Number.isSafeInteger(bps)||bps<0||bps>10000)throw Error('Invalid money or basis points');return Number((BigInt(cents)*BigInt(bps)+5000n)/10000n);}
export function predict(model,{family,minutes,lab}){if(!model||!Array.isArray(model.coefficients)||model.coefficients.length!==4||!model.coefficients.every(Number.isFinite)||!Number.isFinite(model.interval_radius_usd)||model.interval_radius_usd<0)throw Error('Invalid model artifact');if(!['FILL01','CROWN01'].includes(family)||!Number.isFinite(minutes)||minutes<25||minutes>110||!Number.isFinite(lab)||lab<0||lab>420)throw Error('Configuration outside model support');if(family==='FILL01'&&lab!==0)throw Error('Filling lab input must be zero');const xs=[1,Number(family==='CROWN01'),minutes,lab];const mean=Math.max(0,Math.round(xs.reduce((s,x,i)=>s+x*model.coefficients[i],0)*100));return {mean,upper:Math.ceil(mean+model.interval_radius_usd*100),lower:Math.max(0,Math.floor(mean-model.interval_radius_usd*100))};}
export function price(input,model){
 if(!input.approved)return {route:'REVIEW',reason:'Clinical approval required',code:'PLAN_UNAPPROVED'};
 if(input.stale)return {route:'REVIEW',reason:'Required benefits source is stale',code:'STALE_SOURCE'};
 if(!Number.isSafeInteger(input.deposit)||input.deposit<0)throw Error('Deposit must be nonnegative integer cents');
 let cost;try{cost=predict(model,input);}catch(e){return {route:'REVIEW',reason:e.message,code:'UNSUPPORTED'};}
 const reference=input.family==='CROWN01'?180000:28000;
 const low=input.insurance?reference:reference-rate(reference,POLICY.movementBps),high=input.insurance?reference:reference+rate(reference,POLICY.movementBps);
 let best=null;const discountBps=input.loyalty&&!input.insurance?500:0;const target=reference-rate(reference,discountBps);
 for(let gross=low;gross<=high;gross++){
  const discount=rate(gross,discountBps),net=gross-discount;
  const payer=input.insurance?Math.min(rate(net-Math.min(net,10000),8000),50000):0;
  const funded=Math.max(0,net-payer-input.deposit);
  const fee=input.financing?rate(funded,POLICY.merchantBps):0;
  const riskContribution=net-cost.upper-fee;
  if(!input.insurance&&BigInt(riskContribution)*10000n<BigInt(net)*BigInt(POLICY.marginBps))continue;
  const score=[Math.abs(net-target),Math.abs(gross-reference),net];
  if(!best||score.some((v,i)=>score.slice(0,i).every((x,k)=>x===best.score[k])&&v<best.score[i]))best={gross,discount,net,fee,score};
 }
 if(!best)return {route:'REVIEW',reason:'No permitted price satisfies the risk-adjusted margin floor',code:'INFEASIBLE',cost,reference};
 let payer=0;if(input.insurance){const deductible=Math.min(best.net,10000);payer=Math.min(rate(best.net-deductible,8000),50000);}
 const patient=best.net-payer;if(input.deposit>patient)return {route:'REVIEW',reason:'Deposit exceeds estimated patient responsibility',code:'DEPOSIT_EXCESS',cost};
 return {route:'ISSUED',...best,cost,payer,patient,deposit:input.deposit,balance:patient-input.deposit,reference,contribution:best.net-cost.mean-best.fee,policy:POLICY.version,model:model.version};
}
export function financeState(action){return ({submitted:'PENDING',offer:'SIMULATED_OFFER',decline:'SIMULATED_DECLINE',withdraw:'WITHDRAWAL_REQUESTED'})[action]??'NOT_STARTED';}
