import {DatabaseSync} from 'node:sqlite';
import {existsSync,chmodSync} from 'node:fs';
import {resolve} from 'node:path';
export function backup(source,destination){
 if(!existsSync(source)||existsSync(destination))throw Error('Source must exist and destination must be new');
 const db=new DatabaseSync(source,{readOnly:true});try{db.prepare('VACUUM INTO ?').run(destination);}finally{db.close();}chmodSync(destination,0o600);
 const check=new DatabaseSync(destination,{readOnly:true});try{if(check.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Backup integrity failed');}finally{check.close();}
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename)){
 const [source,destination]=process.argv.slice(2);if(!source||!destination)throw Error('Usage: node scripts/backup.mjs SOURCE.sqlite NEW_BACKUP.sqlite');backup(source,destination);console.log('Backup created; SQLite integrity check passed.');
}
