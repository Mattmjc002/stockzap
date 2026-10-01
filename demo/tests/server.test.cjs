'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'stockzap-test-'));process.env.STOCKZAP_TEST_MODE='1';process.env.DATA_FILE=path.join(temp,'aurora.json');process.env.PORT='3487';process.env.HOST='127.0.0.1';delete process.env.OPENAI_API_KEY;
const {server}=require('../server.cjs');const base='http://127.0.0.1:3487';const realFetch=global.fetch;
const ready=new Promise(resolve=>{if(server.listening)resolve();else server.once('listening',resolve);});
const post=(route,body,headers={})=>realFetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('servidor persiste ações, protege revisões e responde com os dados atuais',async()=>{
 await ready;
 let r=await realFetch(base+'/api/state');assert.equal(r.status,200);let initial=await r.json();assert.equal(initial.mode,'server');assert.equal(initial.aiEnabled,false);const revision=initial.state.revision;
 r=await post('/api/action',{revision,action:'stock.move',payload:{productId:'p1',quantity:10,type:'Entrada',reason:'Teste de integração'}});assert.equal(r.status,200);let changed=await r.json();assert.equal(changed.state.products[0].stock,16);assert.equal(JSON.parse(fs.readFileSync(process.env.DATA_FILE,'utf8')).products[0].stock,16);
 r=await post('/api/action',{revision,action:'stock.move',payload:{productId:'p1',quantity:1,type:'Entrada',reason:'Antigo'}});assert.equal(r.status,409);
 r=await post('/api/action',{revision:changed.state.revision,action:'stock.move',payload:{productId:'p1',quantity:99999,type:'Saída',reason:'Inválido'}});assert.equal(r.status,400);assert.match((await r.json()).error,/insuficiente/);
 r=await post('/api/zapcare',{message:'Qual o estoque do CAF-001?',history:[]});const answer=await r.json();assert.equal(answer.engine,'local');assert.match(answer.text,/16 un/);assert.equal(answer.revision,changed.state.revision);
 r=await post('/api/action',{revision:changed.state.revision,action:'stock.move',payload:{productId:'p1',quantity:1,type:'Entrada',reason:'Origem externa'}},{Origin:'https://external.example'});assert.equal(r.status,403);
 r=await realFetch(base+'/.env');assert.equal(r.status,404);assert.ok((await r.text()).includes('404'));r=await realFetch(base+'/app.html');assert.equal(r.status,200);assert.match(r.headers.get('Content-Security-Policy'),/script-src 'self'/);
 r=await post('/api/reset',{revision:changed.state.revision,confirm:'RESTAURAR'});const reset=await r.json();assert.equal(reset.state.products[0].stock,6);assert.ok(reset.state.revision>changed.state.revision);
});
test('integração generativa recebe a base atual e lê a saída após itens de raciocínio',async()=>{
 await ready;process.env.OPENAI_API_KEY='test-key-never-sent';let received;
 global.fetch=async(url,options)=>{if(url==='https://api.openai.com/v1/responses'){received=JSON.parse(options.body);return new Response(JSON.stringify({output:[{type:'reasoning',summary:[]},{type:'message',role:'assistant',content:[{type:'output_text',text:'Resposta simulada para verificar o contrato da API.'}]}]}),{status:200,headers:{'Content-Type':'application/json'}});}return realFetch(url,options);};
 try{const response=await post('/api/zapcare',{message:'Quanto tenho em estoque?',history:[{role:'user',content:'Olá'}]});const output=await response.json();assert.equal(output.engine,'ai');assert.match(output.text,/Resposta simulada/);assert.match(received.instructions,/DADOS ATUAIS DO NEGÓCIO/);assert.match(received.instructions,/CAF-001/);assert.equal(received.store,false);assert.equal(received.input.at(-1).content,'Quanto tenho em estoque?');}finally{global.fetch=realFetch;delete process.env.OPENAI_API_KEY;}
});
test('falha do provedor usa consulta local com identificação explícita',async()=>{
 await ready;process.env.OPENAI_API_KEY='test-key-never-sent';global.fetch=async(url,options)=>url==='https://api.openai.com/v1/responses'?new Response('{}',{status:503}):realFetch(url,options);
 try{const response=await post('/api/zapcare',{message:'Qual o estoque do CAF-001?'});const output=await response.json();assert.equal(output.engine,'local');assert.match(output.notice,/indisponível/);assert.match(output.text,/6 un/);}finally{global.fetch=realFetch;delete process.env.OPENAI_API_KEY;}
});
test.after(async()=>{await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});});
