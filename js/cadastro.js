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

	const { data, error } = await stockzapSupabase.auth.signUp({
		email: email,
		password: senha
	});

	if (error) {
		console.error("Erro ao criar conta:", error);
		alert("Erro ao criar conta: " + error.message);
		return;
	}

	console.log("Usuário criado:", data);

	alert("Conta criada com sucesso!");

	window.location.href = "zapchat.html";
});