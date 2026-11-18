/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
*/
import {DatabaseSync} from 'node:sqlite';
import {createHash,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
export const hash=x=>createHash('sha256').update(x).digest('hex');
export function passwordHash(password,salt=randomBytes(16).toString('hex')) {return `${salt}:${scryptSync(password,salt,32).toString('hex')}`;}
export function checkPassword(password,stored){const [salt,digest]=stored.split(':');const actual=scryptSync(password,salt,32);return timingSafeEqual(actual,Buffer.from(digest,'hex'));}
export function openStore(file) {
 const db=new DatabaseSync(file);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,role TEXT NOT NULL,password TEXT NOT NULL,patient_id TEXT);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS entities(id TEXT PRIMARY KEY,kind TEXT NOT NULL,patient_id TEXT NOT NULL,version INTEGER NOT NULL,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS requests(actor TEXT NOT NULL,key TEXT NOT NULL,payload_hash TEXT NOT NULL,result TEXT NOT NULL,PRIMARY KEY(actor,key));
 CREATE TABLE IF NOT EXISTS audit(seq INTEGER PRIMARY KEY AUTOINCREMENT,time TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,entity TEXT NOT NULL,details TEXT NOT NULL,previous TEXT NOT NULL,digest TEXT NOT NULL);
 CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'Audit is append only'); END;
 CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'Audit is append only'); END;`);
 const get=id=>{const r=db.prepare('SELECT * FROM entities WHERE id=?').get(id);return r?{...JSON.parse(r.data),id:r.id,version:r.version}:null;};
 const list=kind=>db.prepare('SELECT * FROM entities WHERE kind=? ORDER BY rowid DESC').all(kind).map(r=>({...JSON.parse(r.data),id:r.id,version:r.version}));
 const save=(kind,entity)=>{const {id,version,...data}=entity;db.prepare('INSERT INTO entities(id,kind,patient_id,version,data) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,data=excluded.data').run(id,kind,data.patientId,version,JSON.stringify(data));return entity;};
 const event=(actor,action,entity,details={})=>{const previous=db.prepare('SELECT digest FROM audit ORDER BY seq DESC LIMIT 1').get()?.digest||'GENESIS';const time=new Date().toISOString();const body=[time,actor,action,entity,JSON.stringify(details),previous];const digest=hash(JSON.stringify(body));db.prepare('INSERT INTO audit(time,actor,action,entity,details,previous,digest) VALUES(?,?,?,?,?,?,?)').run(...body,digest);};
 const verify=()=>{let previous='GENESIS';for(const r of db.prepare('SELECT * FROM audit ORDER BY seq').all()){if(r.previous!==previous||r.digest!==hash(JSON.stringify([r.time,r.actor,r.action,r.entity,r.details,r.previous])))return false;previous=r.digest;}return true;};
 const transaction=fn=>{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}};
 return {db,get,list,save,event,verify,transaction};
}
