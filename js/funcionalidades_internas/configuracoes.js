// STOCKZAP - CONFIGURAÇÕES


// =====================================================
// ELEMENTOS
// =====================================================

const nomeUsuarioInput = document.getElementById("nome-usuario");
const emailUsuarioInput = document.getElementById("email-usuario");
const whatsappUsuarioInput = document.getElementById("whatsapp-usuario");

const nomeEmpresaInput = document.getElementById("nome-empresa");
const cnpjEmpresaInput = document.getElementById("cnpj-empresa");

const btnSalvarConta = document.getElementById("btn-salvar-conta");
const btnSalvarEmpresa = document.getElementById("btn-salvar-empresa");

const btnAlterarSenha = document.getElementById("btn-alterar-senha");

const mensagemConfig = document.getElementById("mensagem-config");

const avatarUsuario = document.getElementById("avatar-usuario");
const nomeUsuarioTopbar = document.getElementById("nome-usuario-topbar");

const temaClaro = document.getElementById("tema-claro");
const temaEscuro = document.getElementById("tema-escuro");

const notificacaoEstoque = document.getElementById("notificacao-estoque");
const notificacaoMovimentacoes = document.getElementById(
	"notificacao-movimentacoes"
);


// =====================================================
// ESTADO
// =====================================================

let usuarioAtual = null;
let dadosUsuario = null;
let empresaAtual = null;


// =====================================================
// MENSAGENS
// =====================================================

function mostrarMensagem(mensagem, tipo = "sucesso") {
	if (!mensagemConfig) return;

	mensagemConfig.textContent = mensagem;
	mensagemConfig.className = `mensagem-config ${tipo}`;

	setTimeout(() => {
		mensagemConfig.textContent = "";
		mensagemConfig.className = "mensagem-config";
	}, 4000);
}


// =====================================================
// INICIAIS DO USUÁRIO
// =====================================================

function gerarIniciais(nome) {
	if (!nome) return "US";

	const partes = nome
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	if (partes.length === 1) {
		return partes[0]
			.substring(0, 2)
			.toUpperCase();
	}

	return (
		partes[0][0] +
		partes[partes.length - 1][0]
	).toUpperCase();
}


// =====================================================
// ATUALIZAR TOPOBAR
// =====================================================

function atualizarTopbar(nome) {
	const nomeFinal = nome || "Usuário";

	if (nomeUsuarioTopbar) {
		nomeUsuarioTopbar.textContent = nomeFinal;
	}

	if (avatarUsuario) {
		avatarUsuario.textContent = gerarIniciais(nomeFinal);
	}
}


// =====================================================
// CARREGAR USUÁRIO
// =====================================================

async function carregarUsuario() {

	const {
		data: { user },
		error: erroAuth,
	} = await stockzapSupabase.auth.getUser();

	if (erroAuth) {
		console.error("Erro ao carregar usuário:", erroAuth);

		mostrarMensagem(
			"Não foi possível carregar sua conta.",
			"erro"
		);

		return;
	}

	if (!user) {
		console.warn("Nenhum usuário autenticado.");

		window.location.href = "../../stockzap.html";

		return;
	}

	usuarioAtual = user;


	// =================================================
	// BUSCAR DADOS DA TABELA USUARIO
	// =================================================

	const {
		data: usuario,
		error: erroUsuario,
	} = await stockzapSupabase
		.from("usuario")
		.select(`
			id_usuario,
			auth_id,
			nome_usuario,
			email,
			whatsapp
		`)
		.eq("auth_id", user.id)
		.single();

	if (erroUsuario) {

		console.error(
			"Erro ao buscar usuário:",
			erroUsuario
		);

		mostrarMensagem(
			"Erro ao carregar seus dados.",
			"erro"
		);

		return;
	}

	dadosUsuario = usuario;


	// =================================================
	// PREENCHER CAMPOS
	// =================================================

	nomeUsuarioInput.value =
		usuario.nome_usuario || "";

	emailUsuarioInput.value =
		usuario.email || user.email || "";

	whatsappUsuarioInput.value =
		usuario.whatsapp || "";


	atualizarTopbar(usuario.nome_usuario);


	// =================================================
	// BUSCAR EMPRESA
	// =================================================

	const {
		data: empresa,
		error: erroEmpresa,
	} = await stockzapSupabase
		.from("empresa")
		.select(`
			id_empresa,
			id_usuario,
			nome_empresa,
			cnpj
		`)
		.eq("id_usuario", usuario.id_usuario)
		.limit(1)
		.maybeSingle();


	if (erroEmpresa) {

		console.error(
			"Erro ao buscar empresa:",
			erroEmpresa
		);

		mostrarMensagem(
			"Não foi possível carregar os dados da empresa.",
			"erro"
		);

		return;
	}


	empresaAtual = empresa;


	if (empresa) {

		nomeEmpresaInput.value =
			empresa.nome_empresa || "";

		cnpjEmpresaInput.value =
			empresa.cnpj || "";

	}
}


