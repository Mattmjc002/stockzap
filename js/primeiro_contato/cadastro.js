const formCadastro = document.getElementById("formCadastro");

formCadastro.addEventListener("submit", async (evento) => {
	evento.preventDefault();

	const nome = document.getElementById("nome_user").value.trim();
	const empresa = document.getElementById("nome_empresa").value.trim();
	const email = document.getElementById("email").value.trim();
	const senha = document.getElementById("senha").value;

	console.log("Dados do cadastro:", {
		nome,
		empresa,
		email
	});

	// ==========================================
	// 1. CRIAR CONTA NO SUPABASE AUTH
	// ==========================================

	const { data, error } = await stockzapSupabase.auth.signUp({
		email: email,
		password: senha,

		options: {
			data: {
				nome: nome,
				empresa: empresa
			}
		}
	});

	if (error) {
		console.error("Erro ao criar conta:", error);
		alert("Erro ao criar conta: " + error.message);
		return;
	}

	const usuarioAuth = data.user;

	if (!usuarioAuth) {
		console.error("Usuário não encontrado.");
		alert("Erro ao identificar usuário.");
		return;
	}

	console.log("Usuário criado no Auth:", usuarioAuth.id);


	// ==========================================
	// 2. CRIAR REGISTRO NA TABELA usuario
	// ==========================================

	const { data: usuarioBanco, error: erroUsuario } =
		await stockzapSupabase
			.from("usuario")
			.insert({
				auth_id: usuarioAuth.id,
				nome_usuario: nome,
				email: email
			})
			.select()
			.single();

	if (erroUsuario) {
		console.error(
			"Erro ao salvar usuário:",
			erroUsuario
		);

		alert(
			"Conta criada, mas ocorreu um erro ao salvar seus dados."
		);

		return;
	}

	console.log(
		"Usuário salvo na tabela usuario:",
		usuarioBanco
	);


	// ==========================================
	// 3. CRIAR EMPRESA
	// ==========================================

	const { data: empresaBanco, error: erroEmpresa } =
		await stockzapSupabase
			.from("empresa")
			.insert({
				id_usuario: usuarioBanco.id_usuario,
				nome_empresa: empresa
			})
			.select()
			.single();

	if (erroEmpresa) {
		console.error(
			"Erro ao salvar empresa:",
			erroEmpresa
		);

		alert(
			"Usuário criado, mas ocorreu um erro ao salvar a empresa."
		);

		return;
	}

	console.log(
		"Empresa salva:",
		empresaBanco
	);


	// ==========================================
	// 4. FINALIZAR
	// ==========================================

	alert("Conta criada com sucesso!");

	window.location.href = "autenticando.html";
});