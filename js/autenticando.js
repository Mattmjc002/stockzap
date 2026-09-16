let verificando = false;

async function verificarSessao() {

	if (verificando) {
		return;
	}

	verificando = true;

	const titulo = document.getElementById("titulo");
	const mensagem = document.getElementById("mensagem");
	const botao = document.getElementById("botaoReenviar");

	try {

		console.log("Verificando sessão...");

		const {
			data,
			error
		} = await stockzapSupabase.auth.getSession();

		if (error) {

			console.error("Erro ao verificar sessão:", error);

			titulo.textContent = "Erro ao verificar sua conta";

			mensagem.textContent =
				"Não conseguimos verificar sua autenticação. Tente novamente.";

			botao.style.display = "inline-block";

			verificando = false;

			return;
		}


		const sessao = data.session;


		// Usuário autenticado
		if (sessao) {

			console.log("Sessão encontrada!");

			titulo.textContent = "Conta autenticada!";

			mensagem.textContent =
				"Preparando seu StockZap...";


			setTimeout(() => {

				window.location.href = "zapchat-perguntas.html";

			}, 800);

			return;
		}


		// Usuário ainda não autenticado
		console.log("Nenhuma sessão encontrada.");

		titulo.textContent = "Verifique seu e-mail";

		mensagem.textContent =
			"Enviamos um link de confirmação para o seu e-mail. Depois de confirmar, esta página continuará automaticamente.";


		botao.style.display = "inline-block";

		verificando = false;


		// Continua verificando automaticamente
		setTimeout(() => {

			verificando = false;

			verificarSessao();

		}, 3000);


	} catch (erro) {

		console.error("Erro inesperado:", erro);

		titulo.textContent = "Ocorreu um erro";

		mensagem.textContent =
			"Não conseguimos verificar sua conta. Tente novamente.";

		botao.style.display = "inline-block";

		verificando = false;
	}
}


document.addEventListener("DOMContentLoaded", () => {

	console.log("Página de autenticação carregada.");

	verificarSessao();

});