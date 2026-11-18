# Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
# AI-assisted implementation developed under his direction.
"""Synthetic multi-treatment model; not calibrated for any actual dental practice."""
from pathlib import Path
import numpy as np
import json,hashlib
rng=np.random.default_rng(20261118)
codes=['EXAM','CLEAN','FILL01','CROWN01','ROOT','EXTRACT','SURGERY','IMPLANT','BRIDGE','DENTURE','PERIO','ORTHO','WHITEN','GUARD','PEDIATRIC','EMERGENCY']
# Fictional category intercepts, minutes and lab effects; no actual practice data.
base=np.array([12,15,30,125,180,50,110,320,200,180,90,420,80,50,10,25])
k=len(codes);count=300;family=np.repeat(np.arange(k),count);n=len(family)
minutes=rng.uniform(15,180,n);lab=rng.uniform(0,1500,n)
x=np.column_stack([np.eye(k)[family],minutes,lab]);y=base[family]+1.65*minutes+.65*lab+rng.normal(0,12,n)
train=np.concatenate([np.arange(i*count,i*count+180) for i in range(k)])
cal=np.concatenate([np.arange(i*count+180,i*count+240) for i in range(k)])
test=np.concatenate([np.arange(i*count+240,(i+1)*count) for i in range(k)])
coef=np.linalg.solve(x[train].T@x[train]+np.eye(k+2)*.01,x[train].T@y[train])
radius=float(np.quantile(abs(y[cal]-x[cal]@coef),.90,method='higher'));pred=x[test]@coef
artifact={'version':'synthetic-multifamily-ridge-2','families':codes,'coefficients':coef.tolist(),'interval_radius_usd':radius,'seed':20261118,'training_rows':len(train),'calibration_rows':len(cal),'test_rows':len(test),'synthetic_only':True}
Path('dist/cost-model.json').write_text(json.dumps(artifact,indent=2)+'\n')
report={'model':artifact['version'],'data_kind':'synthetic only','mae_usd':float(abs(y[test]-pred).mean()),'coverage':float((abs(y[test]-pred)<=radius).mean()),'baseline_mae_usd':float(abs(y[test]-y[train].mean()).mean()),'family_metrics':{}}
for i,code in enumerate(codes):
 mask=family[test]==i
 report['family_metrics'][code]={'rows':int(mask.sum()),'mae_usd':float(abs(y[test][mask]-pred[mask]).mean()),'coverage':float((abs(y[test][mask]-pred[mask])<=radius).mean())}
Path('evidence/multifamily_evaluation.json').write_text(json.dumps(report,indent=2)+'\n')
# Archive arrays for independent fit verification. Portable text with explicit split.
parts=np.full(n,'train',dtype='<U11');parts[cal]='calibration';parts[test]='test'
import csv
with Path('evidence/multifamily_data.csv').open('w',newline='') as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['split','family','minutes','lab','cost'])
 for a,b,c,d,e in zip(parts,family,minutes,lab,y):w.writerow([a,codes[b],format(c,'.17g'),format(d,'.17g'),format(e,'.17g')])
Path('evidence/multifamily_manifest.json').write_text(json.dumps({'sha256':hashlib.sha256(Path('evidence/multifamily_data.csv').read_bytes()).hexdigest(),'synthetic_only':True,'rows':n},indent=2)+'\n')
print(json.dumps({key:report[key] for key in ['model','mae_usd','coverage','baseline_mae_usd']}))
