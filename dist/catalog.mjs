/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
AI-assisted implementation developed under his direction.
*/
// Fictional treatment and financial references. Not clinical protocols or actual fees.
export const CATALOG = Object.freeze([
  ['EXAM','Examination and diagnostic visit',45,0,15000,1],
  ['CLEAN','Preventive cleaning',45,0,18000,1],
  ['FILL01','Direct restoration',35,0,28000,1],
  ['CROWN01','Single crown',75,280,180000,2],
  ['ROOT','Root canal treatment',90,40,140000,2],
  ['EXTRACT','Simple extraction',40,0,35000,1],
  ['SURGERY','Surgical extraction',70,30,85000,2],
  ['IMPLANT','Implant restoration pathway',110,700,480000,6],
  ['BRIDGE','Fixed bridge',90,450,300000,3],
  ['DENTURE','Removable denture',80,350,240000,4],
  ['PERIO','Periodontal treatment',60,0,65000,3],
  ['ORTHO','Orthodontic treatment plan',55,600,520000,12],
  ['WHITEN','Whitening',50,50,55000,1],
  ['GUARD','Occlusal appliance',35,100,65000,2],
  ['PEDIATRIC','Pediatric preventive visit',35,0,16000,1],
  ['EMERGENCY','Urgent evaluation',35,0,20000,1],
].map(([code,name,minutes,lab,reference,visits])=>Object.freeze({code,name,minutes,lab,reference,visits})));
export const POLICY = Object.freeze({version:'SYNTHETIC-P2',marginBps:3000,movementBps:500,merchantBps:300,quoteDays:14});
