// DADOS INICIAIS

const produtosIniciais = [
	{
		id: 1,
		nome: "Arroz 5kg",
		codigo: "001",
		categoria: "Alimentos",
		preco: 25.0,
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

// RECUPERAR PRODUTOS

let produtos = JSON.parse(localStorage.getItem("stockzap_produtos"));

if (!produtos){
	produtos = produtosIniciais;
	salvarProdutos();
}

// ELEMENTOS DA PÁGINA

const listaProdutos = document.getElementById("lista-produtos");
const pesquisaProduto = document.getElementById("pesquisa-produto");
const filtroCategoria = document.getElementById("filtro-categoria");
const quantidadeResultados = document.getElementById("quantidade-resultados");
const semProdutos = document.getElementById("sem-produtos");

// Modal

const modal = document.getElementById("modal");
const abrirModal = document.getElementById("abrir-modal");
const abrirModalVazio = document.getElementById("abrir-modal-vazio");
const fecharModal = document.getElementById("fechar-modal");
const cancelarModal = document.getElementById("cancelar-modal");
const formProduto = document.getElementById("form-produto");
const tituloModal = document.getElementById("titulo-modal");

// Campos

const produtoId = document.getElementById("produto-id");
const nome = document.getElementById("nome");
const codigo = document.getElementById("codigo");
const categoria = document.getElementById("categoria");
const preco = document.getElementById("preco");
const estoque = document.getElementById("estoque");
const estoqueMinimo = document.getElementById("estoque-minimo");

// Cards

const totalProdutos = document.getElementById("total-produtos");
const produtosEstoque = document.getElementById("produtos-estoque");
const produtosBaixos = document.getElementById("produtos-baixos");
const totalCategorias = document.getElementById("total-categorias");

// SALVAR PRODUTOS

function salvarProdutos(){
	localStorage.setItem("stockzap_produtos", JSON.stringify(produtos));
}

// FORMATAR PREÇO

function formatarPreco(valor){
	return Number(valor).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

// DETERMINAR STATUS

function obterStatus(produto){
	if (produto.estoque === 0){
		return{
			texto: "Esgotado",
			classe: "esgotado",
		};
	}

	if (produto.estoque <= produto.estoqueMinimo){
		return{
			texto: "Estoque baixo",
			classe: "baixo",
		};
	}

	return{
		texto: "Disponível",
		classe: "disponivel",
	};
}

// ATUALIZAR CARDS

function atualizarResumo(){
	totalProdutos.textContent = produtos.length;

	const quantidadeEmEstoque = produtos.filter(
		(produto) => produto.estoque > 0,
	).length;

	produtosEstoque.textContent = quantidadeEmEstoque;

	const quantidadeBaixos = produtos.filter(
		(produto) => produto.estoque <= produto.estoqueMinimo,
	).length;

	produtosBaixos.textContent = quantidadeBaixos;

	const categorias = new Set(produtos.map((produto) => produto.categoria));

	totalCategorias.textContent = categorias.size;
}

// ATUALIZAR FILTRO DE CATEGORIA

function atualizarCategorias(){
	const categoriaSelecionada = filtroCategoria.value;

	const categorias = [
		...new Set(produtos.map((produto) => produto.categoria)),
	].sort();

	filtroCategoria.innerHTML = `
     <option value="">Todas as categorias</option>
    `;

	categorias.forEach((categoriaAtual) => {
		const option = document.createElement("option");

		option.value = categoriaAtual;

		option.textContent = categoriaAtual;

		filtroCategoria.appendChild(option);
	});

	filtroCategoria.value = categoriaSelecionada;
}

// RENDERIZAR PRODUTOS

function renderizarProdutos(){
	const pesquisa = pesquisaProduto.value.toLowerCase().trim();

	const categoriaSelecionada = filtroCategoria.value;

	const produtosFiltrados = produtos.filter((produto) => {
		const correspondePesquisa =
			produto.nome.toLowerCase().includes(pesquisa) ||
			produto.codigo.toLowerCase().includes(pesquisa);

		const correspondeCategoria =
			categoriaSelecionada === "" ||
			produto.categoria === categoriaSelecionada;

		return correspondePesquisa && correspondeCategoria;
	});

	listaProdutos.innerHTML = "";

	produtosFiltrados.forEach((produto) => {
		const status = obterStatus(produto);

		const linha = document.createElement("tr");

		linha.innerHTML = `

        <td>
            <div class="produto-nome">
                <strong>${produto.nome}</strong>

                <span>
                    Estoque mínimo: ${produto.estoqueMinimo}
                </span>
            </div>
        </td>

        <td>
            ${produto.codigo}
        </td>

        <td>
            ${produto.categoria}
        </td>

        <td>
            ${formatarPreco(produto.preco)}
        </td>

        <td>
            ${produto.estoque} un.
        </td>

        <td>
            <span class="status ${status.classe}">
                ${status.texto}
            </span>
        </td>

        <td>
            <div class="acoes">
                <button
                    class="botao-acao botao-editar"
                    title="Editar produto"
                    onclick="editarProduto(${produto.id})"
                >
                    ✎
                </button>

                <button
                    class="botao-acao botao-excluir"
                    title="Excluir produto"
                    onclick="excluirProduto(${produto.id})"
                >
                    ×
                </button>
            </div>
        </td>
    `;
		listaProdutos.appendChild(linha);
	});

	quantidadeResultados.textContent = `${produtosFiltrados.length} produto${produtosFiltrados.length !== 1 ? "s" : ""} encontrado${produtosFiltrados.length !== 1 ? "s" : ""}`;

	if (produtosFiltrados.length === 0){
		semProdutos.classList.add("visivel");
	} else{
		semProdutos.classList.remove("visivel");
	}
}

// ABRIR MODAL

function abrirFormulario(){
	formProduto.reset();
	produtoId.value = "";
	estoqueMinimo.value = 5;
	tituloModal.textContent = "Novo produto";
	modal.classList.add("aberto");
	nome.focus();
}

// FECHAR MODAL

function fecharFormulario(){
	modal.classList.remove("aberto");
	formProduto.reset();
	produtoId.value = "";
	estoqueMinimo.value = 5;
}

// CADASTRAR / EDITAR

formProduto.addEventListener("submit", function (event){
	event.preventDefault();

	const id = produtoId.value;

	const novoProduto = {
		nome: nome.value.trim(),
		codigo: codigo.value.trim(),
		categoria: categoria.value.trim(),
		preco: Number(preco.value),
		estoque: Number(estoque.value),
		estoqueMinimo: Number(estoqueMinimo.value),
	};

	if(!novoProduto.nome || !novoProduto.codigo || !novoProduto.categoria){
		alert("Preencha todos os campos obrigatórios.");
		return;
	}

	if(
		novoProduto.preco < 0 ||
		novoProduto.estoque < 0 ||
		novoProduto.estoqueMinimo < 0
	){
		alert("Os valores não podem ser negativos.");
		return;
	}

	// EDIÇÃO

	if (id){
		const indice = produtos.findIndex(
			(produto) => produto.id === Number(id),
		);

		if (indice !== -1){
			produtos[indice] = {
				id: Number(id),
				...novoProduto,
			};
		}
	}

	// NOVO PRODUTO 

	else{
		const codigoExiste = produtos.some(
			(produto) =>
				produto.codigo.toLowerCase() ===
				novoProduto.codigo.toLowerCase(),
		);

		if (codigoExiste){
			alert("Já existe um produto com esse código.");
			return;
		}

		novoProduto.id = Date.now();

		produtos.push(novoProduto);
	}

	salvarProdutos();
	atualizarCategorias();
	atualizarResumo();
	renderizarProdutos();
	fecharFormulario();
});

// EDITAR PRODUTO 

function editarProduto(id){
	const produto = produtos.find((produtoAtual) => produtoAtual.id === id);

	if (!produto) {
		return;
	}

	produtoId.value = produto.id;
	nome.value = produto.nome;
	codigo.value = produto.codigo;
	categoria.value = produto.categoria;
	preco.value = produto.preco;
	estoque.value = produto.estoque;
	estoqueMinimo.value = produto.estoqueMinimo;
	tituloModal.textContent = "Editar produto";
	modal.classList.add("aberto");
	nome.focus();
}

// EXCLUIR PRODUTO 

function excluirProduto(id){
	const produto = produtos.find((produtoAtual) => produtoAtual.id === id);

	if (!produto) {
		return;
	}

	const confirmar = confirm(`Deseja excluir o produto "${produto.nome}"?`);

	if (!confirmar) {
		return;
	}

	produtos = produtos.filter((produtoAtual) => produtoAtual.id !== id);

	salvarProdutos();
	atualizarCategorias();
	atualizarResumo();
	renderizarProdutos();
}

// EVENTOS DO MODAL 

abrirModal.addEventListener("click", abrirFormulario);

abrirModalVazio.addEventListener("click", abrirFormulario);

fecharModal.addEventListener("click", fecharFormulario);

cancelarModal.addEventListener("click", fecharFormulario);

/* Fechar clicando fora do modal */

modal.addEventListener("click", function (event){
	if (event.target === modal){
		fecharFormulario();
	}
});

// PESQUISA 

pesquisaProduto.addEventListener("input", renderizarProdutos);

// FILTRO 

filtroCategoria.addEventListener("change", renderizarProdutos);

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
	const avatarUsuario = document.getElementById("avatar-usuario");

	if (nomeTopbar) {
		nomeTopbar.textContent = nome;
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

atualizarCategorias();
atualizarResumo();
renderizarProdutos();

// LOGOUT
const botoesSair = document.querySelectorAll(".menu-item.sair");
botoesSair.forEach((btn) => {
	btn.addEventListener("click", async (e) => {
		e.preventDefault();
		try {
			await stockzapSupabase.auth.signOut();
		} catch (err) {
			console.error("Erro ao encerrar sessão:", err);
		}
		window.location.href = "../../stockzap.html";
	});
});
