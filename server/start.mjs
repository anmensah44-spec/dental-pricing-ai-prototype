/*
Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
*/
import {existsSync,chmodSync} from 'node:fs';
if(existsSync('.env'))process.loadEnvFile('.env');
const {createApplication}=await import('./app.mjs');
const app=createApplication();
const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||4173);
app.server.listen(port,host,()=>{console.log(`Clarity Dental running at http://${host}:${port} — SYNTHETIC DATA ONLY`);if(existsSync(process.env.DB_PATH||'data/clarity.sqlite'))chmodSync(process.env.DB_PATH||'data/clarity.sqlite',0o600);});
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,async()=>{await app.close();process.exit(0);});
