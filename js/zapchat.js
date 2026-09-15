/* =========================================
   STOCKZAP - ZAPCHAT
   Motor de personalização
========================================= */


/* =========================================
   ESTADO DO ZAPCHAT
========================================= */

const respostas = {};

let historico = [];

let perguntaAtual = null;


/* =========================================
   ELEMENTOS
========================================= */

const container = document.getElementById(
	"perguntaContainer"
);

const etapaAtual = document.getElementById(
	"etapaAtual"
);

const totalEtapas = document.getElementById(
	"totalEtapas"
);

const progresso = document.getElementById(
	"progressoPreenchido"
);

const botaoVoltar = document.getElementById(
	"botaoVoltar"
);


/* =========================================
   PERGUNTAS
========================================= */

const perguntas = {

	operacao: {

		titulo: "Como funciona o seu negócio?",

		descricao:
			"Queremos entender onde e como sua operação acontece.",

		tipo: "single",

		opcoes: [

			{
				id: "fixo",
				titulo: "Tenho um local fixo",
				descricao:
					"Minha empresa funciona principalmente em um endereço físico.",
				icone: "⌂"
			},

			{
				id: "movel",
				titulo: "Meu negócio é móvel",
				descricao:
					"Vendo ou presto serviços em diferentes locais.",
				icone: "↗"
			},

			{
				id: "hibrido",
				titulo:
					"Tenho um local fixo e também vendo em outros lugares",
				descricao:
					"Tenho uma operação fixa, mas também vendo fora dela.",
				icone: "⌂↗"
			},

			{
				id: "online",
				titulo:
					"Meu negócio é principalmente online",
				descricao:
					"Minhas vendas acontecem principalmente pela internet.",
				icone: "⌁"
			}

		]

	},


	segmento: {

		titulo: "Que tipo de negócio você tem?",

		descricao:
			"Isso ajuda o StockZap a entender quais ferramentas fazem sentido para você.",

		tipo: "single",

		opcoes: [

			{
				id: "alimentacao",
				titulo: "Alimentação",
				descricao: "Restaurante, lanchonete, confeitaria, food truck etc.",
				icone: "🍴"
			},

			{
				id: "mercado",
				titulo: "Mercado ou conveniência",
				descricao: "Mercados, mercearias e lojas de conveniência.",
				icone: "🛒"
			},

			{
				id: "vestuario",
				titulo: "Vestuário",
				descricao: "Roupas, calçados e acessórios.",
				icone: "◈"
			},

			{
				id: "beleza",
				titulo: "Beleza",
				descricao: "Salão, barbearia, estética ou estúdio.",
				icone: "✦"
			},

			{
				id: "artesanato",
				titulo: "Artesanato",
				descricao: "Produtos artesanais e produção própria.",
				icone: "✋"
			},

			{
				id: "eletronicos",
				titulo: "Eletrônicos",
				descricao: "Venda de eletrônicos e acessórios.",
				icone: "▣"
			},

			{
				id: "casa",
				titulo: "Casa e decoração",
				descricao: "Produtos para casa, decoração e utilidades.",
				icone: "⌂"
			},

			{
				id: "eventos",
				titulo: "Eventos e feiras",
				descricao: "Vendas em eventos, feiras e ocasiões especiais.",
				icone: "★"
			},

			{
				id: "servicos",
				titulo: "Serviços",
				descricao: "Prestação de serviços para clientes.",
				icone: "⚙"
			},

			{
				id: "outro",
				titulo: "Outro",
				descricao: "Meu negócio não se encaixa nessas opções.",
				icone: "..."
			}

		]

	},


	oferta: {

		titulo: "O que você vende?",

		descricao:
			"Conte como seu produto ou serviço chega até o cliente.",

		tipo: "single",

		opcoes: [

			{
				id: "prontos",
				titulo: "Produtos prontos",
				descricao: "Compro ou recebo produtos e revendo.",
				icone: "□"
			},

			{
				id: "producao",
				titulo: "Produção própria",
				descricao: "Eu mesmo produzo o que vendo.",
				icone: "⚒"
			},

			{
				id: "produtos_servicos",
				titulo: "Produtos + serviços",
				descricao: "Meu negócio vende produtos e também presta serviços.",
				icone: "◈"
			},

			{
				id: "servicos",
				titulo: "Só serviços",
				descricao: "Meu negócio trabalha principalmente com serviços.",
				icone: "⚙"
			},

			{
				id: "pre_venda",
				titulo: "Pré-venda / encomenda",
				descricao: "Produzo ou compro principalmente depois do pedido.",
				icone: "◷"
			}

		]

	},


	quantidade: {

		titulo: "Quantos itens diferentes você trabalha?",

		descricao:
			"Pode ser uma estimativa. Queremos entender o tamanho do seu catálogo.",

		tipo: "single",

		opcoes: [

			{
				id: "ate20",
				titulo: "Até 20",
				descricao: "Catálogo pequeno e mais enxuto.",
				icone: "20"
			},

			{
				id: "21_50",
				titulo: "21 a 50",
				descricao: "Tenho uma variedade moderada de produtos.",
				icone: "50"
			},

			{
				id: "51_100",
				titulo: "51 a 100",
				descricao: "Tenho um catálogo relativamente grande.",
				icone: "100"
			},

			{
				id: "mais100",
				titulo: "Mais de 100",
				descricao: "Tenho muitos produtos ou variações.",
				icone: "+100"
			}

		]

	},


	estoque: {

		titulo: "Como você trabalha com estoque?",

		descricao:
			"Isso nos ajuda a entender o quanto o controle de estoque é importante para sua operação.",

		tipo: "single",

		opcoes: [

			{
				id: "estoque",
				titulo: "Mantenho estoque dos produtos",
				descricao: "Tenho produtos disponíveis antes da venda.",
				icone: "▣"
			},

			{
				id: "encomenda",
				titulo: "Trabalho principalmente por encomenda",
				descricao: "Produzo ou compro depois que recebo o pedido.",
				icone: "◷"
			},

			{
				id: "ambos",
				titulo: "Faço os dois",
				descricao: "Tenho estoque, mas também trabalho com encomendas.",
				icone: "◈"
			}

		]

	},


	insumos: {

		titulo: "Você controla matéria-prima ou insumos?",

		descricao:
			"Essa informação é importante para negócios que produzem seus próprios produtos.",

		tipo: "single",

		opcoes: [

			{
				id: "sim",
				titulo: "Sim",
				descricao: "Quero controlar os ingredientes ou materiais utilizados.",
				icone: "✓"
			},

			{
				id: "nao",
				titulo: "Não",
				descricao: "Não preciso controlar matéria-prima.",
				icone: "—"
			}

		]

	},


	receita: {

		titulo: "Você usa receitas ou fichas técnicas?",

		descricao:
			"Por exemplo: uma receita de bolo, uma montagem ou uma ficha de produção.",

		tipo: "single",

		opcoes: [

			{
				id: "sim",
				titulo: "Sim",
				descricao: "Tenho receitas ou fichas que sigo.",
				icone: "✓"
			},

			{
				id: "nao",
				titulo: "Não",
				descricao: "Não trabalho dessa forma.",
				icone: "—"
			}

		]

	},


	canais: {

		titulo: "Onde acontecem suas vendas?",

		descricao:
			"Selecione todos os canais que fazem parte da sua operação.",

		tipo: "multi",

		opcoes: [

			{
				id: "local",
				titulo: "Estabelecimento",
				descricao: "Vendo em uma loja, salão ou espaço físico.",
				icone: "⌂"
			},

			{
				id: "whatsapp",
				titulo: "WhatsApp",
				descricao: "Recebo pedidos ou converso com clientes pelo WhatsApp.",
				icone: "◉"
			},

			{
				id: "instagram",
				titulo: "Instagram",
				descricao: "Recebo clientes ou pedidos pelo Instagram.",
				icone: "◎"
			},

			{
				id: "site",
				titulo: "Site",
				descricao: "Tenho vendas ou pedidos pelo meu site.",
				icone: "⌁"
			},

			{
				id: "feiras",
				titulo: "Feiras e eventos",
				descricao: "Vendo presencialmente em eventos.",
				icone: "★"
			},

			{
				id: "direta",
				titulo: "Venda direta",
				descricao: "Vendo diretamente para pessoas.",
				icone: "●"
			}

		]

	},


	controle: {

		titulo: "Como você controla seu negócio hoje?",

		descricao:
			"Não tem problema se ainda não usa nenhum sistema.",

		tipo: "single",

		opcoes: [

			{
				id: "papel",
				titulo: "Papel e caderno",
				descricao: "Anoto as informações manualmente.",
				icone: "▤"
			},

			{
				id: "planilha",
				titulo: "Planilhas",
				descricao: "Uso Excel, Google Sheets ou algo parecido.",
				icone: "▦"
			},

			{
				id: "sistema",
				titulo: "Outro sistema",
				descricao: "Já utilizo algum software de gestão.",
				icone: "▣"
			},

			{
				id: "cabeca",
				titulo: "Na cabeça",
				descricao: "Ainda controlo muita coisa de memória.",
				icone: "●"
			},

			{
				id: "nada",
				titulo: "Não controlo",
				descricao: "Ainda não tenho um método definido.",
				icone: "—"
			}

		]

	},


	financeiro: {

		titulo: "Como você controla suas finanças?",

		descricao:
			"Queremos entender o nível de organização financeira atual.",

		tipo: "single",

		opcoes: [

			{
				id: "papel",
				titulo: "Papel",
				descricao: "Anoto entradas e saídas manualmente.",
				icone: "▤"
			},

			{
				id: "planilha",
				titulo: "Planilha",
				descricao: "Uso uma planilha.",
				icone: "▦"
			},

			{
				id: "sistema",
				titulo: "Sistema",
				descricao: "Uso algum sistema financeiro.",
				icone: "▣"
			},

			{
				id: "cabeca",
				titulo: "Na cabeça",
				descricao: "Faço o controle mentalmente.",
				icone: "●"
			},

			{
				id: "nada",
				titulo: "Não controlo",
				descricao: "Ainda não faço controle financeiro.",
				icone: "—"
			}

		]

	},


	equipe: {

		titulo: "Quantas pessoas trabalham no negócio?",

		descricao:
			"Pode contar você mesmo na equipe.",

		tipo: "single",

		opcoes: [

			{
				id: "so_eu",
				titulo: "Só eu",
				descricao: "Eu faço praticamente tudo.",
				icone: "1"
			},

			{
				id: "2_3",
				titulo: "2 a 3 pessoas",
				descricao: "Tenho uma equipe pequena.",
				icone: "3"
			},

			{
				id: "4_10",
				titulo: "4 a 10 pessoas",
				descricao: "Tenho uma equipe maior.",
				icone: "10"
			},

			{
				id: "mais10",
				titulo: "Mais de 10",
				descricao: "Tenho uma operação com várias pessoas.",
				icone: "+10"
			}

		]

	},


	whatsapp: {

		titulo: "Qual é o papel do WhatsApp no seu negócio?",

		descricao:
			"Essa resposta ajuda o StockZap a entender como você se comunica com seus clientes.",

		tipo: "single",

		opcoes: [

			{
				id: "principal",
				titulo: "É meu principal canal de vendas",
				descricao: "Grande parte dos pedidos chega pelo WhatsApp.",
				icone: "◉"
			},

			{
				id: "clientes",
				titulo: "Uso para falar com clientes",
				descricao: "Uso bastante, mas não é meu principal canal.",
				icone: "◌"
			},

			{
				id: "pouco",
				titulo: "Uso pouco",
				descricao: "Utilizo apenas ocasionalmente.",
				icone: "○"
			},

			{
				id: "nao",
				titulo: "Não uso",
				descricao: "Não utilizo WhatsApp no negócio.",
				icone: "—"
			}

		]

	},


	prioridade: {

		titulo: "O que mais precisa melhorar hoje?",

		descricao:
			"Escolha o principal problema que você gostaria de resolver.",

		tipo: "single",

		opcoes: [

			{
				id: "estoque",
				titulo: "Estoque",
				descricao: "Quero saber o que tenho, o que está acabando e o que está parado.",
				icone: "▣"
			},

			{
				id: "produtos",
				titulo: "Produtos",
				descricao: "Quero organizar melhor meu catálogo.",
				icone: "□"
			},

			{
				id: "vendas",
				titulo: "Vendas",
				descricao: "Quero vender mais e entender minhas vendas.",
				icone: "↗"
			},

			{
				id: "financeiro",
				titulo: "Financeiro",
				descricao: "Quero entender melhor dinheiro, custos e lucro.",
				icone: "R$"
			},

			{
				id: "pedidos",
				titulo: "Pedidos",
				descricao: "Quero organizar pedidos e não perder encomendas.",
				icone: "✓"
			},

			{
				id: "equipe",
				titulo: "Equipe",
				descricao: "Quero organizar pessoas, acessos e responsabilidades.",
				icone: "●"
			},

			{
				id: "tudo",
				titulo: "Um pouco de tudo",
				descricao: "Quero organizar o negócio como um todo.",
				icone: "✦"
			}

		]

	}

};


