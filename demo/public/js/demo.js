(function(root) {
  'use strict';
  const round = v => Math.round(v * 100) / 100;
  function seed() {
    const company = { name:'Empório Aurora', owner:'Marina Costa', email:'contato@emporioaurora.example', phone:'(61) 99900-1234', address:'Asa Norte, Brasília · DF', segment:'Mercado e produtos artesanais', description:'Um empório de bairro com alimentos, cafés especiais e produtos locais. Atendimento no balcão, por delivery e pelo WhatsApp.', openingBalance:18420, monthlyGoal:18000, businessHours:'Segunda a sábado, 8h às 20h', whatsapp:'(61) 99900-1234' };
    const suppliers = [
      {id:'s1',name:'Grãos do Cerrado',contact:'Rafael Silva',phone:'(61) 99800-2001',email:'vendas@graos.example',leadDays:3},
      {id:'s2',name:'Cooperativa Boa Terra',contact:'Ana Prado',phone:'(61) 99800-2002',email:'vendas@boaterra.example',leadDays:2},
      {id:'s3',name:'Sabor Artesanal',contact:'Lucas Dias',phone:'(61) 99800-2003',email:'vendas@sabor.example',leadDays:4},
      {id:'s4',name:'Distribuidora Horizonte',contact:'Carla Alves',phone:'(61) 99800-2004',email:'vendas@horizonte.example',leadDays:5}
    ];
    const rows = [
      ['Café Cerrado 500g','CAF-001','Cafés',32.90,20,6,15,45,'s1','coffee'],
      ['Café Especial 250g','CAF-002','Cafés',39.90,24,32,10,40,'s1','coffee'],
      ['Arroz Integral 1kg','GRA-001','Grãos',12.90,7.50,8,20,60,'s1','grain'],
      ['Feijão Carioca 1kg','GRA-002','Grãos',9.90,5.60,54,20,65,'s1','grain'],
      ['Granola Artesanal 400g','GRA-003','Grãos',24.90,13,28,12,40,'s1','grain'],
      ['Mel do Cerrado 300g','ART-001','Artesanais',29.90,17,3,10,25,'s3','honey'],
      ['Geleia de Morango 240g','ART-002','Artesanais',22.90,12,22,8,30,'s3','jar'],
      ['Queijo Minas 500g','LAT-001','Laticínios',34.90,22,0,8,22,'s2','cheese'],
      ['Iogurte Natural 170g','LAT-002','Laticínios',6.90,3.20,42,16,60,'s2','bottle'],
      ['Leite Integral 1L','LAT-003','Laticínios',6.50,4,68,24,90,'s2','bottle'],
      ['Pão de Fermentação Natural','PAN-001','Padaria',18.90,9,18,8,24,'s3','bread'],
      ['Biscoito de Castanha 200g','PAN-002','Padaria',16.90,8,36,12,50,'s3','bread'],
      ['Suco de Uva Integral 1L','BEB-001','Bebidas',19.90,11,30,12,40,'s4','bottle'],
      ['Água com Gás 500ml','BEB-002','Bebidas',3.90,1.80,96,36,120,'s4','bottle'],
      ['Chá de Hibisco 50g','BEB-003','Bebidas',14.90,7,24,8,32,'s4','leaf'],
      ['Azeite Extra Virgem 500ml','MER-001','Mercearia',44.90,29,15,8,25,'s4','bottle'],
      ['Molho de Tomate 340g','MER-002','Mercearia',8.90,4.20,48,16,60,'s4','jar'],
      ['Chocolate 70% 100g','MER-003','Mercearia',17.90,9,38,12,45,'s4','chocolate']
    ];
    const products = rows.map((r,i)=>({id:'p'+(i+1),name:r[0],sku:r[1],category:r[2],price:r[3],cost:r[4],stock:r[5],minStock:r[6],targetStock:r[7],supplierId:r[8],visual:r[9],unit:'un.'}));
    const customers = ['João Pereira','Luiza Martins','Pedro Santos','Beatriz Lima','Gabriel Rocha','Fernanda Alves','Camila Nunes','André Oliveira','Juliana Ribeiro','Bruno Castro'].map((name,i)=>({id:'c'+(i+1),name,phone:'(61) 99900-'+String(3000+i),email:'cliente'+(i+1)+'@example.com',address:['Asa Norte','Asa Sul','Sudoeste','Lago Norte'][i%4]+', Brasília',notes:i%3===0?'Prefere entrega no período da tarde.':'Cliente do bairro.'}));
    const team = [
      {id:'e1',name:'Marina Costa',role:'Proprietária',area:'Gestão',email:'marina@aurora.example',phone:'(61) 99900-4001',status:'Ativo'},
      {id:'e2',name:'Thiago Mendes',role:'Responsável pelo estoque',area:'Operações',email:'thiago@aurora.example',phone:'(61) 99900-4002',status:'Ativo'},
      {id:'e3',name:'Ana Beatriz',role:'Atendimento e vendas',area:'Comercial',email:'ana@aurora.example',phone:'(61) 99900-4003',status:'Ativo'},
      {id:'e4',name:'Lucas Ferreira',role:'Assistente financeiro',area:'Financeiro',email:'lucas@aurora.example',phone:'(61) 99900-4004',status:'Ativo'},
      {id:'e5',name:'Sofia Almeida',role:'Delivery e WhatsApp',area:'Comercial',email:'sofia@aurora.example',phone:'(61) 99900-4005',status:'Ativo'}
    ];
    const orders=[];
    for(let i=0;i<146;i++) {
      const month=i<46?'08':'09'; const day=String(i>139?30:1+(i<46?i%28:(i-46)%30)).padStart(2,'0');
      const items=[0,1,2].map(j=>{const p=products[(i*7+j*5)%products.length];return {productId:p.id,name:p.name,quantity:1+(i+j)%4,price:p.price,cost:p.cost};});
      const cancelled=i%31===0; const status=cancelled?'Cancelado':i>139?'Em preparo':'Entregue'; const paid=!cancelled && i%13!==0;
      orders.push({id:'o'+(i+1),number:1001+i,customerId:customers[i%10].id,date:'2026-'+month+'-'+day,status,paymentStatus:paid?'Pago':'Pendente',paymentMethod:['Pix','Cartão','Dinheiro'][i%3],channel:['Balcão','WhatsApp','Delivery'][i%3],items,total:round(items.reduce((s,p)=>s+p.price*p.quantity,0)),dueDate:'2026-'+month+'-'+day,notes:status==='Em preparo'?'Separar produtos e confirmar a entrega.':''});
    }
    const transactions=orders.filter(o=>o.status!=='Cancelado').map(o=>({id:'t-'+o.id,type:'Receita',description:'Venda #'+o.number,category:'Vendas',amount:o.total,date:o.date,dueDate:o.date,status:o.paymentStatus==='Pago'?'Pago':'Pendente',orderId:o.id}));
    const expenseRows=[['Aluguel da loja','Estrutura',3200,'05','Pago'],['Energia elétrica','Estrutura',480,'12','Pago'],['Internet e telefone','Estrutura',189.90,'15','Pago'],['Equipe e pró-labore','Pessoal',5400,'25','Pago'],['Campanha de setembro','Marketing',350,'20','Pago'],['Reposição · Grãos do Cerrado','Compras',1850,'30','Pendente'],['Reposição · Boa Terra','Compras',980,'28','Pendente'],['Taxas de cartão','Taxas',245.70,'29','Pago'],['Embalagens para delivery','Operação',280,'18','Pago']];
    expenseRows.forEach((r,i)=>transactions.push({id:'ex'+i,type:'Despesa',description:r[0],category:r[1],amount:r[2],date:'2026-09-'+r[3],dueDate:'2026-09-'+r[3],status:r[4]}));
    transactions.push({id:'ex-prev',type:'Despesa',description:'Despesas de agosto',category:'Operação',amount:8600,date:'2026-08-25',dueDate:'2026-08-25',status:'Pago'});
    const tasks=[
      {id:'d1',title:'Repor café e arroz integral',date:'2026-09-30',ownerId:'e2',priority:'Alta',status:'Pendente',description:'Estoque abaixo do mínimo. Confirmar pedido com Grãos do Cerrado.'},
      {id:'d2',title:'Pagar fornecedor Boa Terra',date:'2026-09-28',ownerId:'e4',priority:'Alta',status:'Pendente',description:'Conta de R$ 980,00 em aberto no financeiro.'},
      {id:'d3',title:'Receber lote de queijo Minas',date:'2026-10-01',ownerId:'e2',priority:'Alta',status:'Pendente',description:'Produto sem estoque. Conferir lote, temperatura e quantidade.'},
      {id:'d4',title:'Preparar campanha de kits de café',date:'2026-10-02',ownerId:'e3',priority:'Média',status:'Pendente',description:'Combinar café especial, pão e geleia em um kit de fim de semana.'},
      {id:'d5',title:'Conferência semanal do caixa',date:'2026-10-03',ownerId:'e4',priority:'Média',status:'Pendente',description:'Conferir recebimentos e pagamentos da semana.'},
      {id:'d6',title:'Organizar vitrine de produtos locais',date:'2026-09-27',ownerId:'e3',priority:'Baixa',status:'Concluído',description:'Vitrine organizada por categorias.'},
      {id:'d7',title:'Confirmar entregas pelo WhatsApp',date:'2026-09-30',ownerId:'e5',priority:'Alta',status:'Pendente',description:'Acompanhar os pedidos em preparo.'}
    ];
    const sold = new Map(products.map(p=>[p.id,0]));
    for(const order of orders.filter(o=>o.status!=='Cancelado'))for(const item of order.items)sold.set(item.productId,sold.get(item.productId)+item.quantity);
    const balances = new Map(products.map(p=>[p.id,p.stock+sold.get(p.id)]));
    const movements = products.map((p,i)=>({id:'m-start-'+i,productId:p.id,type:'Entrada',quantity:balances.get(p.id),reason:'Saldo inicial do histórico demonstrativo',date:'2026-08-01',balance:balances.get(p.id)}));
    for(const order of orders.filter(o=>o.status!=='Cancelado').sort((a,b)=>a.date.localeCompare(b.date)||a.number-b.number))for(const item of order.items){
      const balance=balances.get(item.productId)-item.quantity;balances.set(item.productId,balance);
      movements.push({id:'m-'+order.id+'-'+item.productId,productId:item.productId,type:'Saída',quantity:item.quantity,reason:'Pedido #'+order.number,date:order.date,balance});
    }
    movements.reverse();
    const conversations=customers.slice(0,5).map((c,i)=>({id:'w'+i,customerId:c.id,unread:i<2,messages:[{id:'w'+i+'a',from:'customer',text:['Olá! Vocês têm o Café Cerrado disponível?','Boa tarde, posso retirar meu pedido hoje?','Quero saber mais sobre os kits de café.','Minha entrega chegou, obrigado!','Vocês fazem entrega na Asa Sul?'][i],time:'2026-09-30T'+String(9+i).padStart(2,'0')+':15:00-03:00'}]}));
    return {schema:1,revision:1,asOf:'2026-09-30',company,products,suppliers,customers,team,orders,transactions,tasks,movements,conversations,activity:[{id:'a1',date:'2026-09-30T09:00:00-03:00',text:'Demonstração Empório Aurora carregada.',kind:'Sistema'}]};
  }
  if(typeof module!=='undefined')module.exports={seed};else root.SZDemo={seed};
})(typeof window!=='undefined'?window:globalThis);
