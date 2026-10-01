/* =====================================================
   STOCKZAP - COMPONENTES NATIVOS DE LAYOUT
   Sidebar e Topbar padronizadas e reutilizáveis
===================================================== */

class StockzapSidebar extends HTMLElement {
	connectedCallback() {
		const paginaAtiva = this.getAttribute("pagina-ativa") || "";

		// Verifica se o usuário personalizou seu negócio pelo ZapChat
		let ocultarEquipe = false;
		try {
			const configZap = JSON.parse(
				localStorage.getItem("stockzap_configuracao")
			);
			if (configZap && configZap.perfil) {
				// Se o perfil for apenas o dono, oculta menu de equipe
				if (
					configZap.perfil.equipe === "so_eu" ||
					(Array.isArray(configZap.funcionalidades) &&
						!configZap.funcionalidades.some((f) =>
							f.toLowerCase().includes("equipe")
						))
				) {
					ocultarEquipe = true;
				}
			}
		} catch (e) {
			console.warn("Não foi possível ler configurações do ZapChat:", e);
		}

		this.innerHTML = `
			<aside class="sidebar">
				<div class="logo-area">
					<a href="dashboard.html">
						<img alt="Logo StockZap" src="../../imagens/StockZap_logo.svg" />
					</a>
				</div>
				<nav class="menu-dashboard">
					<a class="menu-item ${paginaAtiva === "dashboard" ? "ativo" : ""}" href="dashboard.html">
						<img src="../../imagens/icones/home-sidebar.svg" class="menu-icon" alt="" />
						<span>Dashboard</span>
					</a>
					<a class="menu-item ${paginaAtiva === "produtos" ? "ativo" : ""}" href="produtos.html">
						<img src="../../imagens/icones/package-sidebar.svg" class="menu-icon" alt="" />
						<span>Produtos</span>
					</a>
					<a class="menu-item ${paginaAtiva === "estoque" ? "ativo" : ""}" href="#">
						<img src="../../imagens/icones/packages-sidebar.svg" class="menu-icon" alt="" />
						<span>Estoque</span>
					</a>
					<a class="menu-item ${paginaAtiva === "financeiro" ? "ativo" : ""}" href="#">
						<img src="../../imagens/icones/cash-sidebar.svg" class="menu-icon" alt="" />
						<span>Financeiro</span>
					</a>
					<a class="menu-item ${paginaAtiva === "prazos" ? "ativo" : ""}" href="#">
						<img src="../../imagens/icones/calendar-sidebar.svg" class="menu-icon" alt="" />
						<span>Prazos</span>
					</a>
					${
						ocultarEquipe
							? ""
							: `
					<a class="menu-item ${paginaAtiva === "equipe" ? "ativo" : ""}" href="#">
						<img src="../../imagens/icones/users-sidebar.svg" class="menu-icon" alt="" />
						<span>Equipe</span>
					</a>`
					}
				</nav>
				<div class="menu-inferior">
					<a href="configuracoes.html" class="menu-item configuracoes ${paginaAtiva === "configuracoes" ? "ativo" : ""}">
						<img src="../../imagens/icones/settings-sidebar.svg" class="menu-icon" alt="" />
						<span>Configurações</span>
					</a>
					<a class="menu-item sair" href="../../stockzap.html">
						<img src="../../imagens/icones/logout-sidebar.svg" class="menu-icon" alt="" />
						<span>Sair</span>
					</a>
				</div>
			</aside>
		`;

		this.configurarLogout();
	}

	configurarLogout() {
		const btnSair = this.querySelector(".menu-item.sair");
		if (btnSair) {
			btnSair.addEventListener("click", async (e) => {
				e.preventDefault();
				try {
					if (typeof stockzapSupabase !== "undefined" && stockzapSupabase.auth) {
						await stockzapSupabase.auth.signOut();
					}
				} catch (err) {
					console.error("Erro ao encerrar sessão:", err);
				}
				window.location.href = "../../stockzap.html";
			});
		}
	}
}

class StockzapTopbar extends HTMLElement {
	connectedCallback() {
		const titulo = this.getAttribute("titulo") || "StockZap";

		this.innerHTML = `
			<header class="topbar">
				<button aria-label="Abrir menu" class="botao-menu" type="button">
					<img src="../../imagens/icones/menu-navy.svg" alt="" />
				</button>
				<div class="linha-container">
					<h1>${titulo}</h1>
				</div>	
				<div class="topbar-direita">
					<button aria-label="Notificações" class="notificacoes" type="button">
						<img src="../../imagens/icones/bell-navy.svg" alt="" />
						<span class="notificacao-ponto"></span>
					</button>
					<a href="configuracoes.html" class="usuario-topbar" style="text-decoration: none; color: inherit;">
						<div class="avatar" id="avatar-usuario">US</div>
						<div class="usuario-info">
							<strong id="nome-usuario-topbar">Usuário</strong>
						</div>
						<img src="../../imagens/icones/chevron-navy.svg" class="chevron" alt="" />
					</a>
				</div>
			</header>
		`;

		this.configurarMenu();
		this.carregarDadosUsuario();
	}

	configurarMenu() {
		const botaoMenu = this.querySelector(".botao-menu");
		if (botaoMenu) {
			botaoMenu.addEventListener("click", () => {
				if (window.innerWidth <= 640) {
					document.body.classList.toggle("sidebar-aberta");
				} else {
					document.body.classList.toggle("sidebar-recolhida");
				}
			});
		}
	}

	async carregarDadosUsuario() {
		if (typeof stockzapSupabase === "undefined" || !stockzapSupabase.auth) {
			return;
		}

		try {
			const {
				data: { user },
				error: erroAuth,
			} = await stockzapSupabase.auth.getUser();

			if (erroAuth || !user) return;

			let nome = user.user_metadata?.nome || "";

			// Tenta buscar da tabela usuario
			try {
				const { data: usuario } = await stockzapSupabase
					.from("usuario")
					.select("nome_usuario")
					.eq("auth_id", user.id)
					.maybeSingle();

				if (usuario && usuario.nome_usuario) {
					nome = usuario.nome_usuario;
				}
			} catch (_) {}

			nome = nome || "Usuário";

			const nomeEl = this.querySelector("#nome-usuario-topbar");
			const avatarEl = this.querySelector("#avatar-usuario");

			if (nomeEl) nomeEl.textContent = nome;

			if (avatarEl) {
				const partes = nome.trim().split(/\s+/).filter(Boolean);
				let iniciais = "US";
				if (partes.length === 1) {
					iniciais = partes[0].substring(0, 2).toUpperCase();
				} else if (partes.length > 1) {
					iniciais = (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
				}
				avatarEl.textContent = iniciais;
			}
		} catch (err) {
			console.warn("Não foi possível carregar usuário na topbar:", err);
		}
	}
}

// Registro dos Custom Elements
if (!customElements.get("stockzap-sidebar")) {
	customElements.define("stockzap-sidebar", StockzapSidebar);
}
if (!customElements.get("stockzap-topbar")) {
	customElements.define("stockzap-topbar", StockzapTopbar);
}