/* =========================================
   ORDEM BASE
========================================= */

const fluxoBase = [

	"operacao",

	"segmento",

	"oferta",

	"quantidade",

	"estoque",

	"canais",

	"controle",

	"financeiro",

	"equipe",

	"whatsapp",

	"prioridade"

];


/* =========================================
   DECISÃO DE FLUXO
========================================= */

function construirFluxo() {

	const fluxo = [];


	for (const pergunta of fluxoBase) {

		/*
			Insere a pergunta normalmente.
	*/

		fluxo.push(pergunta);


		/*
			Se o negócio produz,
			abre perguntas específicas.
		*/

		if (
			pergunta === "oferta" &&
			respostas.oferta === "producao"
		) {

			fluxo.push("insumos");

			fluxo.push("receita");

		}

	}


	return fluxo;
}


/* =========================================
   RENDERIZAR PERGUNTA
========================================= */

function renderizarPergunta(chave) {

	perguntaAtual = chave;

	const pergunta = perguntas[chave];

	if (!pergunta) {

		finalizarZapChat();

		return;

	}


	const numero = obterNumeroPergunta(chave);

	const total = construirFluxo().length;


	etapaAtual.textContent = numero;

	totalEtapas.textContent = total;


	const porcentagem =
		(numero / total) * 100;

	progresso.style.width =
		`${porcentagem}%`;


	botaoVoltar.style.visibility =
		historico.length > 0
			? "visible"
			: "hidden";


	let html = `

		<div class="pergunta-numero">
			Etapa ${numero}
		</div>

		<h1 class="pergunta-titulo">
			${pergunta.titulo}
		</h1>

		<p class="pergunta-descricao">
			${pergunta.descricao}
		</p>

		<div class="opcoes">
	`;


	for (const opcao of pergunta.opcoes) {

		const selecionada =
			pergunta.tipo === "multi" &&
			Array.isArray(respostas[chave]) &&
			respostas[chave].includes(opcao.id);


		html += `

			<button
				class="
					opcao
					${pergunta.tipo === "multi" ? "opcao-multi" : ""}
					${selecionada ? "selecionada" : ""}
				"
				onclick="
					selecionarOpcao(
						'${chave}',
						'${opcao.id}',
						this
					)
				"
			>

				<div class="opcao-icone">
					${opcao.icone}
				</div>

				<div class="opcao-conteudo">

					<strong>
						${opcao.titulo}
					</strong>

					<span>
						${opcao.descricao}
					</span>

				</div>

				${
					pergunta.tipo === "multi"
						? `
							<div class="checkbox">
								${selecionada ? "✓" : ""}
							</div>
						`
						: `
							<div class="opcao-seta">
								→
							</div>
						`
				}

			</button>

		`;

	}


	html += `</div>`;


	if (pergunta.tipo === "multi") {

		html += `

			<button
				class="botao-continuar"
				onclick="confirmarMultipla('${chave}')"
			>
				Continuar
			</button>

		`;

	}


	container.innerHTML = html;

}


