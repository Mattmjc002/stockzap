(function(root) {
  'use strict';
  const Support=typeof module!=='undefined'?require('./support.js'):root.SZSupport;
  const round=v=>Math.round((v+Number.EPSILON)*100)/100;
  const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const uid=prefix=>prefix+'-'+(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  function fail(message){throw new Error(message);}
  function str(v,label,max=140){if(typeof v!=='string'||!v.trim()||v.trim().length>max)fail(label+': preencha até '+max+' caracteres.');return v.trim();}
  function num(v,label,min=0,max=10000000,integer=false){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||(integer&&!Number.isSafeInteger(v)))fail(label+': informe um número válido.');return round(v);}
  function choice(v,values,label){if(!values.includes(v))fail(label+': opção inválida.');return v;}
  function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail('Informe uma data válida.');return v;}
  function find(list,id,label){return list.find(x=>x.id===id)||fail(label+' não encontrado.');}
  function period(state,key='month'){
    const end=state.asOf;let start=end.slice(0,7)+'-01';
    if(key==='all')start='2000-01-01';
    else if(key==='previous'){const d=new Date(end+'T12:00:00Z');d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-1);start=d.toISOString().slice(0,10);const e=new Date(end+'T12:00:00Z');e.setUTCDate(0);return {start,end:e.toISOString().slice(0,10),label:'mês anterior'};}
    else if(key==='today')start=end;
    else if(key==='yesterday'){const d=new Date(end+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);return {start:d.toISOString().slice(0,10),end:d.toISOString().slice(0,10),label:'ontem'};}
    else if(key==='7'||key==='30'){const d=new Date(end+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(Number(key)-1));start=d.toISOString().slice(0,10);}
    return {start,end,label:key==='all'?'todo o histórico':key==='today'?'hoje':key==='7'?'últimos 7 dias':key==='30'?'últimos 30 dias':'este mês'};
  }
  function summary(state,key='month'){
    const range=typeof key==='object'?key:period(state,key);const within=d=>d>=range.start&&d<=range.end;
    const orders=state.orders.filter(o=>o.status!=='Cancelado'&&within(o.date));
    const tx=state.transactions.filter(t=>t.status!=='Cancelado'&&within(t.date));
    const cashTx=state.transactions.filter(t=>t.status==='Pago'&&within(t.paidDate||t.date));
    const sales=round(orders.reduce((s,o)=>s+o.total,0));
    const cogs=round(orders.reduce((s,o)=>s+o.items.reduce((n,i)=>n+i.cost*i.quantity,0),0));
    const income=round(cashTx.filter(t=>t.type==='Receita').reduce((s,t)=>s+t.amount,0));
    const expenses=round(cashTx.filter(t=>t.type==='Despesa').reduce((s,t)=>s+t.amount,0));
    const operating=round(tx.filter(t=>t.type==='Despesa'&&t.category!=='Compras').reduce((s,t)=>s+t.amount,0));
    const balance=round(state.company.openingBalance+state.transactions.filter(t=>t.status==='Pago'&&(t.paidDate||t.date)<=state.asOf).reduce((s,t)=>s+(t.type==='Receita'?t.amount:-t.amount),0));
    const active=state.products.filter(p=>!p.archived);
    const byProduct=new Map();for(const o of orders)for(const i of o.items){const p=byProduct.get(i.productId)||{id:i.productId,name:i.name,quantity:0,revenue:0,cost:0};p.quantity+=i.quantity;p.revenue=round(p.revenue+i.price*i.quantity);p.cost=round(p.cost+i.cost*i.quantity);byProduct.set(i.productId,p);}
    const topProducts=Array.from(byProduct.values()).sort((a,b)=>b.revenue-a.revenue);
    const low=active.filter(p=>p.stock<=p.minStock).sort((a,b)=>a.stock/Math.max(1,a.minStock)-b.stock/Math.max(1,b.minStock));
    const pendingTx=state.transactions.filter(t=>t.status==='Pendente');
    const dailyStart=new Date(range.start+'T12:00:00Z'),dailyLimit=new Date(range.end+'T12:00:00Z');dailyLimit.setUTCDate(dailyLimit.getUTCDate()-365);
    const daily=[];for(let d=new Date(Math.max(dailyStart,dailyLimit));d.toISOString().slice(0,10)<=range.end;d.setUTCDate(d.getUTCDate()+1)){const day=d.toISOString().slice(0,10);daily.push({date:day,sales:round(orders.filter(o=>o.date===day).reduce((s,o)=>s+o.total,0)),income:round(cashTx.filter(t=>(t.paidDate||t.date)===day&&t.type==='Receita').reduce((s,t)=>s+t.amount,0)),expenses:round(cashTx.filter(t=>(t.paidDate||t.date)===day&&t.type==='Despesa').reduce((s,t)=>s+t.amount,0))});if(daily.length>400)break;}
    return {range,sales,cogs,income,expenses,operating,grossProfit:round(sales-cogs),estimatedProfit:round(sales-cogs-operating),cashFlow:round(income-expenses),balance,orderCount:orders.length,ticket:orders.length?round(sales/orders.length):0,stockUnits:active.reduce((s,p)=>s+p.stock,0),stockCost:round(active.reduce((s,p)=>s+p.stock*p.cost,0)),productCount:active.length,low,topProducts,daily,payables:round(pendingTx.filter(t=>t.type==='Despesa').reduce((s,t)=>s+t.amount,0)),receivables:round(pendingTx.filter(t=>t.type==='Receita').reduce((s,t)=>s+t.amount,0)),overdue:pendingTx.filter(t=>t.dueDate<state.asOf),activeOrders:state.orders.filter(o=>!['Entregue','Cancelado'].includes(o.status)),tasks:state.tasks.filter(t=>t.status==='Pendente')};
  }
  function alerts(state){const s=summary(state);return [
    ...s.low.map(p=>({id:'stock-'+p.id,title:p.stock===0?'Produto esgotado':'Estoque baixo',text:p.name+' · '+p.stock+' '+p.unit+' · mínimo '+p.minStock,route:'estoque',level:p.stock===0?'danger':'warning'})),
    ...s.overdue.filter(t=>t.type==='Despesa').map(t=>({id:'bill-'+t.id,title:'Conta vencida',text:t.description+' · '+money(t.amount),route:'financeiro',level:'danger'})),
    ...s.tasks.filter(t=>t.date<=state.asOf).map(t=>({id:'task-'+t.id,title:t.date<state.asOf?'Prazo vencido':'Prazo de hoje',text:t.title,route:'prazos',level:'warning'}))
  ];}
  function mutate(input,action,p={}){
    const s=structuredClone(input);const now=new Date().toISOString();let log='';
    Support.ensure(s);
    const movement=(product,type,quantity,reason)=>s.movements.unshift({id:uid('m'),productId:product.id,type,quantity,reason,date:s.asOf,balance:product.stock});
    if(action.startsWith('support.')){
      log=Support.apply(s,action,p,now);
    }else if(action==='product.save'){
      const id=p.id||uid('p');const old=p.id?find(s.products,p.id,'Produto'):null;
      const product={...old,id,name:str(p.name,'Nome'),sku:str(p.sku,'Código',60),category:str(p.category,'Categoria',60),price:num(p.price,'Preço'),cost:num(p.cost,'Custo'),minStock:num(p.minStock,'Estoque mínimo',0,1000000,true),targetStock:num(p.targetStock,'Estoque ideal',0,1000000,true),supplierId:p.supplierId||s.suppliers[0].id,visual:old?.visual||'grain',unit:'un.',stock:old?old.stock:num(p.stock,'Quantidade',0,1000000,true)};
      find(s.suppliers,product.supplierId,'Fornecedor');if(product.targetStock<product.minStock)fail('Estoque ideal deve ser igual ou superior ao mínimo.');
      if(s.products.some(x=>x.id!==id&&normalize(x.sku)===normalize(product.sku)))fail('Já existe um produto com esse código.');
      if(old)s.products=s.products.map(x=>x.id===id?product:x);else{s.products.unshift(product);if(product.stock)movement(product,'Entrada',product.stock,'Cadastro do produto');}log=(old?'Produto atualizado: ':'Produto cadastrado: ')+product.name;
    }else if(action==='product.archive'){
      const x=find(s.products,p.id,'Produto');if(s.orders.some(o=>!['Entregue','Cancelado'].includes(o.status)&&o.items.some(i=>i.productId===x.id)))fail('Conclua ou cancele os pedidos em aberto antes de arquivar este produto.');x.archived=true;log='Produto arquivado: '+x.name;
    }else if(action==='stock.move'){
      const x=find(s.products,p.productId,'Produto');if(x.archived)fail('Produto arquivado.');const quantity=num(p.quantity,'Quantidade',1,1000000,true);const type=choice(p.type,['Entrada','Saída'],'Movimentação');const reason=str(p.reason,'Motivo',300);
      if(type==='Saída'&&x.stock<quantity)fail('Estoque insuficiente para esta saída.');x.stock+=type==='Entrada'?quantity:-quantity;movement(x,type,quantity,reason);
      if(type==='Entrada'&&p.registerExpense)s.transactions.unshift({id:uid('t'),type:'Despesa',category:'Compras',description:'Reposição · '+x.name,amount:round(x.cost*quantity),date:s.asOf,dueDate:date(p.dueDate||s.asOf),status:'Pendente'});log=type+' de '+quantity+' '+x.unit+' · '+x.name;
    }else if(action==='customer.save'){
      const x={id:uid('c'),name:str(p.name,'Nome'),phone:str(p.phone,'Telefone',40),email:p.email||'',address:p.address||'',notes:''};s.customers.unshift(x);log='Cliente cadastrado: '+x.name;
    }else if(action==='order.create'){
      find(s.customers,p.customerId,'Cliente');if(!Array.isArray(p.items)||!p.items.length||p.items.length>40)fail('Adicione ao menos um produto.');const grouped=new Map();for(const i of p.items){const q=num(i.quantity,'Quantidade',1,1000000,true);grouped.set(i.productId,(grouped.get(i.productId)||0)+q);}
      const items=[];for(const [id,q] of grouped){const x=find(s.products,id,'Produto');if(x.archived||x.stock<q)fail('Estoque insuficiente: '+x.name+'.');items.push({productId:id,name:x.name,price:x.price,cost:x.cost,quantity:q});}
      const total=round(items.reduce((sum,i)=>sum+i.price*i.quantity,0));const paymentStatus=choice(p.paymentStatus,['Pago','Pendente'],'Pagamento');const o={id:uid('o'),number:Math.max(1000,...s.orders.map(o=>o.number))+1,customerId:p.customerId,date:s.asOf,dueDate:date(p.dueDate||s.asOf),status:'Em preparo',paymentStatus,paymentMethod:choice(p.paymentMethod,['Pix','Cartão','Dinheiro'],'Forma de pagamento'),channel:choice(p.channel,['Balcão','WhatsApp','Delivery'],'Canal'),items,total,notes:typeof p.notes==='string'?p.notes.slice(0,400):''};
      for(const i of items){const x=find(s.products,i.productId,'Produto');x.stock-=i.quantity;movement(x,'Saída',i.quantity,'Pedido #'+o.number);}s.orders.unshift(o);s.transactions.unshift({id:'t-'+o.id,type:'Receita',description:'Venda #'+o.number,category:'Vendas',amount:total,date:s.asOf,dueDate:o.dueDate,status:paymentStatus,paidDate:paymentStatus==='Pago'?s.asOf:null,orderId:o.id});log='Pedido #'+o.number+' criado · '+money(total);
    }else if(action==='order.status'){
      const o=find(s.orders,p.id,'Pedido');const status=choice(p.status,['Em preparo','Pronto','Entregue','Cancelado'],'Status');if(o.status==='Cancelado')fail('Pedidos cancelados não podem ser reabertos.');if(o.status==='Entregue'&&status!=='Cancelado')fail('O pedido já foi entregue.');if(status===o.status)fail('Este pedido já tem esse status.');
      if(status==='Cancelado'){for(const i of o.items){const x=find(s.products,i.productId,'Produto');x.stock+=i.quantity;movement(x,'Entrada',i.quantity,'Cancelamento do pedido #'+o.number);}const t=s.transactions.find(t=>t.orderId===o.id);if(t)t.status='Cancelado';o.paymentStatus='Cancelado';}o.status=status;log='Pedido #'+o.number+' · '+status;
    }else if(action==='transaction.create'){
      s.transactions.unshift({id:uid('t'),type:choice(p.type,['Receita','Despesa'],'Tipo'),description:str(p.description,'Descrição',200),category:str(p.category,'Categoria',80),amount:num(p.amount,'Valor',0.01),date:date(p.date||s.asOf),dueDate:date(p.dueDate||s.asOf),status:choice(p.status,['Pago','Pendente'],'Status'),paidDate:p.status==='Pago'?s.asOf:null});log='Lançamento financeiro: '+p.description;
    }else if(action==='transaction.pay'){
      const x=find(s.transactions,p.id,'Lançamento');if(x.status!=='Pendente')fail('Este lançamento não está pendente.');x.status='Pago';x.paidDate=s.asOf;if(x.orderId)find(s.orders,x.orderId,'Pedido').paymentStatus='Pago';log='Pagamento registrado: '+x.description;
    }else if(action==='task.save'){
      const id=p.id||uid('d');if(p.id)find(s.tasks,p.id,'Prazo');find(s.team,p.ownerId,'Responsável');const x={id,title:str(p.title,'Título'),date:date(p.date),ownerId:p.ownerId,priority:choice(p.priority,['Alta','Média','Baixa'],'Prioridade'),status:p.id?find(s.tasks,p.id,'Prazo').status:'Pendente',description:typeof p.description==='string'?p.description.slice(0,500):''};if(p.id)s.tasks=s.tasks.map(t=>t.id===p.id?x:t);else s.tasks.unshift(x);log='Prazo registrado: '+x.title;
    }else if(action==='task.toggle'){
      const x=find(s.tasks,p.id,'Prazo');x.status=x.status==='Concluído'?'Pendente':'Concluído';log='Prazo '+x.status.toLowerCase()+': '+x.title;
    }else if(action==='team.save'){
      const id=p.id||uid('e');if(p.id)find(s.team,p.id,'Colaborador');const x={id,name:str(p.name,'Nome'),role:str(p.role,'Cargo'),area:str(p.area,'Área'),email:str(p.email,'E-mail'),phone:p.phone||'',status:choice(p.status||'Ativo',['Ativo','Inativo'],'Status')};if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email))fail('Informe um e-mail válido.');if(s.team.some(t=>t.id!==id&&normalize(t.email)===normalize(x.email)))fail('E-mail já cadastrado na equipe.');if(p.id)s.team=s.team.map(t=>t.id===id?x:t);else s.team.unshift(x);log='Equipe atualizada: '+x.name;
    }else if(action==='company.save'){
      s.company={...s.company,name:str(p.name,'Empresa'),owner:str(p.owner,'Responsável'),email:str(p.email,'E-mail'),phone:str(p.phone,'Telefone',40),address:str(p.address,'Endereço',240),segment:str(p.segment,'Segmento'),monthlyGoal:num(p.monthlyGoal,'Meta mensal',1),description:typeof p.description==='string'?p.description.slice(0,500):s.company.description};log='Perfil da empresa atualizado.';
    }else if(action==='whatsapp.send'){
      const c=find(s.conversations,p.id,'Conversa');c.messages.push({id:uid('msg'),from:'business',text:str(p.text,'Mensagem',2000),time:now});c.unread=false;log='Mensagem registrada na conversa demonstrativa.';
    }else if(action==='whatsapp.read'){
      find(s.conversations,p.id,'Conversa').unread=false;
    }else fail('Operação desconhecida.');
    Support.recordBusinessEvent(s,action,now);
    if(log)s.activity.unshift({id:uid('a'),date:now,text:log,kind:action.split('.')[0]});s.activity=s.activity.slice(0,100);s.revision+=1;return s;
  }
  const api={round,money,normalize,uid,period,summary,alerts,mutate};if(typeof module!=='undefined')module.exports=api;else root.SZCore=api;
})(typeof window!=='undefined'?window:globalThis);
