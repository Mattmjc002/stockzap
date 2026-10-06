(function(root){
  'use strict';
  const DAY=86400000;
  const statuses=['Novo','Em atendimento','Aguardando cliente','Resolvido'];
  const priorities=['Alta','Média','Baixa'];
  const eventLabels={login:'Acesso ao aplicativo',sale:'Venda registrada',stock:'Estoque atualizado',finance:'Financeiro utilizado',setup:'Configuração do negócio',task:'Prazo atualizado',chat:'Atendimento utilizado'};
  const shift=(day,n)=>new Date(Date.parse(day+'T12:00:00Z')+n*DAY).toISOString().slice(0,10);
  const days=(from,to)=>Math.floor((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/DAY);
  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const uid=p=>p+'-'+(typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  const fail=msg=>{throw new Error(msg);};
  const get=(list,id,label)=>list.find(x=>x.id===id)||fail(label+' não encontrado.');
  const text=(value,label,max=2000)=>typeof value==='string'&&value.trim()&&value.trim().length<=max?value.trim():fail(label+': preencha até '+max+' caracteres.');
  function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)fail('Informe uma data válida.');return value;}
  const stamp=(day,now)=>day+'T'+now.slice(11,19)+'Z';

  function seed(asOf,company){
    const members=[{id:'sz-matheus',name:'Matheus Milagres',role:'Operações'},{id:'sz-caue',name:'Cauê Mathias',role:'Produto'},{id:'sz-manuela',name:'Manuela Valone',role:'Relacionamento'}];
    const definitions=[
      ['sz-aurora',company?.name||'Empório Aurora',company?.owner||'Marina Costa','Mercado',60,0,14,12,'sz-matheus','WhatsApp',true],
      ['sz-cafe','Café do Cerrado','Rafael Lima','Cafeteria',45,12,0,18,'sz-manuela','WhatsApp',true],
      ['sz-bela','Bela Flor','Júlia Prado','Floricultura',35,1,3,16,'sz-caue','E-mail',true],
      ['sz-padaria','Padaria Horizonte','Bruno Almeida','Padaria',28,8,0,15,'','WhatsApp',true],
      ['sz-vila','Mercado Vila Norte','Renata Dias','Mercado',70,0,18,16,'sz-matheus','WhatsApp',true],
      ['sz-atelie','Ateliê da Ana','Ana Ribeiro','Artesanato',3,1,2,0,'sz-manuela','E-mail',true],
      ['sz-vida','Vida Natural','Gabriel Torres','Produtos naturais',32,2,5,14,'sz-caue','WhatsApp',true],
      ['sz-pet','Pet da Quadra','Carolina Luz','Pet shop',40,0,12,13,'sz-manuela','E-mail',true],
      ['sz-tech','Oficina Tech','Paulo Nunes','Serviços',20,null,0,0,'','E-mail',false],
      ['sz-doce','Doce Encontro','Beatriz Melo','Confeitaria',2,0,4,0,'sz-matheus','WhatsApp',true]
    ];
    const accounts=definitions.map((r,n)=>({id:r[0],name:r[1],contact:r[2],segment:r[3],joinedAt:shift(asOf,-r[4]),telemetryAvailable:r[5]!==null,ownerId:r[8],preferredChannel:r[9],contactAllowed:r[10],email:n?'gestao@'+r[0].slice(3)+'.example':company?.email||'contato@emporioaurora.example',phone:n?'(61) 99900-'+String(6000+n):company?.phone||'(61) 99900-1234'}));
    const events=[];
    function activity(accountId,offset,type,count){if(count>0)events.push({id:'event-'+accountId+'-'+offset+'-'+type,accountId,date:shift(asOf,offset),type,count});}
    for(const r of definitions){
      const [id,,,,age,idle,recent,previous]=r;
      if(idle===null)continue;
      if(age<=7){activity(id,-idle,'setup',Math.max(1,recent));continue;}
      if(recent){activity(id,-idle,'sale',Math.ceil(recent/2));activity(id,Math.max(-6,-idle-2),'stock',Math.floor(recent/2));}
      if(previous)activity(id,idle>=7?-idle:-9,'sale',previous);
    }
    const tickets=[
      ['case-cafe','sz-cafe','Cliente sem registrar atividades','Confirmar se há dificuldade de uso e oferecer uma retomada assistida.','Novo','Alta',-1,'sz-manuela'],
      ['case-bela','sz-bela','Queda no uso da operação','Entender a redução e revisar o fluxo de registro de vendas.','Em atendimento','Média',0,'sz-caue'],
      ['case-padaria','sz-padaria','Retomada do cadastro de produtos','Cliente deixou de registrar atividades. Oferecer ajuda para retomar o estoque.','Novo','Alta',-2,''],
      ['case-aurora','sz-aurora','Dúvida sobre alertas de estoque','Marina pediu orientação para interpretar o estoque mínimo.','Aguardando cliente','Média',1,'sz-matheus'],
      ['case-atelie','sz-atelie','Primeiros passos no aplicativo','Apoiar o primeiro cadastro de produto e a primeira venda.','Novo','Média',0,'sz-manuela'],
      ['case-vida','sz-vida','Uso do financeiro caiu','Confirmar a rotina atual e revisar a baixa dos recebimentos.','Em atendimento','Média',1,'sz-caue'],
      ['case-tech','sz-tech','Verificar registros de uso','Não há eventos disponíveis. Confirmar a coleta antes de interpretar o engajamento.','Novo','Baixa',2,''],
      ['case-pet','sz-pet','Orientação sobre pedidos concluída','Cliente confirmou que conseguiu registrar a venda.','Resolvido','Baixa',-1,'sz-manuela']
    ].map((r,n)=>({id:r[0],accountId:r[1],title:r[2],description:r[3],status:r[4],priority:r[5],dueDate:shift(asOf,r[6]),ownerId:r[7],createdAt:shift(asOf,-(n%3+1))+'T13:00:00Z',updatedAt:shift(asOf,-(n%3+1))+'T13:00:00Z',resolvedAt:r[4]==='Resolvido'?asOf+'T12:00:00Z':null}));
    const interactions=[
      {id:'contact-aurora',accountId:'sz-aurora',ticketId:'case-aurora',kind:'Contato simulado',channel:'WhatsApp',text:'Orientação sobre estoque mínimo preparada. Aguardando a confirmação da Marina.',actorId:'sz-matheus',actorName:'Matheus Milagres',createdAt:shift(asOf,-1)+'T14:00:00Z',loggedAt:null},
      {id:'contact-pet',accountId:'sz-pet',ticketId:'case-pet',kind:'Resposta simulada',channel:'E-mail',text:'Cliente confirmou que conseguiu registrar o pedido. Caso concluído.',actorId:'sz-manuela',actorName:'Manuela Valone',createdAt:asOf+'T12:00:00Z',loggedAt:null}
    ];
    return {schema:1,members,accounts,events,tickets,interactions};
  }
  function ensure(state){
    if(state.support){if(state.support.schema!==1||!['members','accounts','events','tickets','interactions'].every(k=>Array.isArray(state.support[k])))fail('Os dados do painel de atendimento não puderam ser lidos.');return false;}
    state.support=seed(state.asOf,state.company);return true;
  }
  function analyze(state,account){
    const data=state.support,now=state.asOf;
    const events=data.events.filter(x=>x.accountId===account.id&&x.date>=account.joinedAt&&x.date<=now&&Number.isInteger(x.count)&&x.count>0);
    const lastActivity=events.map(x=>x.date).sort().at(-1)||null;
    const recent=events.filter(x=>x.date>=shift(now,-6)).reduce((n,x)=>n+x.count,0);
    const previous=events.filter(x=>x.date>=shift(now,-13)&&x.date<shift(now,-6)).reduce((n,x)=>n+x.count,0);
    const inactiveDays=lastActivity===null?null:days(lastActivity,now);
    const onboarding=days(account.joinedAt,now)<7;
    const drop=previous>=3?Math.round((1-recent/previous)*100):null;
    const known=account.telemetryAvailable&&lastActivity!==null;
    let risk='Baixo',riskScore=10,reasons=[];
    if(!known){risk='Sem dados';riskScore=null;reasons.push('Sem eventos disponíveis: engajamento ainda não pode ser avaliado.');}
    else if(inactiveDays>=7){risk='Alto';riskScore=80;reasons.push(inactiveDays+' dias sem atividade registrada (limite: 7 dias).');}
    else if(!onboarding&&drop!==null&&drop>=50){risk='Médio';riskScore=55;reasons.push('Atividades caíram '+drop+'%: '+recent+' nos últimos 7 dias, contra '+previous+' nos 7 anteriores.');}
    else{reasons.push(onboarding?'Empresa nos primeiros 7 dias: acompanhar a configuração inicial.':'Atividade recente, sem sinal de queda de 50% ou mais.');}
    const journey=onboarding?'Onboarding':risk==='Alto'?'Reativação':'Engajamento';
    const tickets=data.tickets.filter(x=>x.accountId===account.id);
    const open=tickets.filter(x=>x.status!=='Resolvido');
    const overdue=open.filter(x=>x.dueDate<now);
    const urgency=open.some(x=>x.priority==='Alta')?30:open.some(x=>x.priority==='Média')?15:0;
    const priorityScore=Math.min(100,(riskScore??25)+urgency+(overdue.length?15:0)+(onboarding?10:0));
    const lastContact=data.interactions.filter(x=>x.accountId===account.id&&x.kind==='Contato simulado'&&x.createdAt.slice(0,10)<=now).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0]||null;
    const contactToday=lastContact?.createdAt.slice(0,10)===now;
    const ownerId=open.find(x=>x.ownerId)?.ownerId||account.ownerId;
    return {account,lastActivity,inactiveDays,recent,previous,drop,known,risk,riskScore,reasons,journey,tickets,open,overdue,priorityScore,ownerId,lastContact,contactToday};
  }
  function queue(state,filters={}){
    const query=normalize(filters.text);
    let rows=state.support.accounts.map(a=>analyze(state,a)).filter(r=>{
      if(query&&!normalize(r.account.name+' '+r.account.contact+' '+r.account.segment+' '+r.tickets.map(t=>t.title).join(' ')).includes(query))return false;
      if(filters.risk&&r.risk!==filters.risk)return false;
      if(filters.journey&&r.journey!==filters.journey)return false;
      const status=filters.status??'open';
      if(status==='open'&&!r.open.length)return false;
      if(status==='overdue'&&!r.overdue.length)return false;
      if(statuses.includes(status)&&!r.tickets.some(t=>t.status===status))return false;
      if(filters.owner&&!ticketsForFilters(r,filters).length){
        if(r.tickets.length)return false;
        if(filters.owner==='unassigned'?Boolean(r.account.ownerId):r.account.ownerId!==filters.owner)return false;
      }
      return true;
    });
    rows.sort((a,b)=>filters.sort==='inactivity'?(b.inactiveDays??-1)-(a.inactiveDays??-1)||b.priorityScore-a.priorityScore:filters.sort==='name'?a.account.name.localeCompare(b.account.name,'pt-BR'):b.priorityScore-a.priorityScore||a.account.name.localeCompare(b.account.name,'pt-BR'));
    return rows;
  }
  function ticketsForFilters(row,filters={}){
    const status=filters.status??'open';
    let tickets=status==='open'?row.open:status==='overdue'?row.overdue:statuses.includes(status)?row.tickets.filter(t=>t.status===status):row.tickets;
    if(filters.owner)tickets=tickets.filter(t=>filters.owner==='unassigned'?!t.ownerId:t.ownerId===filters.owner);
    return tickets;
  }
  function summary(state){const rows=state.support.accounts.map(a=>analyze(state,a)),tickets=state.support.tickets,open=tickets.filter(t=>t.status!=='Resolvido');return {accounts:rows.length,open:open.length,highRisk:rows.filter(r=>r.risk==='Alto').length,unknown:rows.filter(r=>!r.known).length,overdue:open.filter(t=>t.dueDate<state.asOf).length,unassigned:open.filter(t=>!t.ownerId).length,resolved:tickets.filter(t=>t.status==='Resolvido'&&t.resolvedAt?.slice(0,10)>=shift(state.asOf,-6)&&t.resolvedAt.slice(0,10)<=state.asOf).length};}
  function suggestion(state,accountId){
    const account=get(state.support.accounts,accountId,'Empresa'),r=analyze(state,account),first=account.contact.split(' ')[0];
    if(!r.known)return 'Nota interna: conferir se os eventos de uso de '+account.name+' estão sendo registrados. Sem esses dados, não classificar a empresa como inativa.';
    if(r.journey==='Onboarding')return 'Olá, '+first+'! Aqui é a equipe da StockZap. Como estão seus primeiros passos? Podemos ajudar a cadastrar um produto e registrar sua primeira venda.';
    if(r.journey==='Reativação')return 'Olá, '+first+'! Aqui é a equipe da StockZap. Gostaríamos de saber como está a rotina do '+account.name+'. Encontrou alguma dificuldade no aplicativo? Podemos ajudar a retomar o uso em uma conversa rápida.';
    if(r.risk==='Médio')return 'Olá, '+first+'! Aqui é a equipe da StockZap. Queremos entender se o aplicativo está ajudando na sua rotina. Há alguma etapa em que você gostaria de receber uma orientação?';
    return 'Olá, '+first+'! Aqui é a equipe da StockZap. Estamos acompanhando seu atendimento. Qual dúvida ou etapa do aplicativo podemos ajudar a resolver?';
  }
  function history(state,accountId){
    const data=state.support;
    return [...data.interactions.filter(x=>x.accountId===accountId),...data.tickets.filter(t=>t.accountId===accountId).map(t=>({id:'created-'+t.id,accountId,kind:'Atendimento aberto',channel:'Interno',text:t.title,actorName:'StockZap',createdAt:t.createdAt,loggedAt:t.createdLoggedAt,ticketId:t.id}))].sort((a,b)=>(b.loggedAt||b.createdAt).localeCompare(a.loggedAt||a.createdAt));
  }
  function apply(state,action,p,now){
    const data=state.support,createdAt=stamp(state.asOf,now);
    if(action==='support.create'){
      const account=get(data.accounts,p.accountId,'Empresa');
      const client=p.origin==='client';
      if(client&&account.id!=='sz-aurora')fail('O atendimento do aplicativo deve pertencer à empresa atual.');
      const ownerId=client?'':p.ownerId||'';if(ownerId)get(data.members,ownerId,'Responsável');
      const priority=client?'Média':p.priority||'Média';if(!priorities.includes(priority))fail('Prioridade inválida.');
      const dueDate=client?shift(state.asOf,1):validDate(p.dueDate||shift(state.asOf,1));
      const ticket={id:uid('case'),accountId:account.id,title:text(p.title,'Título',140),description:text(p.description,'Descrição',2000),status:'Novo',priority,dueDate,ownerId,createdAt,createdLoggedAt:now,updatedAt:createdAt,resolvedAt:null};
      data.tickets.unshift(ticket);
      data.interactions.unshift({id:uid('history'),accountId:account.id,ticketId:ticket.id,kind:client?'Solicitação do cliente':'Nota interna',channel:'Interno',text:ticket.description,actorName:client?state.company.owner:'Equipe StockZap',createdAt,loggedAt:now});
    }else if(action==='support.update'){
      const ticket=get(data.tickets,p.id,'Atendimento');
      if(!statuses.includes(p.status))fail('Status inválido.');if(!priorities.includes(p.priority))fail('Prioridade inválida.');
      const ownerId=p.ownerId||'';if(ownerId)get(data.members,ownerId,'Responsável');
      if(p.status!=='Novo'&&!ownerId)fail('Escolha um responsável para acompanhar o atendimento.');
      const note=text(p.note,'Resumo da atualização',2000),dueDate=validDate(p.dueDate);
      const changes=[];if(ticket.status!==p.status)changes.push('Status: '+ticket.status+' → '+p.status);if(ticket.ownerId!==ownerId)changes.push('Responsável: '+(ownerId?get(data.members,ownerId,'Responsável').name:'sem responsável'));if(ticket.priority!==p.priority)changes.push('Prioridade: '+p.priority);if(ticket.dueDate!==dueDate)changes.push('Retorno: '+dueDate);
      ticket.status=p.status;ticket.priority=p.priority;ticket.ownerId=ownerId;ticket.dueDate=dueDate;ticket.updatedAt=createdAt;ticket.resolvedAt=p.status==='Resolvido'?(ticket.resolvedAt||createdAt):null;
      data.interactions.unshift({id:uid('history'),accountId:ticket.accountId,ticketId:ticket.id,kind:'Atualização do atendimento',channel:'Interno',text:(changes.length?changes.join(' · ')+'.\n':'')+note,actorId:ownerId,actorName:ownerId?get(data.members,ownerId,'Responsável').name:'Equipe StockZap',createdAt,loggedAt:now});
    }else if(action==='support.interaction'){
      const account=get(data.accounts,p.accountId,'Empresa'),member=get(data.members,p.actorId,'Responsável');
      if(!['Nota interna','Contato simulado','Resposta simulada'].includes(p.kind))fail('Tipo de interação inválido.');
      const channel=p.kind==='Nota interna'?'Interno':p.channel;if(!['Interno','WhatsApp','E-mail','Telefone'].includes(channel))fail('Canal inválido.');if(p.kind!=='Nota interna'&&channel==='Interno')fail('Escolha o canal da simulação.');
      if(p.ticketId){const ticket=get(data.tickets,p.ticketId,'Atendimento');if(ticket.accountId!==account.id)fail('O atendimento pertence a outra empresa.');}
      if(p.kind==='Contato simulado'){
        if(!account.contactAllowed)fail('Esta empresa está com contatos externos pausados. Registre uma nota interna.');
        if(analyze(state,account).contactToday)fail('Já existe um contato simulado hoje. Aguarde a próxima data para evitar mensagens repetidas.');
      }
      data.interactions.unshift({id:uid('contact'),accountId:account.id,ticketId:p.ticketId||null,kind:p.kind,channel,text:text(p.text,'Mensagem',2000),actorId:member.id,actorName:member.name,createdAt,loggedAt:now});
    }else fail('Operação de atendimento desconhecida.');
    return '';
  }
  function recordBusinessEvent(state,action,now){
    const types={'order.create':'sale','order.status':'sale','stock.move':'stock','product.save':'stock','product.archive':'stock','transaction.create':'finance','transaction.pay':'finance','company.save':'setup','task.save':'task','task.toggle':'task','whatsapp.send':'chat','team.save':'setup'};
    const account=state.support.accounts.find(x=>x.id==='sz-aurora');
    if(account){account.name=state.company.name;account.contact=state.company.owner;account.email=state.company.email;account.phone=state.company.phone;}
    const type=types[action];if(!type||!account)return;
    state.support.events.push({id:uid('event'),accountId:account.id,date:state.asOf,type,count:1,loggedAt:now});
  }
  const api={seed,ensure,analyze,queue,ticketsForFilters,summary,suggestion,history,apply,recordBusinessEvent,shift,statuses,priorities,eventLabels};
  if(typeof module!=='undefined')module.exports=api;else root.SZSupport=api;
})(typeof window!=='undefined'?window:globalThis);
