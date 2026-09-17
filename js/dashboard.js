// STOCKZAP - DASHBOARD

const produtosPadraoDashboard = [
	{
		id: 1,
		nome: "Arroz 5kg",
		codigo: "001",
		categoria: "Alimentos",
		preco: 25,
		estoque: 32,
		estoqueMinimo: 5,
	},
	{
		id: 2,
		nome: "Feijão 1kg",
		codigo: "002",
		categoria: "Alimentos",
		preco: 8.5,
		estoque: 5,
		estoqueMinimo: 5,
	},
	{
		id: 3,
		nome: "Café 500g",
		codigo: "003",
		categoria: "Bebidas",
		preco: 16.9,
		estoque: 18,
		estoqueMinimo: 5,
	},
	{
		id: 4,
		nome: "Macarrão 500g",
		codigo: "004",
		categoria: "Alimentos",
		preco: 6.5,
		estoque: 2,
		estoqueMinimo: 5,
	},
	{
		id: 5,
		nome: "Refrigerante 2L",
		codigo: "005",
		categoria: "Bebidas",
		preco: 9.9,
		estoque: 0,
		estoqueMinimo: 5,
	},
];

const dadosGraficos = {
	"7dias": {
		labels: ["08/09", "09/09", "10/09", "11/09", "12/09", "13/09", "14/09"],
		valores: [900, 1100, 1350, 1600, 1450, 1850, 2200],
	},
	mes: {
		labels: ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4"],
		valores: [2700, 3050, 3200, 3500],
	},
	"3meses": {
		labels: ["Jul", "Ago", "Set"],
		valores: [10800, 11750, 12450],
	},
	ano: {
		labels: [
			"Jan",
			"Fev",
			"Mar",
			"Abr",
			"Mai",
			"Jun",
			"Jul",
			"Ago",
			"Set",
			"Out",
			"Nov",
			"Dez",
		],
		valores: [
			7200, 7900, 8150, 8900, 9300, 10100, 10800, 11750, 12450, 0, 0, 0,
		],
	},
};

const lancamentosPadrao = [
	{
		data: "14/09/2026",
		produto: "Arroz 5kg",
		tipo: "Entrada",
		quantidade: 20,
		valor: 500,
	},
	{
		data: "13/09/2026",
		produto: "Café 500g",
		tipo: "Entrada",
		quantidade: 12,
		valor: 202.8,
	},
	{
		data: "12/09/2026",
		produto: "Feijão 1kg",
		tipo: "Saída",
		quantidade: 4,
		valor: 34,
	},
];

// ELEMENTOS
const totalProdutosElement = document.getElementById(
	"dashboard-total-produtos",
);
const itensEstoqueElement = document.getElementById("dashboard-itens-estoque");
const vendasMesElement = document.getElementById("dashboard-vendas-mes");
const estoqueBaixoElement = document.getElementById("dashboard-estoque-baixo");
const listaEstoqueBaixo = document.getElementById(
	"lista-estoque-baixo-dashboard",
);
const listaLancamentos = document.getElementById("lista-lancamentos-dashboard");
const dataDashboard = document.getElementById("data-dashboard");

const periodoGrafico = document.getElementById("periodo-grafico");
const botoesTipoGrafico = document.querySelectorAll(".tipo-grafico");
const eixoY = document.getElementById("eixo-y-grafico");
const eixoX = document.getElementById("eixo-x-grafico");
const linhasGrade = document.getElementById("linhas-grade");
const graficoVisual = document.getElementById("grafico-visual");
const botaoMenu = document.querySelector(".botao-menu");

let tipoGraficoAtual = localStorage.getItem("stockzap_tipo_grafico") || "linha";
let periodoAtual = localStorage.getItem("stockzap_periodo_grafico") || "7dias";

// FUNÇÕES AUXILIARES

