/* Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createStudioAdapter} from '../dist/studio-adapter.mjs';
import {summarize,worklist,workspaceFor} from '../dist/workspaces.mjs';
const model=JSON.parse(readFileSync(new URL('../dist/cost-model.json',import.meta.url)));
const make=()=>createStudioAdapter(model,null,()=>Date.parse('2026-11-18T12:00:00Z'));
test('clinical handoff clears after authorized approval and executive cannot approve it',async()=>{
 const a=make();await a.request('/api/login',{username:'director'});let w=await a.request('/api/workspace'),p=w.plans.find(p=>p.status==='DRAFT');
 await assert.rejects(()=>a.request(`/api/plans/${p.id}/approve`,{version:p.version}),/role/i);
 assert.ok(worklist(w,'admin').some(t=>t.id===p.id&&t.owner==='Dentist / clinician'));
 await a.request('/api/login',{username:'dentist'});await a.request(`/api/plans/${p.id}/approve`,{version:p.version});w=await a.request('/api/workspace');
 assert.ok(!worklist(w,'clinician').some(t=>t.id===p.id));
});
test('patient workspace excludes internal review routes and unrelated patient tasks',async()=>{
 const a=make();await a.request('/api/login',{username:'patient'});const w=await a.request('/api/workspace');
 assert.ok(!workspaceFor('patient').pages.includes('approvals'));assert.ok(!workspaceFor('patient').pages.includes('evidence'));
 for(const t of worklist(w,'patient'))assert.equal(t.patientId,'patient-001');
 assert.ok(!worklist(w,'patient').some(t=>t.priority==='Blocked'));
});
test('expired or cancelled treatment estimates never appear as patient consent tasks',async()=>{
 const a=make(),w=await a.request('/api/workspace'),q=w.quotes.find(q=>q.route==='ISSUED'&&!q.accepted);
 assert.ok(worklist(w,'patient',Date.parse('2026-11-18T12:00:00Z')).some(t=>t.id===q.id));
 q.expires='2026-01-01T00:00:00Z';assert.ok(!worklist(w,'patient').some(t=>t.id===q.id));
 q.expires='2099-01-01T00:00:00Z';w.plans.find(p=>p.id===q.planId).status='CANCELLED';assert.ok(!summarize(w).consents.some(x=>x.id===q.id));
});
test('reviewer handoff closes after disposition while pricing remains blocked',async()=>{
 const a=make();await a.request('/api/login',{username:'reviewer'});let w=await a.request('/api/workspace'),q=w.quotes.find(q=>q.route==='REVIEW');
 assert.equal(worklist(w,'reviewer').length,1);await a.request(`/api/quotes/${q.id}/review`,{version:q.version,disposition:'SOURCE_REWORK'});w=await a.request('/api/workspace');
 assert.equal(worklist(w,'reviewer').length,0);assert.equal(w.quotes.find(x=>x.id===q.id).route,'REVIEW');
});