/* =========================================
   SELECIONAR OPÇÃO
========================================= */

function selecionarOpcao(chave, valor, elemento) {

	const pergunta = perguntas[chave];


	/* MULTI */

	if (pergunta.tipo === "multi") {

		if (!Array.isArray(respostas[chave])) {

			respostas[chave] = [];

		}


		const index =
			respostas[chave].indexOf(valor);


		if (index === -1) {

			respostas[chave].push(valor);

		} else {

			respostas[chave].splice(index, 1);

		}


		elemento.classList.toggle(
			"selecionada"
		);


		const checkbox =
			elemento.querySelector(".checkbox");


		if (checkbox) {

			checkbox.textContent =
				elemento.classList.contains("selecionada")
					? "✓"
					: "";

		}


		return;

	}


	/* SINGLE */

	respostas[chave] = valor;


	salvarRespostas();


	setTimeout(() => {

		proximaPergunta();

	}, 180);

}


/* =========================================
   CONFIRMAR MULTIPLA
========================================= */

function confirmarMultipla(chave) {

	if (
		!respostas[chave] ||
		respostas[chave].length === 0
	) {

		alert(
			"Selecione pelo menos uma opção para continuar."
		);

		return;

	}


	salvarRespostas();

	proximaPergunta();

}


/* =========================================
   PRÓXIMA PERGUNTA
========================================= */

