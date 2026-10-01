'use strict';
const fs=require('node:fs'),path=require('node:path');try{process.loadEnvFile(path.resolve(__dirname,'../.env'));}catch(e){if(e.code!=='ENOENT')throw e;}
const source=path.resolve(__dirname,'..',process.env.DATA_FILE||'data/aurora.json');const folder=path.resolve(__dirname,'../backups');
try{fs.mkdirSync(folder,{recursive:true});const target=path.join(folder,'aurora-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');fs.copyFileSync(source,target);console.log('Backup criado: '+target);}catch(e){console.error('Não foi possível criar o backup: '+e.message);process.exitCode=1;}
