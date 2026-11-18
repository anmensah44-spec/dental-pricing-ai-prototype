# Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
"""Independent reproduction from the archived multifamily CSV."""
from pathlib import Path
import csv,json,hashlib
import numpy as np
r=Path(__file__).resolve().parents[1]
m=json.loads((r/'dist/cost-model.json').read_text());report=json.loads((r/'evidence/multifamily_evaluation.json').read_text());manifest=json.loads((r/'evidence/multifamily_manifest.json').read_text());data=(r/'evidence/multifamily_data.csv').read_bytes()
assert hashlib.sha256(data).hexdigest()==manifest['sha256']
rows=list(csv.DictReader(data.decode().splitlines()));k=len(m['families'])
ids=np.array([m['families'].index(z['family']) for z in rows]);x=np.column_stack([np.eye(k)[ids],[float(z['minutes']) for z in rows],[float(z['lab']) for z in rows]]);y=np.array([float(z['cost']) for z in rows]);train=np.array([z['split']=='train' for z in rows]);cal=np.array([z['split']=='calibration' for z in rows]);test=np.array([z['split']=='test' for z in rows])
coef=np.linalg.solve(x[train].T@x[train]+np.eye(k+2)*.01,x[train].T@y[train]);np.testing.assert_allclose(coef,m['coefficients'],rtol=0,atol=1e-8)
err=abs(y[test]-x[test]@coef);assert abs(float(err.mean())-report['mae_usd'])<1e-8
radius=float(np.quantile(abs(y[cal]-x[cal]@coef),.90,method='higher'));assert abs(radius-m['interval_radius_usd'])<1e-8
assert report['mae_usd']<report['baseline_mae_usd'];assert len(rows)==manifest['rows']==4800
print('PASS: 16-family archived data, model coefficients, calibration, held-out MAE and baseline')