function proximaPergunta() {

	const fluxo = construirFluxo();

	const indiceAtual =
		fluxo.indexOf(perguntaAtual);


	const proxima =
		fluxo[indiceAtual + 1];


	if (!proxima) {

		finalizarZapChat();

		return;

	}


	historico.push(perguntaAtual);


	renderizarPergunta(proxima);

}


/* =========================================
   VOLTAR
========================================= */

function voltarPergunta() {

	if (historico.length === 0) {

		return;

	}


	const anterior =
		historico.pop();


	renderizarPergunta(anterior);

}


/* =========================================
   NÚMERO DA PERGUNTA
========================================= */

function obterNumeroPergunta(chave) {

	const fluxo =
		construirFluxo();


	return fluxo.indexOf(chave) + 1;

}


/* =========================================
   SALVAR
========================================= */

async function salvarRespostas() {
	const {
		data: { user },
		error: erroUsuario
	} = await stockzapSupabase.auth.getUser();

	if (erroUsuario) {
		console.error("Erro ao identificar usuário:", erroUsuario);
		return false;
	}

	if (!user) {
		console.error("Nenhum usuário está logado.");
		alert("Sua sessão não foi encontrada. Faça login novamente.");
		return false;
	}

	const { error } = await stockzapSupabase
		.from("respostas_zapchat")
		.insert({
			usuario_id: user.id,
			respostas: respostas
		});

	if (error) {
		console.error("Erro ao salvar respostas:", error);
		alert("Não foi possível salvar suas respostas.");
		return false;
	}

	console.log("Respostas salvas no Supabase!");
	return true;
}


