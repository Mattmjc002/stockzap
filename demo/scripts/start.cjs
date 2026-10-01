'use strict';
const path=require('node:path'),{spawn}=require('node:child_process');
const project=path.resolve(__dirname,'..');
const child=spawn(process.execPath,['server.cjs'],{cwd:project,stdio:['inherit','pipe','inherit']});let opened=false;
child.stdout.on('data',chunk=>{process.stdout.write(chunk);const match=chunk.toString().match(/http:\/\/localhost:\d+/);if(match&&!opened){opened=true;const command=process.platform==='win32'?'cmd':process.platform==='darwin'?'open':'xdg-open';const args=process.platform==='win32'?['/c','start','',match[0]]:[match[0]];const browser=spawn(command,args,{stdio:'ignore'});browser.on('error',()=>console.log('Abra o navegador no endereço exibido acima.'));}});
child.on('error',e=>{console.error('Não foi possível iniciar: '+e.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code||0;});process.on('SIGINT',()=>child.kill('SIGINT'));