// =====================================================
// SALVAR CONTA
// =====================================================

async function salvarConta() {

	if (!usuarioAtual || !dadosUsuario) {
		return;
	}

	const nome = nomeUsuarioInput.value.trim();
	const whatsapp = whatsappUsuarioInput.value.trim();


	if (!nome) {

		mostrarMensagem(
			"Digite seu nome.",
			"erro"
		);

		return;
	}


	btnSalvarConta.disabled = true;
	btnSalvarConta.textContent = "Salvando...";


	const {
		error,
	} = await stockzapSupabase
		.from("usuario")
		.update({
			nome_usuario: nome,
			whatsapp: whatsapp || null,
		})
		.eq("id_usuario", dadosUsuario.id_usuario);


	if (error) {

		console.error(
			"Erro ao atualizar conta:",
			error
		);

		mostrarMensagem(
			"Não foi possível salvar as alterações.",
			"erro"
		);

		btnSalvarConta.disabled = false;
		btnSalvarConta.textContent = "Salvar alterações";

		return;
	}


	// Atualiza o objeto local
	dadosUsuario.nome_usuario = nome;
	dadosUsuario.whatsapp = whatsapp;


	// Atualiza o topo imediatamente
	atualizarTopbar(nome);


	btnSalvarConta.disabled = false;
	btnSalvarConta.textContent = "Salvar alterações";


	mostrarMensagem(
		"Dados da conta atualizados com sucesso!"
	);
}


// =====================================================
// SALVAR EMPRESA
// =====================================================

async function salvarEmpresa() {

	if (!dadosUsuario) {
		return;
	}


	const nomeEmpresa =
		nomeEmpresaInput.value.trim();

	const cnpj =
		cnpjEmpresaInput.value.trim();


	if (!nomeEmpresa) {

		mostrarMensagem(
			"Digite o nome da empresa.",
			"erro"
		);

		return;
	}


	btnSalvarEmpresa.disabled = true;
	btnSalvarEmpresa.textContent = "Salvando...";


	let error;


	// =================================================
	// EMPRESA JÁ EXISTE
	// =================================================

	if (empresaAtual) {

		const resposta =
			await stockzapSupabase
				.from("empresa")
				.update({
					nome_empresa: nomeEmpresa,
					cnpj: cnpj || null,
				})
				.eq(
					"id_empresa",
					empresaAtual.id_empresa
				);

		error = resposta.error;

	}


	// =================================================
	// EMPRESA AINDA NÃO EXISTE
	// =================================================

	else {

		const resposta =
			await stockzapSupabase
				.from("empresa")
				.insert({
					id_usuario: dadosUsuario.id_usuario,
					nome_empresa: nomeEmpresa,
					cnpj: cnpj || null,
				})
				.select()
				.single();

		error = resposta.error;

		if (!error) {
			empresaAtual = resposta.data;
		}
	}


	if (error) {

		console.error(
			"Erro ao salvar empresa:",
			error
		);

		mostrarMensagem(
			"Não foi possível salvar os dados da empresa.",
			"erro"
		);

		btnSalvarEmpresa.disabled = false;
		btnSalvarEmpresa.textContent = "Salvar empresa";

		return;
	}


	btnSalvarEmpresa.disabled = false;
	btnSalvarEmpresa.textContent = "Salvar empresa";


	mostrarMensagem(
		"Dados da empresa atualizados com sucesso!"
	);
}


// =====================================================
// MÁSCARA CNPJ
// =====================================================