/* =========================================
   PERFIL
========================================= */

function gerarPerfil() {

	let operacao = respostas.operacao;

	let segmento = respostas.segmento;

	let oferta = respostas.oferta;

	let venda = respostas.canais;

	let maturidade = respostas.controle;

	let whatsapp = respostas.whatsapp;

	let prioridade = respostas.prioridade;


	let nomeOperacao = {

		fixo: "Local fixo",

		movel: "Negócio móvel",

		hibrido: "Negócio híbrido",

		online: "Negócio digital"

	}[operacao];


	let nomeSegmento = {

		alimentacao: "Alimentação",

		mercado: "Mercado / Conveniência",

		vestuario: "Vestuário",

		beleza: "Beleza",

		artesanato: "Artesanato",

		eletronicos: "Eletrônicos",

		casa: "Casa e decoração",

		eventos: "Eventos e feiras",

		servicos: "Serviços",

		outro: "Outro"

	}[segmento];


	let nomeOferta = {

		prontos: "Produtos prontos",

		producao: "Produção própria",

		produtos_servicos: "Produtos + serviços",

		servicos: "Só serviços",

		pre_venda: "Pré-venda / encomenda"

	}[oferta];


	let nomeMaturidade = {

		papel: "Papel",

		planilha: "Planilhas",

		sistema: "Sistema",

		cabeca: "Controle manual",

		nada: "Sem controle definido"

	}[maturidade];


	let nomePrioridade = {

		estoque: "Estoque",

		produtos: "Produtos",

		vendas: "Vendas",

		financeiro: "Financeiro",

		pedidos: "Pedidos",

		equipe: "Equipe",

		tudo: "Gestão geral"

	}[prioridade];


	return {

		operacao: nomeOperacao,

		segmento: nomeSegmento,

		oferta: nomeOferta,

		venda: venda,

		maturidade: nomeMaturidade,

		whatsapp: whatsapp,

		prioridade: nomePrioridade

	};

}


