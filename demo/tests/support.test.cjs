'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {seed}=require('../public/js/demo.js'),C=require('../public/js/core.js'),S=require('../public/js/support.js');
const account=(s,id)=>s.support.accounts.find(a=>a.id===id);
test('a fila monitora empresas clientes e calcula indicadores a partir dos atendimentos',()=>{
 const s=seed(),m=S.summary(s);
 assert.equal(m.accounts,10);assert.equal(m.open,7);assert.equal(m.highRisk,2);assert.equal(m.overdue,2);assert.equal(m.resolved,1);
 assert.equal(S.queue(s).length,7);assert.equal(S.queue(s)[0].priorityScore,100);
 assert.ok(S.queue(s).every(r=>s.support.accounts.includes(r.account)));
 assert.ok(S.queue(s).every(r=>!s.customers.some(c=>c.id===r.account.id)));
});
test('inatividade e queda são medidas em duas janelas distintas de sete dias',()=>{
 const s=seed(),cafe=S.analyze(s,account(s,'sz-cafe')),bela=S.analyze(s,account(s,'sz-bela'));
 assert.equal(cafe.inactiveDays,12);assert.equal(cafe.risk,'Alto');assert.equal(cafe.journey,'Reativação');
 assert.equal(bela.recent,3);assert.equal(bela.previous,16);assert.equal(bela.drop,81);assert.equal(bela.risk,'Médio');
 const boundary=account(s,'sz-vila');s.support.events=[{accountId:boundary.id,date:S.shift(s.asOf,-7),count:4,type:'sale'}];
 assert.equal(S.analyze(s,boundary).recent,0);assert.equal(S.analyze(s,boundary).previous,4);assert.equal(S.analyze(s,boundary).risk,'Alto');
});
test('falta de eventos não é tratada como abandono e eventos futuros são ignorados',()=>{
 const s=seed(),a=account(s,'sz-tech'),r=S.analyze(s,a);
 assert.equal(r.risk,'Sem dados');assert.equal(r.riskScore,null);assert.equal(r.inactiveDays,null);assert.equal(r.lastActivity,null);
 s.support.events.push({accountId:a.id,date:S.shift(s.asOf,1),count:20,type:'sale'});
 assert.equal(S.analyze(s,a).lastActivity,null);
 a.telemetryAvailable=true;s.support.events=[];assert.equal(S.analyze(s,a).risk,'Sem dados');
});
test('onboarding protege novas empresas de classificar a falta de base anterior como queda',()=>{
 const s=seed(),r=S.analyze(s,account(s,'sz-atelie'));assert.equal(r.journey,'Onboarding');assert.equal(r.risk,'Baixo');assert.equal(r.drop,null);
});
test('filtros incluem responsáveis ausentes, histórico resolvido e risco sem dados',()=>{
 const s=seed();assert.deepEqual(S.queue(s,{owner:'unassigned'}).map(r=>r.account.id).sort(),['sz-padaria','sz-tech']);
 assert.equal(S.queue(s,{status:'Resolvido'})[0].account.id,'sz-pet');assert.equal(S.queue(s,{risk:'Sem dados'})[0].account.id,'sz-tech');
 assert.equal(S.queue(s,{text:'julia'})[0].account.id,'sz-bela');assert.equal(S.queue(s,{status:''}).length,10);
 assert.equal(S.queue(s,{text:'inexistente'}).length,0);
});
test('status e responsável devem corresponder ao mesmo atendimento da empresa',()=>{
 const s=seed(),next=C.mutate(s,'support.create',{accountId:'sz-pet',title:'Dúvida nova',description:'Revisar o estoque.',ownerId:'sz-caue',priority:'Média',dueDate:s.asOf});
 assert.equal(S.queue(next,{status:'Novo',owner:'sz-manuela'}).some(r=>r.account.id==='sz-pet'),false);
 const rows=S.queue(next,{status:'Novo',owner:'sz-caue'});assert.equal(rows.length,1);assert.equal(rows[0].account.id,'sz-pet');assert.equal(S.ticketsForFilters(rows[0],{status:'Novo',owner:'sz-caue'})[0].title,'Dúvida nova');
 assert.equal(S.ticketsForFilters(S.analyze(next,account(next,'sz-pet')),{status:'Resolvido'})[0].status,'Resolvido');
});
test('migrar dados antigos adiciona apenas o painel e preserva pedidos, caixa e revisões',()=>{
 const s=seed();delete s.support;const before=JSON.stringify({products:s.products,orders:s.orders,transactions:s.transactions,revision:s.revision});
 assert.equal(S.ensure(s),true);assert.equal(S.ensure(s),false);
 assert.equal(JSON.stringify({products:s.products,orders:s.orders,transactions:s.transactions,revision:s.revision}),before);
});
test('solicitação do chat aparece na fila sem escrever no histórico comercial da empresa',()=>{
 const s=seed(),next=C.mutate(s,'support.create',{origin:'client',accountId:'sz-aurora',title:'Dúvida no estoque',description:'Preciso entender o estoque mínimo.'});
 const t=next.support.tickets[0];assert.equal(t.accountId,'sz-aurora');assert.equal(t.status,'Novo');assert.equal(t.ownerId,'');assert.equal(t.priority,'Média');
 assert.equal(S.summary(next).open,8);assert.equal(next.revision,s.revision+1);assert.deepEqual(next.activity,s.activity);
 assert.equal(next.support.interactions[0].actorName,s.company.owner);
 assert.throws(()=>C.mutate(s,'support.create',{origin:'client',accountId:'sz-cafe',title:'Teste',description:'Teste'}),/empresa atual/);
});
test('responsável, status e retorno ficam no histórico e resolver retira o caso da fila',()=>{
 const s=seed(),t=s.support.tickets.find(t=>t.id==='case-padaria'),payload={id:t.id,ownerId:'sz-matheus',status:'Resolvido',priority:'Alta',dueDate:s.asOf,note:'Cliente retomou o cadastro.'};
 const next=C.mutate(s,'support.update',payload);
 assert.equal(S.summary(next).open,6);assert.equal(S.summary(next).resolved,2);assert.ok(!S.queue(next).some(r=>r.account.id===t.accountId));
 assert.match(S.history(next,t.accountId)[0].text,/Cliente retomou/);assert.equal(s.support.tickets.find(x=>x.id===t.id).status,'Novo');
 const reopened=C.mutate(next,'support.update',{...payload,status:'Em atendimento',note:'Cliente trouxe uma nova dúvida.'});
 assert.equal(reopened.support.tickets.find(x=>x.id===t.id).resolvedAt,null);assert.equal(S.summary(reopened).open,7);
});
test('rejeita resolução sem responsável, identificadores inválidos e datas impossíveis sem alterar os dados',()=>{
 const s=seed(),before=JSON.stringify(s),p={id:'case-padaria',ownerId:'',status:'Resolvido',priority:'Alta',dueDate:s.asOf,note:'Teste'};
 assert.throws(()=>C.mutate(s,'support.update',p),/responsável/);assert.throws(()=>C.mutate(s,'support.update',{...p,ownerId:'ausente'}),/não encontrado/);
 assert.throws(()=>C.mutate(s,'support.update',{...p,ownerId:'sz-matheus',dueDate:'2026-02-30'}),/data válida/);assert.equal(JSON.stringify(s),before);
});
test('contatos são simulados, respeitam pausa e bloqueiam repetição na mesma data',()=>{
 const s=seed(),p={accountId:'sz-cafe',ticketId:'case-cafe',actorId:'sz-manuela',kind:'Contato simulado',channel:'WhatsApp',text:'Podemos ajudar a retomar o aplicativo?'};
 const next=C.mutate(s,'support.interaction',p);assert.equal(S.analyze(next,account(next,p.accountId)).contactToday,true);
 assert.throws(()=>C.mutate(next,'support.interaction',p),/Já existe um contato/);
 assert.throws(()=>C.mutate(s,'support.interaction',{...p,accountId:'sz-tech',ticketId:'case-tech'}),/pausados/);
 const note=C.mutate(s,'support.interaction',{...p,accountId:'sz-tech',ticketId:'case-tech',kind:'Nota interna',text:'Investigar a coleta.'});assert.equal(note.support.interactions[0].channel,'Interno');
 assert.throws(()=>C.mutate(s,'support.interaction',{...p,ticketId:'case-tech'}),/outra empresa/);
});
test('operações da empresa geram eventos apenas na sua conta e preservam as demais',()=>{
 const s=seed(),before=s.support.events.filter(x=>x.accountId==='sz-bela'),n=s.support.events.length;
 const next=C.mutate(s,'stock.move',{productId:'p1',type:'Entrada',quantity:1,reason:'Teste de captura de uso'});
 assert.equal(next.support.events.length,n+1);assert.equal(next.support.events.at(-1).accountId,'sz-aurora');assert.equal(next.support.events.at(-1).type,'stock');
 assert.deepEqual(next.support.events.filter(x=>x.accountId==='sz-bela'),before);
});