function formatarCNPJ(valor) {

	let numeros = valor.replace(/\D/g, "");

	numeros = numeros.substring(0, 14);


	if (numeros.length <= 2) {
		return numeros;
	}

	if (numeros.length <= 5) {
		return (
			numeros.substring(0, 2) +
			"." +
			numeros.substring(2)
		);
	}

	if (numeros.length <= 8) {
		return (
			numeros.substring(0, 2) +
			"." +
			numeros.substring(2, 5) +
			"." +
			numeros.substring(5)
		);
	}

	if (numeros.length <= 12) {
		return (
			numeros.substring(0, 2) +
			"." +
			numeros.substring(2, 5) +
			"." +
			numeros.substring(5, 8) +
			"/" +
			numeros.substring(8)
		);
	}

	return (
		numeros.substring(0, 2) +
		"." +
		numeros.substring(2, 5) +
		"." +
		numeros.substring(5, 8) +
		"/" +
		numeros.substring(8, 12) +
		"-" +
		numeros.substring(12, 14)
	);
}


cnpjEmpresaInput.addEventListener("input", () => {

	cnpjEmpresaInput.value =
		formatarCNPJ(
			cnpjEmpresaInput.value
		);

});


// =====================================================
// APARÊNCIA
// =====================================================

function aplicarTema(tema) {

	if (tema === "escuro") {

		document.body.classList.add("tema-escuro");

		temaEscuro.checked = true;

	} else {

		document.body.classList.remove("tema-escuro");

		temaClaro.checked = true;

	}

	localStorage.setItem(
		"stockzap_tema",
		tema
	);
}

function carregarTema() {
	const tema = localStorage.getItem("stockzap_tema") || "claro";
	aplicarTema(tema);
}

function aplicarTemaConfiguracao(tema) {
	localStorage.setItem("stockzap_tema", tema);

	document.body.classList.toggle(
		"tema-escuro",
		tema === "escuro"
	);
}


temaClaro.addEventListener("change", () => {

	if (temaClaro.checked) {
		aplicarTema("claro");
	}

});


temaEscuro.addEventListener("change", () => {

	if (temaEscuro.checked) {
		aplicarTema("escuro");
	}

});


// =====================================================
// NOTIFICAÇÕES
// =====================================================

function carregarNotificacoes() {

	const estoque =
		localStorage.getItem(
			"stockzap_notificacao_estoque"
		);

	const movimentacoes =
		localStorage.getItem(
			"stockzap_notificacao_movimentacoes"
		);


	notificacaoEstoque.checked =
		estoque !== "false";


	notificacaoMovimentacoes.checked =
		movimentacoes !== "false";
}


notificacaoEstoque.addEventListener("change", () => {

	localStorage.setItem(
		"stockzap_notificacao_estoque",
		notificacaoEstoque.checked
	);

});


notificacaoMovimentacoes.addEventListener("change", () => {

	localStorage.setItem(
		"stockzap_notificacao_movimentacoes",
		notificacaoMovimentacoes.checked
	);

});


// =====================================================
// ALTERAR SENHA
// =====================================================

btnAlterarSenha.addEventListener("click", async () => {

	const novaSenha = prompt(
		"Digite sua nova senha:"
	);


	if (!novaSenha) {
		return;
	}


	if (novaSenha.length < 6) {

		mostrarMensagem(
			"A senha deve ter pelo menos 6 caracteres.",
			"erro"
		);

		return;
	}


	const { error } =
		await stockzapSupabase.auth.updateUser({
			password: novaSenha
		});


	if (error) {

		console.error(
			"Erro ao alterar senha:",
			error
		);

		mostrarMensagem(
			"Não foi possível alterar a senha.",
			"erro"
		);

		return;
	}


	mostrarMensagem(
		"Senha alterada com sucesso!"
	);

});


// =====================================================
// EVENTOS
// =====================================================

btnSalvarConta.addEventListener(
	"click",
	salvarConta
);

btnSalvarEmpresa.addEventListener(
	"click",
	salvarEmpresa
);


// =====================================================
// MENU LATERAL
// =====================================================

const botaoMenu =
	document.querySelector(".botao-menu");

if (botaoMenu) {

	botaoMenu.addEventListener("click", () => {

		if (window.innerWidth <= 640) {
			return;
		}

		document.body.classList.toggle(
			"sidebar-recolhida"
		);

	});

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

carregarTema();
carregarNotificacoes();
carregarUsuario();

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