/* =========================================
   CONFIGURAÇÃO
========================================= */

function gerarConfiguracao() {

	const perfil = gerarPerfil();


	const funcionalidades = [];


	/* Estoque */

	if (
		respostas.prioridade === "estoque" ||
		respostas.estoque === "estoque" ||
		respostas.estoque === "ambos"
	) {

		funcionalidades.push(
			"Controle de estoque"
		);

		funcionalidades.push(
			"Alertas de estoque mínimo"
		);

	}


	/* Pedidos */

	if (
		respostas.prioridade === "pedidos" ||
		respostas.oferta === "pre_venda"
	) {

		funcionalidades.push(
			"Gestão de pedidos"
		);

		funcionalidades.push(
			"Controle de prazos"
		);

	}


	/* WhatsApp */

	if (
		respostas.whatsapp === "principal" ||
		respostas.whatsapp === "clientes"
	) {

		funcionalidades.push(
			"Integração com WhatsApp"
		);

	}


	/* Produção */

	if (
		respostas.oferta === "producao"
	) {

		funcionalidades.push(
			"Controle de produção"
		);

	}


	/* Financeiro */

	if (
		respostas.prioridade === "financeiro"
	) {

		funcionalidades.push(
			"Controle financeiro"
		);

		funcionalidades.push(
			"Relatórios financeiros"
		);

	}


	/* Vendas */

	if (
		respostas.prioridade === "vendas"
	) {

		funcionalidades.push(
			"Dashboard de vendas"
		);

		funcionalidades.push(
			"Histórico de clientes"
		);

	}


	/* Equipe */

	if (
		respostas.prioridade === "equipe"
	) {

		funcionalidades.push(
			"Gestão de equipe"
		);

		funcionalidades.push(
			"Permissões de usuários"
		);

	}


	return {

		perfil,

		funcionalidades

	};

}


/* =========================================
   FINALIZAÇÃO
========================================= */

