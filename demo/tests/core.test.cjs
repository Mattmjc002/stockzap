'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {seed}=require('../public/js/demo.js'),C=require('../public/js/core.js'),Care=require('../public/js/zapcare.js');
test('os indicadores usam os registros e fecham os totais',()=>{
 const s=seed(),sum=C.summary(s),os=s.orders.filter(o=>o.date.startsWith('2026-09')&&o.status!=='Cancelado');
 assert.equal(sum.sales,C.round(os.reduce((n,o)=>n+o.total,0)));assert.equal(sum.stockUnits,s.products.reduce((n,p)=>n+p.stock,0));assert.equal(sum.estimatedProfit,C.round(sum.sales-sum.cogs-sum.operating));assert.equal(sum.low.length,4);
 for(const o of s.orders)assert.equal(o.total,C.round(o.items.reduce((n,i)=>n+i.quantity*i.price,0)));
});
test('uma venda baixa estoque, lança a receita e guarda preços históricos',()=>{
 const s=seed(),p=s.products[0],before=p.stock;
 const next=C.mutate(s,'order.create',{customerId:'c1',items:[{productId:p.id,quantity:2}],paymentStatus:'Pago',paymentMethod:'Pix',channel:'Balcão',dueDate:s.asOf});
 const o=next.orders[0],tx=next.transactions.find(t=>t.orderId===o.id);
 assert.equal(next.products[0].stock,before-2);assert.equal(s.products[0].stock,before);assert.equal(tx.amount,C.round(p.price*2));assert.equal(tx.status,'Pago');assert.equal(next.revision,s.revision+1);
 const repriced=C.mutate(next,'product.save',{...next.products[0],price:100});assert.equal(repriced.orders[0].items[0].price,p.price);
});
test('cancelar devolve os itens uma única vez e remove a receita do cálculo',()=>{
 const s=seed(),draft={customerId:'c1',items:[{productId:'p1',quantity:2}],paymentStatus:'Pago',paymentMethod:'Pix',channel:'WhatsApp'};
 const sold=C.mutate(s,'order.create',draft),o=sold.orders[0],cancelled=C.mutate(sold,'order.status',{id:o.id,status:'Cancelado'});
 assert.equal(cancelled.products[0].stock,s.products[0].stock);assert.equal(cancelled.transactions.find(t=>t.orderId===o.id).status,'Cancelado');assert.equal(C.summary(cancelled).balance,C.summary(s).balance);
 assert.throws(()=>C.mutate(cancelled,'order.status',{id:o.id,status:'Cancelado'}),/não podem ser reabertos/);
});
test('rejeita estoque insuficiente inclusive em linhas duplicadas sem alterar o estado',()=>{
 const s=seed();const original=JSON.stringify(s);
 assert.throws(()=>C.mutate(s,'order.create',{customerId:'c1',items:[{productId:'p1',quantity:4},{productId:'p1',quantity:4}],paymentStatus:'Pago',paymentMethod:'Pix',channel:'Balcão'}),/Estoque insuficiente/);
 assert.equal(JSON.stringify(s),original);assert.throws(()=>C.mutate(s,'stock.move',{productId:'p8',type:'Saída',quantity:1,reason:'Teste'}),/Estoque insuficiente/);
});
test('reposição atualiza o saldo e cria uma conta pelo custo',()=>{
 const s=seed(),next=C.mutate(s,'stock.move',{productId:'p8',type:'Entrada',quantity:22,reason:'Entrega do fornecedor',registerExpense:true,dueDate:'2026-10-03'});
 assert.equal(next.products[7].stock,22);assert.equal(next.transactions[0].amount,22*s.products[7].cost);assert.equal(next.transactions[0].category,'Compras');assert.equal(C.summary(next).estimatedProfit,C.summary(s).estimatedProfit);
});
test('pagamento sincroniza pedido e financeiro',()=>{
 const s=seed(),tx=s.transactions.find(t=>t.orderId&&t.status==='Pendente'),next=C.mutate(s,'transaction.pay',{id:tx.id});assert.equal(next.orders.find(o=>o.id===tx.orderId).paymentStatus,'Pago');assert.equal(C.summary(next).receivables,C.round(C.summary(s).receivables-tx.amount));assert.throws(()=>C.mutate(next,'transaction.pay',{id:tx.id}),/não está pendente/);
});
test('valida códigos únicos, datas reais, valores e identificadores',()=>{
 const s=seed();assert.throws(()=>C.mutate(s,'product.save',{...s.products[0],id:null}),/código/);assert.throws(()=>C.mutate(s,'transaction.create',{type:'Despesa',description:'Teste',category:'Operação',amount:10,date:'2026-02-30',dueDate:s.asOf,status:'Pago'}),/data válida/);assert.throws(()=>C.mutate(s,'stock.move',{productId:'inexistente',type:'Entrada',quantity:1,reason:'Teste'}),/não encontrado/);assert.throws(()=>C.mutate(s,'stock.move',{productId:'p1',type:'Entrada',quantity:1.5,reason:'Teste'}),/número válido/);
});
test('ZapCare lê a base atual e não inventa dados para períodos futuros',()=>{
 const s=seed(),first=Care.answer(s,'Qual o estoque do CAF-001?');assert.match(first.text,/6 un/);
 const next=C.mutate(s,'stock.move',{productId:'p1',type:'Entrada',quantity:10,reason:'Reposição'}),after=Care.answer(next,'Qual o estoque do CAF-001?');assert.match(after.text,/16 un/);
 const profit=Care.answer(s,'Qual meu lucro em setembro?');assert.ok(profit.text.includes(C.money(C.summary(s).estimatedProfit)));assert.match(Care.answer(s,'Previsão de outubro?').text,/Não há dados realizados/);
});
test('filtros de período mantêm o intervalo certo',()=>{const s=seed();assert.deepEqual(C.period(s,'7'),{start:'2026-09-24',end:'2026-09-30',label:'últimos 7 dias'});assert.equal(C.period(s,'previous').end,'2026-08-31');});

test('as movimentações históricas reconciliam os saldos e não ficam negativas',()=>{
 const s=seed();for(const p of s.products){const ms=s.movements.filter(m=>m.productId===p.id).slice().reverse();let balance=0;for(const m of ms){balance+=m.type==='Entrada'?m.quantity:-m.quantity;assert.equal(m.balance,balance);assert.ok(balance>=0);}assert.equal(balance,p.stock);}
});
test('baixa de conta antiga entra no caixa na data de pagamento',()=>{
 const s=seed(),tx=s.transactions.find(t=>t.date.startsWith('2026-08')&&t.status==='Pendente'),before=C.summary(s);const next=C.mutate(s,'transaction.pay',{id:tx.id});assert.equal(next.transactions.find(t=>t.id===tx.id).paidDate,s.asOf);assert.equal(C.summary(next).income,C.round(before.income+tx.amount));
});
