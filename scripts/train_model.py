"""Reproducible ridge baseline trained ONLY on generated, synthetic dental cost data."""
from pathlib import Path
import json
import numpy as np
rng=np.random.default_rng(42);n=1400
crown=rng.integers(0,2,n);minutes=rng.uniform(25,110,n);lab=crown*rng.uniform(180,420,n)
X=np.column_stack([np.ones(n),crown,minutes,lab]);y=28+95*crown+2.8*minutes+1.08*lab+rng.normal(0,18,n)
train,cal,test=slice(0,900),slice(900,1150),slice(1150,None)
reg=np.diag([0,.01,.01,.01]);coef=np.linalg.solve(X[train].T@X[train]+reg,X[train].T@y[train])
res=np.abs(y[cal]-X[cal]@coef);bound=float(np.quantile(res,.90,method='higher'));pred=X[test]@coef
model={'version':'synthetic-ridge-1','features':['intercept','crown','chair_minutes','lab_cost_usd'],'coefficients':coef.tolist(),'interval_radius_usd':bound,'training_rows':900,'calibration_rows':250,'test_rows':250,'mae_usd':float(np.mean(abs(y[test]-pred))),'wape':float(np.sum(abs(y[test]-pred))/np.sum(y[test])),'interval_coverage':float(np.mean(abs(y[test]-pred)<=bound)),'seed':42,'data':'Generated synthetic data only; no clinical validation or real-world accuracy claim.'}
Path('dist/model.json').write_text(json.dumps(model,indent=2)+'\n');print(json.dumps({k:model[k] for k in ['mae_usd','wape','interval_coverage']}))

# Publish inspectable synthetic data and evaluation independently of UI metrics.
import hashlib, csv, platform
out=Path('evidence');out.mkdir(exist_ok=True)
with (out/'synthetic_costs.csv').open('w',newline='') as f:
    w=csv.writer(f);w.writerow(['split','family','chair_minutes','lab_cost_usd','target_cost_usd'])
    for i in range(n):
        w.writerow(['train' if i<900 else 'calibration' if i<1150 else 'test', 'CROWN01' if crown[i] else 'FILL01',format(minutes[i],'.17g'),format(lab[i],'.17g'),format(y[i],'.17g')])
baseline=np.full(250,float(y[train].mean()))
def metrics(actual, estimated):
    return {'rows':len(actual),'mae_usd':float(np.mean(abs(actual-estimated))),'wape':float(np.sum(abs(actual-estimated))/np.sum(actual))}
report={'model':model['version'],'data_kind':'synthetic only','seed':42,'split':{'train':900,'calibration':250,'test':250},'ridge':metrics(y[test],pred),'training_mean_baseline':metrics(y[test],baseline),'interval_coverage':model['interval_coverage'],'interval_radius_usd':bound,'families':{}}
for value,name in [(0,'FILL01'),(1,'CROWN01')]:
    mask=crown[test]==value
    report['families'][name]={**metrics(y[test][mask],pred[mask]),'interval_coverage':float(np.mean(abs(y[test][mask]-pred[mask])<=bound))}
(out/'evaluation.json').write_text(json.dumps(report,indent=2)+'\n')
manifest={'dataset':'synthetic_costs.csv','sha256':hashlib.sha256((out/'synthetic_costs.csv').read_bytes()).hexdigest(),'generator':'scripts/train_model.py','python':platform.python_version(),'numpy':np.__version__,'patient_data':False}
(out/'data_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