function formatarMoeda(valor) {
	return Number(valor).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function obterProdutos() {
	const produtosSalvos = JSON.parse(
		localStorage.getItem("stockzap_produtos"),
	);
	return produtosSalvos || produtosPadraoDashboard;
}

function obterLancamentos() {
	const lancamentosSalvos = JSON.parse(
		localStorage.getItem("stockzap_lancamentos"),
	);
	return lancamentosSalvos || lancamentosPadrao;
}

function atualizarData() {
	if (!dataDashboard) return;

	const hoje = new Date();
	dataDashboard.textContent = hoje.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

// CARDS DO DASHBOARD

function atualizarCards() {
	const produtos = obterProdutos();

	const totalProdutos = produtos.length;
	const totalItens = produtos.reduce(
		(total, produto) => total + Number(produto.estoque || 0),
		0,
	);
	const produtosBaixos = produtos.filter(
		(produto) => Number(produto.estoque) <= Number(produto.estoqueMinimo),
	);

	const vendasMes = dadosGraficos.mes.valores.reduce(
		(total, valor) => total + valor,
		0,
	);

	totalProdutosElement.textContent = totalProdutos;
	itensEstoqueElement.textContent = totalItens;
	vendasMesElement.textContent = formatarMoeda(vendasMes);
	estoqueBaixoElement.textContent = produtosBaixos.length;
}

// ESTOQUE BAIXO

function renderizarEstoqueBaixo() {
	if (!listaEstoqueBaixo) return;

	const produtos = obterProdutos();

	const baixos = produtos
		.filter(
			(produto) =>
				Number(produto.estoque) <= Number(produto.estoqueMinimo),
		)
		.sort((a, b) => Number(a.estoque) - Number(b.estoque))
		.slice(0, 5);

	listaEstoqueBaixo.innerHTML = "";

	if (baixos.length === 0) {
		listaEstoqueBaixo.innerHTML = `
			<div class="sem-dados-grafico">Nenhum produto com estoque baixo.</div>
		`;
		return;
	}

	baixos.forEach((produto) => {
		const linha = document.createElement("div");
		linha.className = "produto produto-tabela";

		linha.innerHTML = `
			<div class="produto-info">
				<div class="produto-mini-icone">
					<img src="../imagens/icones/package-neutral.svg" alt="">
				</div>
				<div>
					<strong>${produto.nome}</strong>
					<span>Cód. ${produto.codigo}</span>
				</div>
			</div>

			<span class="estoque-quantidade">${produto.estoque} un.</span>
			<span class="badge-baixo">Baixo</span>
		`;

		listaEstoqueBaixo.appendChild(linha);
	});
}

// ÚLTIMOS LANÇAMENTOS

function renderizarLancamentos() {
	if (!listaLancamentos) return;

	const lancamentos = obterLancamentos().slice(0, 5);
	listaLancamentos.innerHTML = "";

	lancamentos.forEach((lancamento) => {
		const linha = document.createElement("tr");
		const classeTipo =
			lancamento.tipo.toLowerCase() === "entrada"
				? "badge-entrada"
				: "badge-saida";

		linha.innerHTML = `
			<td>${lancamento.data}</td>
			<td>${lancamento.produto}</td>
			<td><span class="${classeTipo}">${lancamento.tipo}</span></td>
			<td>${lancamento.quantidade} un.</td>
			<td>${formatarMoeda(lancamento.valor)}</td>
		`;

		listaLancamentos.appendChild(linha);
	});
}

// GRÁFICOS

function calcularMaximoEixo(valores) {
	const maior = Math.max(...valores, 0);
	if (maior === 0) return 1000;

	const passoBase = maior <= 5000 ? 1000 : maior <= 20000 ? 5000 : 10000;
	return Math.ceil(maior / passoBase) * passoBase;
}

function criarEixos(labels, valores) {
	const maximo = calcularMaximoEixo(valores);
	const quantidadeLinhas = 6;

	eixoY.innerHTML = "";
	linhasGrade.innerHTML = "";
	eixoX.innerHTML = "";

	for (let i = quantidadeLinhas - 1; i >= 0; i--) {
		const valor = (maximo / (quantidadeLinhas - 1)) * i;
		const span = document.createElement("span");
		span.textContent =
			valor === 0
				? "R$ 0"
				: `R$ ${Math.round(valor).toLocaleString("pt-BR")}`;
		eixoY.appendChild(span);

		linhasGrade.appendChild(document.createElement("span"));
	}

	labels.forEach((label) => {
		const span = document.createElement("span");
		span.textContent = label;
		eixoX.appendChild(span);
	});

	return maximo;
}

function desenharGraficoLinha(labels, valores, maximo) {
	if (valores.length === 0) return;

	const largura = 700;
	const altura = 250;
	const margemX = 12;
	const margemY = 15;
	const larguraUtil = largura - margemX * 2;
	const alturaUtil = altura - margemY * 2;

	const pontos = valores.map((valor, indice) => {
		const x =
			valores.length === 1
				? largura / 2
				: margemX + (indice / (valores.length - 1)) * larguraUtil;
		const y = altura - margemY - (valor / maximo) * alturaUtil;
		return { x, y, valor };
	});

	const caminho = pontos
		.map(
			(ponto, indice) =>
				`${indice === 0 ? "M" : "L"}${ponto.x} ${ponto.y}`,
		)
		.join(" ");
	const area = `${caminho} L${pontos[pontos.length - 1].x} ${altura - margemY} L${pontos[0].x} ${altura - margemY} Z`;

	graficoVisual.innerHTML = `
		<svg class="grafico-svg-dinamico" viewBox="0 0 ${largura} ${altura}" preserveAspectRatio="none" aria-label="Gráfico de linha de vendas">
			<path class="area" d="${area}"></path>
			<path class="linha" d="${caminho}"></path>
			${pontos
				.map(
					(ponto) => `
				<circle cx="${ponto.x}" cy="${ponto.y}" r="5">
					<title>${formatarMoeda(ponto.valor)}</title>
				</circle>
			`,
				)
				.join("")}
		</svg>
	`;
}

function desenharGraficoBarras(labels, valores, maximo) {
	const barras = valores
		.map((valor, indice) => {
			const altura = maximo === 0 ? 0 : (valor / maximo) * 100;

			return `
			<div
				class="barra-grafico"
				style="height: ${altura}%"
				title="${labels[indice]}: ${formatarMoeda(valor)}"
			></div>
		`;
		})
		.join("");

	graficoVisual.innerHTML = `<div class="grafico-barras">${barras}</div>`;
}

function atualizarBotoesGrafico() {
	botoesTipoGrafico.forEach((botao) => {
		botao.classList.toggle(
			"ativo",
			botao.dataset.tipo === tipoGraficoAtual,
		);
	});
}

function renderizarGrafico() {
	const dados = dadosGraficos[periodoAtual];
	if (!dados || !graficoVisual) return;

	const maximo = criarEixos(dados.labels, dados.valores);

	if (tipoGraficoAtual === "barras") {
		desenharGraficoBarras(dados.labels, dados.valores, maximo);
	} else {
		desenharGraficoLinha(dados.labels, dados.valores, maximo);
	}

	atualizarBotoesGrafico();
}

// EVENTOS

botoesTipoGrafico.forEach((botao) => {
	botao.addEventListener("click", () => {
		tipoGraficoAtual = botao.dataset.tipo;
		localStorage.setItem("stockzap_tipo_grafico", tipoGraficoAtual);
		renderizarGrafico();
	});
});

periodoGrafico.addEventListener("change", () => {
	periodoAtual = periodoGrafico.value;
	localStorage.setItem("stockzap_periodo_grafico", periodoAtual);
	renderizarGrafico();
});

if (botaoMenu) {
	botaoMenu.addEventListener("click", () => {
		if (window.innerWidth <= 640) return;
		document.body.classList.toggle("sidebar-recolhida");
	});
}

window.addEventListener("storage", (event) => {
	if (event.key === "stockzap_produtos") {
		atualizarCards();
		renderizarEstoqueBaixo();
	}
});

async function carregarDadosUsuario() {
	const {
		data: { user },
		error,
	} = await stockzapSupabase.auth.getUser();

	if (error) {
		console.error("Erro ao carregar usuário:", error);
		return;
	}

	if (!user) {
		console.warn("Nenhum usuário autenticado.");
		return;
	}

	const nome = user.user_metadata?.nome || "Usuário";

	const nomeTopbar = document.getElementById("nome-usuario-topbar");
	const nomeDashboard = document.getElementById("nome-usuario-dashboard");
	const avatarUsuario = document.getElementById("avatar-usuario");

	if (nomeTopbar) {
		nomeTopbar.textContent = nome;
	}

	if (nomeDashboard) {
		nomeDashboard.textContent = nome;
	}

	if (avatarUsuario) {
		const iniciais = nome
			.split(" ")
			.filter(Boolean)
			.slice(0, 2)
			.map((parte) => parte[0])
			.join("")
			.toUpperCase();

		avatarUsuario.textContent = iniciais || "US";
	}
}

// INICIALIZAÇÃO

carregarDadosUsuario();

periodoGrafico.value = periodoAtual;
atualizarData();
atualizarCards();
renderizarEstoqueBaixo();
renderizarLancamentos();
renderizarGrafico();