async function finalizarZapChat() {
	
	console.log("1. Iniciando salvamento...");

	const {
		data: { user },
		error: erroUsuario
	} = await stockzapSupabase.auth.getUser();

	console.log("2. Usuário encontrado:", user);
	console.log("3. Erro do usuário:", erroUsuario);

	if (erroUsuario) {
		console.error("Erro ao identificar usuário:", erroUsuario);
		return false;
	}

	if (!user) {
		console.error("Nenhum usuário está logado.");
		alert("Sua sessão não foi encontrada. Faça login novamente.");
		return false;
	}

	const { error } = await stockzapSupabase
		.from("respostas_zapchat")
		.insert({
			usuario_id: user.id,
			respostas: respostas
		});

	console.log("4. Resultado do salvamento:", error);

	if (error) {
		console.error("Erro ao salvar respostas:", error);
		alert("Não foi possível salvar suas respostas.");
		return false;
	}

	console.log("5. Respostas salvas no Supabase!");

	return true;
}

	const salvou = await salvarRespostas();

	if (!salvou) {
		return;
	}


	const configuracao =
		gerarConfiguracao();


	localStorage.setItem(
		"stockzap_configuracao",
		JSON.stringify(configuracao)
	);


	progresso.style.width = "100%";

	etapaAtual.textContent =
		construirFluxo().length;


	botaoVoltar.style.visibility =
		"hidden";


	container.innerHTML = `

		<div class="resultado">

			<div class="resultado-sucesso">
				✓
			</div>

			<h2>
				Entendemos seu negócio.
			</h2>

			<p class="resultado-intro">
				O StockZap já pode começar a adaptar sua experiência
				com base nas suas respostas.
			</p>


			<div class="perfil-grid">

				<div class="perfil-item">
					<span>Operação</span>
					<strong>
						${configuracao.perfil.operacao}
					</strong>
				</div>


				<div class="perfil-item">
					<span>Segmento</span>
					<strong>
						${configuracao.perfil.segmento}
					</strong>
				</div>


				<div class="perfil-item">
					<span>Modelo</span>
					<strong>
						${configuracao.perfil.oferta}
					</strong>
				</div>


				<div class="perfil-item">
					<span>Maturidade</span>
					<strong>
						${configuracao.perfil.maturidade}
					</strong>
				</div>


				<div class="perfil-item">
					<span>WhatsApp</span>
					<strong>
						${configuracao.perfil.whatsapp}
					</strong>
				</div>


				<div class="perfil-item">
					<span>Prioridade</span>
					<strong>
						${configuracao.perfil.prioridade}
					</strong>
				</div>

			</div>


			<div class="configuracao">

				<h3>
					Sua configuração inicial
				</h3>

				<ul>

					${configuracao.funcionalidades
						.map(
							item =>
								`<li>${item}</li>`
						)
						.join("")
					}

				</ul>

			</div>


			<button
				class="botao-finalizar"
				onclick="entrarNoStockZap()"
			>
				Continuar para o StockZap
			</button>

		</div>

	`;

}


/* =========================================
   ENTRAR NO STOCKZAP
========================================= */

function entrarNoStockZap() {

	/*
		Por enquanto vamos para a página principal.

		Depois podemos trocar isso pela página
		inicial do sistema/dashboard.
	*/

	window.location.href =
		"../stockzap.html";

}


/* =========================================
   RECUPERAR RESPOSTAS
========================================= */

function carregarRespostas() {

	const dados =
		localStorage.getItem(
			"stockzap_zapchat"
		);


	if (!dados) {

		return;

	}


	try {

		const recuperadas =
			JSON.parse(dados);


		Object.assign(
			respostas,
			recuperadas
		);

	} catch (erro) {

		console.error(
			"Erro ao carregar respostas:",
			erro
		);

	}

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener("DOMContentLoaded", () => {

	carregarRespostas();

	renderizarPergunta("operacao");

});