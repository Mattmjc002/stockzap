(function(){
  'use strict';
  const C=window.SZCore,U=window.SZUI,V=window.SZViews,S=window.SZSupport,SV=window.SZSupportViews,{esc:e,icon:i,date:d,badge:b,statusBadge:sb,initials}=U,money=C.money;
  const routes=[['dashboard','Visão geral','dashboard'],['produtos','Produtos','box'],['estoque','Estoque','inventory'],['pedidos','Pedidos','orders'],['financeiro','Financeiro','finance'],['prazos','Prazos','calendar'],['equipe','Equipe','users'],['whatsapp','WhatsApp','chat'],['zapcare','ZapCare','spark']];
  const key='stockzap:aurora:v1',chatKey='stockzap:zapcare:v1';
  let state,mode='local',aiEnabled=false,saving=false,filters={},page=1,period='month',stockTab='products',settingsTab='company',wa='w0',route='',theme='light',messages=[],chatOpen=false,chatBusy=false,chatDraft='',localRaw=null;
  let supportAccount='';
  try{theme=localStorage.getItem('stockzap:theme')||'light';const saved=JSON.parse(localStorage.getItem(chatKey)||'[]');if(Array.isArray(saved))messages=saved.filter(m=>['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-40);}catch{}
  const app=document.getElementById('app'),modalRoot=document.getElementById('modal-root'),chatRoot=document.getElementById('chat-root');
  const toast=(text,error=false)=>{const node=document.createElement('div');node.className='toast'+(error?' error':'');node.innerHTML=i(error?'warning':'circleCheck')+'<span>'+e(text)+'</span>';document.getElementById('toasts').append(node);setTimeout(()=>node.remove(),4500);};
  async function request(path,body){
    const res=await fetch('api/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(path==='zapcare'?30000:8000)});
    let data;try{data=await res.json();}catch{throw new Error('Resposta inválida do servidor.');}
    if(!res.ok){if(res.status===409&&data.state){state=data.state;render();}throw new Error(data.error||'Não foi possível concluir a operação.');}return data;
  }
  function loadLocal(){
    localRaw=localStorage.getItem(key);if(localRaw===null){state=window.SZDemo.seed();localRaw=JSON.stringify(state);localStorage.setItem(key,localRaw);}else{state=JSON.parse(localRaw);if(state.schema!==1||!Array.isArray(state.products))throw new Error('Os dados locais não puderam ser lidos. Exporte ou preserve o armazenamento antes de restaurar.');}
    if(S.ensure(state)){state.revision+=1;localRaw=JSON.stringify(state);localStorage.setItem(key,localRaw);}
  }
  async function init(){
    try{
      if(location.protocol==='file:'){loadLocal();}
      else{
        let res;try{res=await fetch('api/state',{signal:AbortSignal.timeout(5000)});}catch{res=null;}
        if(res?.ok&&res.headers.get('Content-Type')?.includes('application/json')){const data=await res.json();state=data.state;mode='server';aiEnabled=data.aiEnabled;}
        else if(res&&![200,404,405].includes(res.status))throw new Error('O servidor está indisponível. Recarregue a página para tentar novamente.');
        else{loadLocal();}
      }
      U.applyTheme(theme);route=readRoute();render();
      if(mode==='local')toast('Demonstração salva neste navegador.');
    }catch(err){app.innerHTML=`<main class="error-page"><div><h2>Não foi possível abrir a demonstração</h2><p>${e(err.message)}</p><button class="btn btn-primary" data-act="reload">Tentar novamente</button><a class="btn btn-secondary" href="index.html">Voltar ao início</a></div></main>`;}
  }
  const readRoute=()=>{const value=location.hash.slice(1).split('?')[0];return [...routes.map(r=>r[0]),'configuracoes','atendimentos'].includes(value)?value:'dashboard';};
  const context=()=>({state,route,filters,page,period,stockTab,settingsTab,wa,theme,mode,aiEnabled,supportAccount});
  function render(){
    if(!state)return;
    if(route==='atendimentos'){document.title='Atendimentos · Equipe StockZap';app.innerHTML=SV.shell(context());renderContent();renderDock();return;}
    const title=routes.find(x=>x[0]===route)?.[1]||'Configurações';document.title=title+' · '+state.company.name+' · StockZap';
    const name=state.company.owner,notices=C.alerts(state).length;
    app.innerHTML=`<div class="sidebar-scrim" data-act="menu-close"></div><aside class="sidebar" aria-label="Menu principal"><div class="sidebar-brand"><a href="#dashboard" aria-label="StockZap, visão geral"><img class="logo" src="imagens/StockZap_logo.svg" alt="StockZap"></a><button class="icon-btn sidebar-close" data-act="menu-close" aria-label="Fechar menu">${i('close')}</button></div><div class="workspace"><span class="avatar">${initials(state.company.name)}</span><div><strong>${e(state.company.name)}</strong><small>Seu espaço de gestão</small></div></div><div class="nav-label">SEU NEGÓCIO</div><nav>${routes.map(([id,label,icon])=>`<a class="nav-item ${route===id?'active':''}" href="#${id}" ${route===id?'aria-current="page"':''}>${i(icon)}<span>${label}</span>${id==='pedidos'&&C.summary(state).activeOrders.length?'<span class="nav-count">'+C.summary(state).activeOrders.length+'</span>':id==='whatsapp'&&state.conversations.some(c=>c.unread)?'<span class="nav-count">'+state.conversations.filter(c=>c.unread).length+'</span>':''}${id==='zapcare'?'<span class="nav-count" style="color:var(--green-dark)">AI</span>':''}</a>`).join('')}</nav><div class="nav-label">EQUIPE STOCKZAP</div><nav><a class="nav-item" href="#atendimentos">${i('chat')}<span>Atendimentos</span><span class="nav-count">${S.summary(state).open}</span></a></nav><div class="sidebar-bottom"><div class="care-promo"><strong>${i('spark')}Um próximo passo mais claro</strong><p>Converse com os dados do seu negócio.</p><button class="btn" data-act="care-open">Abrir ZapCare ${i('arrow')}</button></div><a class="nav-item ${route==='configuracoes'?'active':''}" href="#configuracoes">${i('settings')}Configurações</a><button class="nav-item" data-act="logout">${i('logout')}Sair da demonstração</button><div class="sidebar-foot">STOCKZAP · VERSÃO DE APRESENTAÇÃO</div></div></aside><div class="app-main"><header class="topbar"><div class="topbar-title"><button class="icon-btn mobile-menu" data-act="menu-open" aria-label="Abrir menu" aria-expanded="false">${i('menu')}</button><span class="breadcrumb-company">${e(state.company.name)}</span><span class="breadcrumb-company">/</span><strong>${title}</strong></div><div class="topbar-right"><span class="demo-pill"><i class="dot"></i>Demonstração</span><button class="top-search" data-act="search" aria-label="Buscar no negócio">${i('search')}<span>Buscar no negócio…</span><kbd>Ctrl K</kbd></button><button class="icon-btn ${notices?'bell':''}" data-act="notifications" aria-label="Notificações, ${notices} alertas">${i('bell')}</button><a class="profile-link" href="#configuracoes" aria-label="Perfil de ${e(name)}"><span class="avatar">${initials(name)}</span><div><strong>${e(name)}</strong><small>Proprietária</small></div></a></div></header><main class="app-content" id="page-content"></main></div>`;
    renderContent();renderDock();
  }
  function renderContent(){
    const active=document.activeElement,filter=active?.dataset?.filter,position=active?.selectionStart;
    const content=document.getElementById('page-content');if(!content)return;content.innerHTML=route==='atendimentos'?SV.panel(context()):V[route](context());
    if(route==='zapcare'){chatOpen=false;drawChat(document.getElementById('care-full'),true);}
    if(filter){const input=content.querySelector('[data-filter="'+filter+'"]');input?.focus();if(typeof position==='number')try{input.setSelectionRange(position,position);}catch{}}
    const w=document.getElementById('wa-messages');if(w)w.scrollTop=w.scrollHeight;
  }
  async function perform(action,payload,options={}){
    if(saving)throw new Error('Aguarde a operação anterior terminar.');saving=true;
    try{
      if(mode==='server'){const data=await request('action',{action,payload,revision:state.revision});state=data.state;}
      else{if(localStorage.getItem(key)!==localRaw){loadLocal();render();throw new Error('Os dados mudaram em outra aba. Revise e tente novamente.');}const next=C.mutate(state,action,payload);const raw=JSON.stringify(next);localStorage.setItem(key,raw);localRaw=raw;state=next;}
      if(options.render!==false)render();if(options.toast!==false)toast(options.message||'Alteração salva.');return state;
    }finally{saving=false;}
  }
  function modal(title,body,wide=false){
    captureDraft();modalRoot.innerHTML=`<div class="overlay" id="modal-overlay"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-head"><h2 id="modal-title">${title}</h2><button class="icon-btn" data-act="modal-close" aria-label="Fechar janela">${i('close')}</button></header><div class="modal-body">${body}</div></section></div>`;document.body.classList.add('body-locked');setTimeout(()=>modalRoot.querySelector('input,select,textarea,button[data-act]:not([data-act="modal-close"])')?.focus(),30);
  }
  let beforeModal=null;
  function openModal(title,body,wide=false){beforeModal=document.activeElement;modal(title,body,wide);}
  function closeModal(){modalRoot.innerHTML='';document.body.classList.remove('body-locked');beforeModal?.focus();beforeModal=null;}
  const footer=(text='Salvar')=>`<div class="form-error" hidden></div><div class="form-actions"><button type="button" class="btn btn-secondary" data-act="modal-close">Cancelar</button><button class="btn btn-primary" type="submit">${i('check')}${text}</button></div>`;
  const field=V.field;
  const selectField=(label,name,values,current='',full=false)=>`<label class="field ${full?'full':''}">${label}<select name="${name}" required>${values.map(x=>{const value=typeof x==='string'?x:x.id,txt=typeof x==='string'?x:x.name;return `<option value="${e(value)}" ${value===current?'selected':''}>${e(txt)}</option>`;}).join('')}</select></label>`;
  const dataOf=form=>Object.fromEntries(new FormData(form));
  const numeric=(obj,names)=>{for(const name of names)obj[name]=Number(obj[name]);return obj;};
  const supportOwnerSelect=(value='')=>`<label class="field">Responsável<select name="ownerId"><option value="">Sem responsável</option>${state.support.members.map(m=>`<option value="${e(m.id)}" ${m.id===value?'selected':''}>${e(m.name)}</option>`).join('')}</select></label>`;
  function supportNew(accountId,client=false){
    if(client)accountId='sz-aurora';
    const chosen=accountId||supportAccount||S.queue(state,filters)[0]?.account.id||'sz-aurora';
    const account=state.support.accounts.find(a=>a.id===chosen)||state.support.accounts[0];
    openModal(client?'Solicitar atendimento da StockZap':'Novo atendimento',`<form id="support-new-form"><input type="hidden" name="origin" value="${client?'client':'team'}">${client?`<input type="hidden" name="accountId" value="${e(account.id)}"><p class="support-form-intro">Conte sua dúvida sobre o aplicativo. A solicitação aparecerá no painel da equipe StockZap com os dados de ${e(account.name)}.</p>`:''}<div class="fields">${!client?selectField('Empresa cliente','accountId',state.support.accounts,account.id,true):''}${field('Assunto','title','','text','required maxlength="140"',true)}<label class="field full">Descreva a dúvida ou a próxima ação<textarea name="description" required maxlength="2000" rows="4"></textarea></label>${!client?selectField('Prioridade do atendimento','priority',S.priorities,'Média')+field('Data do retorno','dueDate',S.shift(state.asOf,1),'date','required')+supportOwnerSelect(account.ownerId):''}</div><p class="section-note">Registro demonstrativo. A solicitação não envia mensagens externas.</p>${footer(client?'Registrar solicitação':'Criar atendimento')}</form>`);
  }
  function supportEdit(id){
    const t=state.support.tickets.find(x=>x.id===id);if(!t)throw new Error('Atendimento não encontrado.');
    const a=state.support.accounts.find(x=>x.id===t.accountId);
    supportAccount=a.id;
    openModal('Atualizar atendimento',`<form id="support-edit-form" data-id="${e(id)}"><div class="support-form-intro"><strong>${e(a.name)}</strong><p>${e(t.title)}</p></div><div class="fields">${selectField('Status','status',S.statuses,t.status)}${selectField('Prioridade','priority',S.priorities,t.priority)}${supportOwnerSelect(t.ownerId)}${field('Data do retorno','dueDate',t.dueDate,'date','required')}<label class="field full">Resumo da atualização<textarea name="note" required maxlength="2000" rows="4" placeholder="Registre o que foi feito, o resultado e o próximo passo."></textarea></label></div><p class="section-note">Para concluir ou acompanhar um caso, escolha um responsável. A atualização fica no histórico desta empresa.</p>${footer('Salvar atualização')}</form>`);
  }
  function supportInteraction(id,note=false){
    const account=state.support.accounts.find(x=>x.id===id);if(!account)throw new Error('Empresa não encontrada.');
    const r=S.analyze(state,account),ticket=r.open[0]||r.tickets[0];supportAccount=id;
    openModal(note?'Adicionar nota interna':'Registrar contato simulado',`<form id="support-interaction-form"><input type="hidden" name="accountId" value="${e(id)}"><input type="hidden" name="ticketId" value="${e(ticket?.id||'')}"><div class="support-form-intro"><strong>${e(account.name)}</strong><p>${note?'Anotação para a equipe StockZap.':'Revise a sugestão antes de registrar a simulação. Nenhuma mensagem será enviada.'}</p></div><div class="fields">${note?'<input type="hidden" name="kind" value="Nota interna"><input type="hidden" name="channel" value="Interno">':selectField('Tipo de registro','kind',['Contato simulado','Resposta simulada'],'Contato simulado')+selectField('Canal da simulação','channel',['WhatsApp','E-mail','Telefone'],account.preferredChannel)}${selectField('Registrado por','actorId',state.support.members,r.ownerId||state.support.members[0].id,true)}<label class="field full">${note?'Nota':'Mensagem ou resposta'}<textarea name="text" required maxlength="2000" rows="6">${note?'':e(S.suggestion(state,id))}</textarea></label></div>${footer(note?'Salvar nota':'Registrar simulação')}</form>`);
  }
  function supportExport(){
    const rows=S.queue(state,filters),header=['Empresa','Gestor','Prioridade da fila','Risco','Jornada','Última atividade','Atendimentos abertos','Responsável'];
    const escape=v=>{let t=String(v??'');if(/^[=+@-]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';};
    const values=rows.map(r=>[r.account.name,r.account.contact,r.priorityScore,r.risk,r.journey,r.lastActivity||'Sem dados',r.open.length,state.support.members.find(m=>m.id===r.ownerId)?.name||'Sem responsável']);
    download('stockzap-atendimentos-'+state.asOf+'.csv','\ufeff'+[header,...values].map(row=>row.map(escape).join(';')).join('\r\n'),'text/csv;charset=utf-8');
  }
  function productForm(id){
    const p=state.products.find(p=>p.id===id)||{name:'',sku:'',category:'Mercearia',price:'',cost:'',stock:0,minStock:5,targetStock:20,supplierId:state.suppliers[0].id};
    const categories=[...new Set(state.products.map(p=>p.category))];
    openModal(id?'Editar produto':'Novo produto',`<form id="product-form" data-id="${e(id||'')}"><div class="fields">${field('Nome do produto','name',p.name,'text','required maxlength="140"',true)}${field('Código / SKU','sku',p.sku,'text','required maxlength="60"')}${field('Categoria','category',p.category,'text','required maxlength="60" list="categories"')}<datalist id="categories">${categories.map(c=>'<option value="'+e(c)+'">').join('')}</datalist>${field('Preço de venda (R$)','price',p.price,'number','min="0" step=".01" required')}${field('Custo unitário (R$)','cost',p.cost,'number','min="0" step=".01" required')}${!id?field('Estoque inicial','stock',p.stock,'number','min="0" step="1" required'):''}${field('Estoque mínimo','minStock',p.minStock,'number','min="0" step="1" required')}${field('Estoque ideal','targetStock',p.targetStock,'number','min="0" step="1" required')}${selectField('Fornecedor','supplierId',state.suppliers,p.supplierId)}</div>${id?'<p class="section-note">Altere a quantidade pela tela Estoque para preservar o histórico de movimentações.</p>':''}${footer()}</form>`);
  }
  function stockForm(id){
    const ps=state.products.filter(p=>!p.archived);
    if(!ps.length)return toast('Cadastre um produto antes de movimentar o estoque.',true);
    openModal('Movimentar estoque',`<form id="stock-form"><div class="fields">${selectField('Produto','productId',ps,id||ps[0].id,true)}${selectField('Tipo','type',['Entrada','Saída'],'Entrada')}${field('Quantidade','quantity',1,'number','min="1" step="1" required')}${field('Motivo da movimentação','reason','','text','required maxlength="300"',true)}<label class="field full"><span><input type="checkbox" name="registerExpense" style="width:auto;margin-right:5px">Gerar conta a pagar pela entrada (quantidade × custo)</span><small>Disponível para entradas. A conta será criada como compra de estoque.</small></label>${field('Vencimento da conta','dueDate',state.asOf,'date','required')}</div>${footer('Registrar movimentação')}</form>`);
  }
  function customerForm(){openModal('Cadastrar cliente',`<form id="customer-form"><div class="fields">${field('Nome','name','','text','required',true)}${field('Telefone','phone','','text','required maxlength="40"')}${field('E-mail (opcional)','email','','email')}${field('Endereço (opcional)','address','','text','maxlength="240"',true)}</div>${footer('Cadastrar cliente')}</form>`);}
  function transactionForm(){openModal('Novo lançamento',`<form id="transaction-form"><div class="fields">${selectField('Tipo','type',['Receita','Despesa'],'Despesa')}${field('Valor (R$)','amount','','number','min=".01" step=".01" required')}${field('Descrição','description','','text','required maxlength="200"',true)}${field('Categoria','category','Operação','text','required maxlength="80"')}${selectField('Status','status',['Pendente','Pago'],'Pendente')}${field('Data de competência','date',state.asOf,'date','required')}${field('Vencimento','dueDate',state.asOf,'date','required')}</div>${footer('Criar lançamento')}</form>`);}
  function taskForm(id){
    const t=state.tasks.find(t=>t.id===id)||{title:'',date:state.asOf,ownerId:state.team[0].id,priority:'Média',description:''};
    openModal(id?'Editar prazo':'Novo prazo',`<form id="task-form" data-id="${e(id||'')}"><div class="fields">${field('Título','title',t.title,'text','required maxlength="140"',true)}${field('Data','date',t.date,'date','required')}${selectField('Prioridade','priority',['Alta','Média','Baixa'],t.priority)}${selectField('Responsável','ownerId',state.team,t.ownerId,true)}<label class="field full">Descrição<textarea name="description" maxlength="500">${e(t.description)}</textarea></label></div>${footer()}</form>`);
  }
  function teamForm(id){
    const t=state.team.find(t=>t.id===id)||{name:'',role:'',area:'Operações',email:'',phone:'',status:'Ativo'};
    openModal(id?'Editar colaborador':'Novo colaborador',`<form id="team-form" data-id="${e(id||'')}"><div class="fields">${field('Nome completo','name',t.name,'text','required',true)}${field('Cargo','role',t.role,'text','required')}${field('Área','area',t.area,'text','required')}${field('E-mail','email',t.email,'email','required')}${field('Telefone','phone',t.phone,'text','maxlength="40"')}${selectField('Status','status',['Ativo','Inativo'],t.status)}</div>${footer()}</form>`);
  }
  function orderForm(){
    const ps=state.products.filter(p=>!p.archived&&p.stock>0);if(!ps.length)return toast('Não há produtos disponíveis. Registre uma entrada no estoque.',true);
    openModal('Nova venda',`<form id="order-form"><div class="fields">${selectField('Cliente','customerId',state.customers,state.customers[0].id,true)}${selectField('Canal','channel',['Balcão','WhatsApp','Delivery'],'Balcão')}${selectField('Forma de pagamento','paymentMethod',['Pix','Cartão','Dinheiro'],'Pix')}${selectField('Pagamento','paymentStatus',['Pago','Pendente'],'Pago')}${field('Vencimento','dueDate',state.asOf,'date','required')}</div><h3 style="margin-top:22px;font-size:13px">Itens do pedido</h3><div class="order-lines" id="order-lines"></div><button class="btn btn-secondary btn-sm" type="button" data-act="order-add-line">${i('plus')}Adicionar item</button><div class="order-total" style="margin-top:18px"><span>Total da venda</span><strong id="order-total">R$ 0,00</strong></div><label class="field" style="margin-top:17px">Observações<textarea name="notes" maxlength="400" style="min-height:65px"></textarea></label><p class="section-note">Ao registrar, os itens saem do estoque e a receita é criada no financeiro.</p>${footer('Registrar venda')}</form>`,true);addOrderLine();
  }
  function addOrderLine(){
    const target=document.getElementById('order-lines'),ps=state.products.filter(p=>!p.archived&&p.stock>0);if(!target)return;
    if(target.children.length>=20)return toast('Limite de 20 linhas por venda.',true);
    const node=document.createElement('div');node.className='order-line';node.innerHTML=`<select data-order-product aria-label="Produto do pedido">${ps.map(p=>`<option value="${p.id}">${e(p.name)} · ${money(p.price)} · ${p.stock} un.</option>`).join('')}</select><input type="number" data-order-quantity aria-label="Quantidade do item" min="1" step="1" value="1" required><button class="icon-btn" type="button" data-act="order-remove-line" aria-label="Remover item">${i('close')}</button>`;target.append(node);updateOrderTotal();
  }
  function orderItems(){return Array.from(document.querySelectorAll('.order-line')).map(n=>({productId:n.querySelector('[data-order-product]').value,quantity:Number(n.querySelector('[data-order-quantity]').value)}));}
  function updateOrderTotal(){const node=document.getElementById('order-total');if(node)node.textContent=money(orderItems().reduce((n,x)=>n+(state.products.find(p=>p.id===x.productId)?.price||0)*x.quantity,0));}
  function orderDetail(id){
    const o=state.orders.find(o=>o.id===id),c=state.customers.find(c=>c.id===o.customerId);
    openModal('Pedido #'+o.number,`<div class="detail-grid"><div><small>Cliente</small><p>${e(c.name)}</p></div><div><small>Data e canal</small><p>${d(o.date)} · ${o.channel}</p></div><div><small>Status</small>${sb(o.status)}</div><div><small>Pagamento</small>${sb(o.paymentStatus)} <span style="font-size:11px">${o.paymentMethod}</span></div>${o.notes?'<div class="full"><small>Observações</small><p>'+e(o.notes)+'</p></div>':''}</div><div class="table-scroll"><table><thead><tr><th>Produto</th><th>Qtd.</th><th>Valor</th></tr></thead><tbody>${o.items.map(x=>`<tr><td>${e(x.name)}</td><td>${x.quantity}</td><td>${money(x.price*x.quantity)}</td></tr>`).join('')}</tbody></table></div><div class="order-total" style="margin-top:18px"><span>Total</span><strong>${money(o.total)}</strong></div><div class="form-actions" style="flex-wrap:wrap">${o.status!=='Cancelado'&&o.paymentStatus==='Pendente'?'<button class="btn btn-secondary" data-act="order-pay" data-id="'+o.id+'">'+i('check')+'Registrar pagamento</button>':''}${o.status==='Em preparo'?'<button class="btn btn-primary" data-act="order-status" data-id="'+o.id+'" data-status="Pronto">Marcar como pronto</button>':o.status==='Pronto'?'<button class="btn btn-primary" data-act="order-status" data-id="'+o.id+'" data-status="Entregue">Confirmar entrega</button>':''}${o.status!=='Cancelado'?'<button class="btn btn-secondary" data-act="order-cancel" data-id="'+o.id+'">Cancelar pedido</button>':''}</div>`);
  }
  function confirmModal(title,text,act,id='',label='Confirmar',extra=''){
    openModal(title,`<p class="muted" style="font-size:12px;line-height:1.8">${text}</p><div class="form-actions"><button class="btn btn-secondary" data-act="modal-close">Voltar</button><button class="btn btn-danger" data-act="${act}" data-id="${e(id)}" ${extra}>${label}</button></div>`);
  }
  function searchModal(){
    openModal('Buscar no negócio',`<label class="search-input" style="width:100%">${i('search')}<input id="global-search" placeholder="Produto, código, pessoa ou pedido…" aria-label="Busca geral" style="width:100%"></label><div class="search-results" id="search-results"><p class="muted" style="font-size:12px;padding:15px 0">Comece digitando o nome de um produto, pessoa ou número de pedido.</p></div>`);
  }
  function searchResults(value){
    const q=C.normalize(value.trim()),target=document.getElementById('search-results');if(!target)return;
    if(!q){target.innerHTML='<p class="muted" style="font-size:12px">Digite para buscar.</p>';return;}
    const results=[];
    for(const p of state.products.filter(p=>!p.archived))if(C.normalize(p.name+' '+p.sku).includes(q))results.push({name:p.name,sub:p.sku+' · '+p.stock+' un.',route:'produtos',text:p.sku,icon:'box'});
    for(const p of state.orders)if(C.normalize('#'+p.number+' '+state.customers.find(c=>c.id===p.customerId)?.name).includes(q))results.push({name:'Pedido #'+p.number,sub:money(p.total)+' · '+p.status,route:'pedidos',id:p.id,icon:'orders'});
    for(const p of state.team)if(C.normalize(p.name+' '+p.role).includes(q))results.push({name:p.name,sub:p.role,route:'equipe',text:p.name,icon:'users'});
    for(const p of state.tasks)if(C.normalize(p.title).includes(q))results.push({name:p.title,sub:d(p.date),route:'prazos',id:p.id,icon:'calendar'});
    target.innerHTML=results.slice(0,15).map(r=>`<button class="search-result" data-act="search-select" data-route="${r.route}" data-id="${r.id||''}" data-text="${e(r.text||'')}">${i(r.icon)}<span><strong>${e(r.name)}</strong><small>${e(r.sub)}</small></span>${i('right')}</button>`).join('')||'<div class="empty">Nenhum resultado encontrado.</div>';
  }
  function notifications(){
    const notices=C.alerts(state);
    openModal('Atenção ao negócio',notices.length?`<div class="search-results">${notices.map(x=>`<button class="search-result" data-act="notice-select" data-route="${x.route}"><span class="avatar ${x.level==='danger'?'orange':'green'}">${i('warning')}</span><span><strong>${e(x.title)}</strong><small>${e(x.text)}</small></span></button>`).join('')}</div>`:'<div class="empty">'+i('circleCheck')+'<h3>Tudo em dia</h3><p>Não há alertas de estoque, contas ou prazos.</p></div>');
  }
  function download(name,text,type='application/json'){
    const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Arquivo exportado.');
  }
  function exportCSV(){
    let rows,headers,filename;
    if(route==='financeiro'){const r=C.period(state,period);headers=['Descrição','Tipo','Categoria','Valor','Data','Vencimento','Status'];rows=state.transactions.filter(t=>t.date>=r.start&&t.date<=r.end&&(!filters.type||t.type===filters.type)&&(!filters.status||t.status===filters.status)&&(!filters.text||C.normalize(t.description+' '+t.category).includes(C.normalize(filters.text)))).map(t=>[t.description,t.type,t.category,t.amount.toFixed(2).replace('.',','),t.date,t.dueDate,t.status]);filename='financeiro';}
    else{headers=['Código','Produto','Categoria','Preço','Custo','Estoque','Mínimo','Ideal'];rows=state.products.filter(p=>!p.archived&&(!filters.category||p.category===filters.category)&&(!filters.text||C.normalize(p.name+' '+p.sku).includes(C.normalize(filters.text)))&&(!filters.status||filters.status==='Baixo'&&p.stock<=p.minStock||filters.status==='Esgotado'&&p.stock===0)).map(p=>[p.sku,p.name,p.category,p.price.toFixed(2).replace('.',','),p.cost.toFixed(2).replace('.',','),p.stock,p.minStock,p.targetStock]);filename='produtos';}
    const escape=v=>{let s=String(v);if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    download('stockzap-'+filename+'-'+state.asOf+'.csv','\ufeff'+[headers,...rows].map(row=>row.map(escape).join(';')).join('\r\n'),'text/csv;charset=utf-8');
  }
  function persistChat(){try{localStorage.setItem(chatKey,JSON.stringify(messages.slice(-40)));}catch{toast('Não foi possível guardar o histórico do chat.',true);}}
  function formatText(text){return e(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');}
  function captureDraft(){const input=document.querySelector('[data-care-input]');if(input)chatDraft=input.value;}
  function drawChat(target,full=false){
    if(!target)return;
    const greeting=`<div class="care-greeting"><div class="care-symbol">${i('spark')}</div><h2>Seu negócio, em uma conversa.</h2><p>Olá, ${e(state.company.owner.split(' ')[0])}! Posso ajudar a entender os dados do ${e(state.company.name)}. Por onde começamos?</p><div class="care-prompts">${[['O que preciso repor?','inventory'],['Como estão minhas vendas este mês?','finance'],['Quais contas preciso pagar?','calendar'],['O que devo priorizar no negócio?','spark']].map(([q,icon])=>`<button class="care-prompt" data-act="care-ask" data-question="${q}"><span>${i(icon)} ${q}</span>${i('right')}</button>`).join('')}</div></div>`;
    const history=messages.map((m,j)=>m.role==='user'?`<div class="care-message user"><div class="message-text">${e(m.text)}</div></div>`:`<div class="care-message assistant"><div class="message-meta">${i('spark')}ZAPCARE · ${m.engine==='ai'?'IA generativa':'Consulta local'}</div><div class="message-text">${formatText(m.text)}</div>${m.notice?'<p class="section-note">'+e(m.notice)+'</p>':''}${m.sources?.length?'<div class="sources">Fontes: '+e(m.sources.join(' · '))+' · Base em '+d(m.asOf||state.asOf)+'</div>':''}${m.revision&&m.revision!==state.revision?'<div class="sources">Os dados mudaram após esta resposta. Pergunte novamente para atualizar.</div>':''}<div class="care-message-actions">${(m.actions||[]).map(a=>`<a href="#${e(a.route)}" class="btn btn-secondary" data-act="care-route">${e(a.label)}${i('right')}</a>`).join('')}<button class="btn btn-ghost" data-act="care-copy" data-id="${j}" aria-label="Copiar resposta">${i('copy')}</button></div></div>`).join('');
    target.innerHTML=`${full?'<div class="care-dock-head"><span class="care-symbol">'+i('spark')+'</span><div><strong>ZapCare</strong><small>Assistente de '+e(state.company.name)+'</small></div><span class="badge green" style="margin-left:auto"><i class="dot"></i>'+ (aiEnabled?'IA conectada':'Demonstração')+'</span></div>':''}<div class="care-chat-body" role="log" aria-label="Conversa com ZapCare" aria-live="polite">${messages.length?history:greeting}${chatBusy?'<div class="care-loading" role="status"><span></span><span></span><span></span><em style="margin-left:7px;font-style:normal">Consultando os dados do negócio…</em></div>':''}</div><form class="care-compose" data-care-form><div class="care-input-wrap"><textarea data-care-input aria-label="Pergunta ao ZapCare" placeholder="Pergunte sobre seu negócio…" rows="1" maxlength="3000" ${chatBusy?'disabled':''}>${e(chatDraft)}</textarea><button class="btn btn-primary" aria-label="Enviar pergunta" type="submit" ${chatBusy?'disabled':''}>${i('send')}</button></div><div class="care-footnote">${aiEnabled?'Respostas geradas por IA. Confira os dados.':'Consulta local aos dados · Empresa fictícia'}</div><button type="button" class="care-handoff" data-act="support-request">${i('users')}Solicitar atendimento da StockZap</button></form>`;
    const body=target.querySelector('.care-chat-body');body.scrollTop=body.scrollHeight;
  }
  function renderDock(){
    if(!state)return;
    if(route==='zapcare'||route==='atendimentos'){chatRoot.innerHTML='';return;}
    if(!chatOpen){chatRoot.innerHTML=`<button class="care-launcher" data-act="care-open" aria-label="Abrir ZapCare">${i('spark')}<span><strong>ZapCare</strong><small>Vamos conversar?</small></span></button>`;return;}
    chatRoot.innerHTML=`<aside class="care-dock" aria-label="Assistente ZapCare"><div class="care-dock-head"><span class="care-symbol">${i('spark')}</span><div><strong>ZapCare</strong><small>Assistente do seu negócio</small></div><div class="care-dock-actions"><button class="icon-btn" data-act="care-clear" aria-label="Nova conversa">${i('plus')}</button><button class="icon-btn" data-act="care-expand" aria-label="Abrir ZapCare em tela cheia">${i('expand')}</button><button class="icon-btn" data-act="care-close" aria-label="Fechar ZapCare">${i('close')}</button></div></div><div id="dock-content" style="display:flex;flex-direction:column;flex:1;min-height:0"></div></aside>`;drawChat(document.getElementById('dock-content'));
  }
  function redrawChat(){if(route==='zapcare')drawChat(document.getElementById('care-full'),true);else renderDock();}
  async function sendChat(text){
    const question=text.trim();if(!question||chatBusy)return;if(question.length>3000)return toast('Escreva uma pergunta com até 3.000 caracteres.',true);
    captureDraft();chatDraft='';const history=messages.map(m=>({role:m.role,content:m.text}));messages.push({role:'user',text:question});chatBusy=true;if(route!=='zapcare')chatOpen=true;redrawChat();persistChat();
    try{
      let result;if(mode==='server'){result=await request('zapcare',{message:question,history});}else result=window.SZCare.answer(state,question,history);
      messages.push({role:'assistant',...result});messages=messages.slice(-40);persistChat();
    }catch(err){messages.push({role:'assistant',text:'Não foi possível consultar agora. '+err.message,engine:'local',sources:[],asOf:state.asOf});persistChat();}
    finally{chatBusy=false;redrawChat();document.querySelector('[data-care-input]')?.focus();}
  }
  async function refresh(){
    if(mode!=='server'||saving||chatBusy||document.hidden)return;
    try{const data=await request('state');if(data.state.revision!==state.revision){captureDraft();state=data.state;aiEnabled=data.aiEnabled;render();}}catch{}
  }
  const handleError=err=>toast(err.message||'Não foi possível concluir a ação.',true);
  document.addEventListener('click',async event=>{
    const el=event.target.closest('[data-act]');if(!el)return;const action=el.dataset.act,id=el.dataset.id;const modalActions=['product-archive-confirm','order-cancel-confirm','reset-confirm'];
    if(el.tagName==='A'&&['care-route'].includes(action)){chatOpen=false;renderDock();return;}
    event.preventDefault();
    try{
      if(action==='reload')return location.reload();
      if(action==='logout'){try{sessionStorage.removeItem('stockzap:demo-session');}catch{}return location.href='index.html';}
      if(action==='menu-open'){document.querySelector('.sidebar').classList.add('open');document.querySelector('.sidebar-scrim').classList.add('open');el.setAttribute('aria-expanded','true');return;}
      if(action==='menu-close'){document.querySelector('.sidebar')?.classList.remove('open');document.querySelector('.sidebar-scrim')?.classList.remove('open');document.querySelector('[data-act="menu-open"]')?.setAttribute('aria-expanded','false');return;}
      if(action==='modal-close')return closeModal();
      if(action==='support-select'){supportAccount=id;renderContent();if(window.innerWidth<1180)document.getElementById('support-detail')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
      if(action==='support-new')return supportNew(id);
      if(action==='support-request')return supportNew('sz-aurora',true);
      if(action==='support-edit')return supportEdit(id);
      if(action==='support-note'||action==='support-contact')return supportInteraction(id,action==='support-note');
      if(action==='support-clear'){filters={};return renderContent();}
      if(action==='support-rules')return openModal('Critérios de prioridade do ZapCare',SV.rules()+`<div class="form-actions"><button class="btn btn-primary" data-act="modal-close">Entendi</button></div>`,true);
      if(action==='support-export')return supportExport();
      if(action==='support-claim'){
        const t=state.support.tickets.find(x=>x.id===id);if(!t)throw new Error('Atendimento não encontrado.');
        supportAccount=t.accountId;el.disabled=true;
        return await perform('support.update',{id,ownerId:state.support.members[0].id,status:'Em atendimento',priority:t.priority,dueDate:t.dueDate,note:'Atendimento assumido por '+state.support.members[0].name+'.'},{message:'Atendimento assumido.'});
      }
      if(action==='product-new'||action==='product-edit')return productForm(action==='product-edit'?id:null);
      if(action==='product-archive'){const p=state.products.find(x=>x.id===id);return confirmModal('Arquivar produto','O produto <strong>'+e(p.name)+'</strong> sairá do catálogo ativo. Os pedidos e registros anteriores serão preservados.','product-archive-confirm',id,'Arquivar');}
      if(action==='product-archive-confirm'){el.disabled=true;await perform('product.archive',{id});return closeModal();}
      if(action==='stock-new')return stockForm(id);
      if(action==='stock-tab'){stockTab=id;filters={};page=1;return renderContent();}
      if(action==='order-new')return orderForm();
      if(action==='order-add-line')return addOrderLine();
      if(action==='order-remove-line'){el.closest('.order-line').remove();return updateOrderTotal();}
      if(action==='order-detail')return orderDetail(id);
      if(action==='order-status'){el.disabled=true;await perform('order.status',{id,status:el.dataset.status});return orderDetail(id);}
      if(action==='order-pay'){el.disabled=true;const t=state.transactions.find(t=>t.orderId===id);await perform('transaction.pay',{id:t.id});return orderDetail(id);}
      if(action==='order-cancel'){const o=state.orders.find(o=>o.id===id);return confirmModal('Cancelar pedido #'+o.number,'Os itens serão devolvidos ao estoque e a receita será cancelada na demonstração.','order-cancel-confirm',id,'Cancelar pedido');}
      if(action==='order-cancel-confirm'){el.disabled=true;await perform('order.status',{id,status:'Cancelado'});return closeModal();}
      if(action==='customer-new')return customerForm();
      if(action==='transaction-new')return transactionForm();
      if(action==='transaction-pay'){el.disabled=true;await perform('transaction.pay',{id});return;}
      if(action==='task-new'||action==='task-edit')return taskForm(action==='task-edit'?id:null);
      if(action==='task-toggle'){el.disabled=true;return await perform('task.toggle',{id});}
      if(action==='team-new'||action==='team-edit')return teamForm(action==='team-edit'?id:null);
      if(action==='settings-tab'){settingsTab=id;return renderContent();}
      if(action==='theme'){theme=id;U.applyTheme(theme);return renderContent();}
      if(action==='page-prev'){page=Math.max(1,page-1);return renderContent();}
      if(action==='page-next'){page++;return renderContent();}
      if(action==='wa-select'){wa=id;const c=state.conversations.find(c=>c.id===id);if(c.unread)await perform('whatsapp.read',{id},{toast:false});else renderContent();return;}
      if(action==='search')return searchModal();
      if(action==='notifications')return notifications();
      if(action==='notice-select'){closeModal();if(route===el.dataset.route){filters={};renderContent();}else location.hash=el.dataset.route;return;}
      if(action==='search-select'){
        const next=el.dataset.route,text=el.dataset.text;closeModal();captureDraft();route=next;filters=text?{text}:{};page=1;history.replaceState(null,'','#'+next);render();
        if(id&&next==='pedidos')orderDetail(id);if(id&&next==='prazos')taskForm(id);return;
      }
      if(action==='export')return exportCSV();
      if(action==='export-all')return download('stockzap-aurora-'+state.asOf+'.json',JSON.stringify(state,null,2));
      if(action==='reset'){if(chatBusy)return toast('Aguarde o ZapCare terminar a consulta.');return confirmModal('Restaurar a demonstração','Todas as alterações feitas na empresa fictícia serão substituídas pelos registros iniciais. O histórico do ZapCare neste navegador será limpo.','reset-confirm','','Restaurar');}
      if(action==='reset-confirm'){
        if(chatBusy)return toast('Aguarde a consulta do ZapCare.');
        if(saving)throw new Error('Aguarde a operação anterior.');el.disabled=true;
        if(mode==='server'){const result=await request('reset',{confirm:'RESTAURAR',revision:state.revision});state=result.state;}else{if(localStorage.getItem(key)!==localRaw)throw new Error('Os dados mudaram em outra aba. Atualize antes de restaurar.');const revision=state.revision;state=window.SZDemo.seed();state.revision=revision+1;localRaw=JSON.stringify(state);localStorage.setItem(key,localRaw);}
        messages=[];chatDraft='';persistChat();closeModal();render();return toast('Demonstração restaurada.');
      }
      if(action==='care-open'){if(route==='zapcare')return document.querySelector('[data-care-input]')?.focus();chatOpen=true;renderDock();return document.querySelector('[data-care-input]')?.focus();}
      if(action==='care-close'){captureDraft();chatOpen=false;renderDock();return;}
      if(action==='care-expand'){captureDraft();chatOpen=false;location.hash='zapcare';return;}
      if(action==='care-ask')return await sendChat(el.dataset.question||'Como está meu negócio?');
      if(action==='care-clear'){if(chatBusy)return toast('Aguarde a resposta antes de iniciar outra conversa.');if(!messages.length)return;return confirmModal('Nova conversa','O histórico atual do ZapCare neste navegador será apagado. Os dados da empresa continuam disponíveis.','care-clear-confirm','','Nova conversa');}
      if(action==='care-clear-confirm'){if(chatBusy)return toast('Aguarde a resposta atual.');messages=[];chatDraft='';persistChat();closeModal();return redrawChat();}
      if(action==='care-copy'){await navigator.clipboard.writeText(messages[Number(id)].text);return toast('Resposta copiada.');}
    }catch(err){el.disabled=false;handleError(err);}
  });
  document.addEventListener('input',event=>{
    const el=event.target;
    if(el.dataset.filter){filters[el.dataset.filter]=el.value;page=1;renderContent();}
    if(el.id==='global-search')searchResults(el.value);
    if(el.matches('[data-order-quantity]'))updateOrderTotal();
    if(el.matches('[data-care-input]'))chatDraft=el.value;
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.dataset.filter){filters[el.dataset.filter]=el.value;page=1;renderContent();}
    if(el.hasAttribute('data-period')){period=el.value;page=1;renderContent();}
    if(el.matches('[data-order-product]'))updateOrderTotal();
    if(el.name==='type'&&el.closest('#stock-form')){const check=document.querySelector('[name="registerExpense"]');check.disabled=el.value==='Saída';if(check.disabled)check.checked=false;}
  });
  document.addEventListener('submit',async event=>{
    const form=event.target;event.preventDefault();
    if(form.hasAttribute('data-care-form'))return sendChat(form.querySelector('[data-care-input]').value);
    const submit=form.querySelector('[type="submit"]');if(!submit)return;submit.disabled=true;const error=form.querySelector('.form-error');if(error)error.hidden=true;
    try{
      let data=dataOf(form),action;
      if(form.id==='product-form'){action='product.save';numeric(data,['price','cost','minStock','targetStock']);if(form.dataset.id)data.id=form.dataset.id;else data.stock=Number(data.stock);}
      else if(form.id==='stock-form'){action='stock.move';numeric(data,['quantity']);data.registerExpense=Boolean(data.registerExpense);}
      else if(form.id==='customer-form')action='customer.save';
      else if(form.id==='transaction-form'){action='transaction.create';numeric(data,['amount']);}
      else if(form.id==='task-form'){action='task.save';if(form.dataset.id)data.id=form.dataset.id;}
      else if(form.id==='team-form'){action='team.save';if(form.dataset.id)data.id=form.dataset.id;}
      else if(form.id==='company-form'){action='company.save';numeric(data,['monthlyGoal']);}
      else if(form.id==='order-form'){action='order.create';data.items=orderItems();}
      else if(form.id==='wa-compose'){action='whatsapp.send';data={id:wa,text:data.message};}
      else if(form.id==='support-new-form'){action='support.create';supportAccount=data.accountId;}
      else if(form.id==='support-edit-form'){action='support.update';data.id=form.dataset.id;}
      else if(form.id==='support-interaction-form')action='support.interaction';
      else return;
      await perform(action,data,{message:action==='order.create'?'Venda registrada. Estoque e financeiro atualizados.':action==='whatsapp.send'?'Mensagem registrada na demonstração.':action==='support.create'?'Atendimento registrado para a equipe StockZap.':action==='support.interaction'?'Interação registrada na demonstração.':'Alteração salva.'});
      if(form.closest('.modal'))closeModal();
    }catch(err){if(error){error.hidden=false;error.textContent=err.message;}else handleError(err);}
    finally{submit.disabled=false;}
  });
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(state)searchModal();return;}
    if(event.key==='Escape'){if(modalRoot.firstChild)closeModal();else if(chatOpen){captureDraft();chatOpen=false;renderDock();}else document.querySelector('[data-act="menu-close"]')?.click();}
    if(event.key==='Enter'&&!event.shiftKey&&event.target.matches('[data-care-input]')){event.preventDefault();sendChat(event.target.value);}
    if(event.key==='Tab'&&modalRoot.firstChild){const focusable=Array.from(modalRoot.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea')).filter(x=>x.offsetParent);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
  });
  modalRoot.addEventListener('click',event=>{if(event.target.id==='modal-overlay')closeModal();});
  window.addEventListener('hashchange',()=>{captureDraft();route=readRoute();filters={};page=1;render();window.scrollTo({top:0});});
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  window.addEventListener('storage',event=>{
    if(mode==='local'&&event.key===key){try{loadLocal();captureDraft();render();}catch(err){handleError(err);}}
    if(event.key==='stockzap:theme'){theme=event.newValue||'light';U.applyTheme(theme);renderContent();}
  });
  setInterval(refresh,15000);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(theme==='system')U.applyTheme('system');});
  init();
})();
