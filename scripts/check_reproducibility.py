# Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
"""Recompute the published artifact from archived generated rows, independently."""
import csv, json, hashlib
from pathlib import Path
import numpy as np
r=Path(__file__).resolve().parents[1]
rows=list(csv.DictReader((r/'evidence/synthetic_costs.csv').open()))
x=np.array([[1,float(z['family']=='CROWN01'),float(z['chair_minutes']),float(z['lab_cost_usd'])] for z in rows]);y=np.array([float(z['target_cost_usd']) for z in rows])
coef=np.linalg.solve(x[:900].T@x[:900]+np.diag([0,.01,.01,.01]),x[:900].T@y[:900])
m=json.loads((r/'dist/model.json').read_text());e=json.loads((r/'evidence/evaluation.json').read_text());d=json.loads((r/'evidence/data_manifest.json').read_text())
assert len(rows)==1400
np.testing.assert_allclose(coef,m['coefficients'],rtol=0,atol=1e-9)
err=abs(y[1150:]-x[1150:]@coef)
assert abs(float(err.mean())-e['ridge']['mae_usd'])<1e-9
assert hashlib.sha256((r/'evidence/synthetic_costs.csv').read_bytes()).hexdigest()==d['sha256']
assert e['ridge']['mae_usd']<e['training_mean_baseline']['mae_usd']
print('PASS: archived data checksum, coefficients, held-out MAE and baseline comparison')
