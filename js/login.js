const formLogin = document.getElementById("formLogin");

formLogin.addEventListener("submit", async (evento) => {
	evento.preventDefault();

	const email = document.getElementById("email").value.trim();
	const senha = document.getElementById("senha").value;

	const { data, error } = await stockzapSupabase.auth.signInWithPassword({
		email: email,
		password: senha
	});

	if (error) {
		console.error("Erro ao entrar:", error);
		alert("E-mail ou senha incorretos.");
		return;
	}

	console.log("Login realizado:", data);

	window.location.href = "../zapchat-perguntas.html";
});