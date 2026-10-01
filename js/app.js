/* Inicialização das páginas internas. Não substitui as policies do Supabase. */
"use strict";
window.StockZap = (() => {
	let user = null;
	let invalidated = false;
	const loginUrl = "../primeiro_contato/login.html";
	const panel = document.getElementById("estado-sessao");
	function element(tag, text, className) {
		const node = document.createElement(tag);
		if (text !== undefined) node.textContent = text;
		if (className) node.className = className;
		return node;
	}
	function message(text, error = false) {
		const area = document.getElementById("aviso-app");
		area.textContent = text;
		area.classList.toggle("erro", error);
		area.hidden = !text;
	}
	function invalidate() {
		invalidated = true;
		user = null;
		document.documentElement.dataset.session = "pending";
		window.location.replace(loginUrl);
	}
	function active() {
		if (!user || invalidated) throw new Error("Sua sessão terminou. Faça login novamente.");
		return user;
	}
	function storageKey(name) { return `stockzap:usuario:${active().id}:${name}:v1`; }
	function readPreference(name, fallback) {
		try { return localStorage.getItem(storageKey(name)) ?? fallback; }
		catch (_) { return fallback; }
	}
	function writePreference(name, value) {
		try { localStorage.setItem(storageKey(name), value); }
		catch (_) { message("Não foi possível guardar esta preferência no navegador.", true); }
	}
	async function logout() {
		const buttons = document.querySelectorAll("[data-sair]");
		buttons.forEach(button => { button.setAttribute("aria-disabled", "true"); });
		try {
			const { error } = await stockzapSupabase.auth.signOut();
			if (error) throw error;
			invalidate();
		} catch (_) {
			message("Não foi possível sair. Confira sua conexão e tente novamente.", true);
		} finally { buttons.forEach(button => button.removeAttribute("aria-disabled")); }
	}
	function shell() {
		document.querySelectorAll('a[href="#"]').forEach(link => {
			link.removeAttribute("href");
			link.setAttribute("aria-disabled", "true");
			link.title = "Disponível em uma próxima versão";
		});
		document.querySelectorAll(".notificacoes").forEach(button => {
			button.disabled = true;
			button.title = "Notificações em breve";
			button.setAttribute("aria-label", "Notificações em breve");
			button.querySelector(".notificacao-ponto")?.remove();
		});
		const profile = document.querySelector(".usuario-topbar");
		if (profile) {
			const link = element("a", undefined, profile.className);
			link.href = "configuracoes.html";
			link.setAttribute("aria-label", "Minha conta e configurações");
			link.append(...profile.childNodes);
			profile.replaceWith(link);
		}
		const mobileExit = element("button", "Sair", "sair-mobile");
		mobileExit.type = "button";
		mobileExit.dataset.sair = "";
		document.querySelector(".topbar")?.append(mobileExit);
		document.querySelectorAll(".menu-item.sair").forEach(link => { link.dataset.sair = ""; });
		document.querySelectorAll("[data-sair]").forEach(link => link.addEventListener("click", event => {
			event.preventDefault();
			if (link.getAttribute("aria-disabled") !== "true") logout();
		}));
		const menu = document.querySelector(".botao-menu");
		menu?.setAttribute("aria-expanded", "true");
		menu?.addEventListener("click", () => {
			if (window.innerWidth <= 640) return;
			const collapsed = document.body.classList.toggle("sidebar-recolhida");
			menu.setAttribute("aria-expanded", String(!collapsed));
		});
		setName(user.user_metadata?.nome || "Usuário");
		// Aproveita a tabela existente sem mudar seu contrato ou suas permissões.
		stockzapSupabase.from("usuario").select("nome_usuario").eq("auth_id", user.id).maybeSingle()
			.then(({ data, error }) => { if (!error && data?.nome_usuario && !invalidated) setName(data.nome_usuario); })
			.catch(() => {});
	}
	function setName(name) {
		const value = String(name).trim() || "Usuário";
		for (const id of ["nome-usuario-topbar", "nome-usuario-dashboard"]) {
			const target = document.getElementById(id);
			if (target) target.textContent = value;
		}
		const avatar = document.getElementById("avatar-usuario");
		if (avatar) avatar.textContent = value.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
	}
	const ready = (async () => {
		let timeout;
		try {
			if (typeof stockzapSupabase === "undefined") throw new Error("Cliente indisponível");
			stockzapSupabase.auth.onAuthStateChange((event, session) => {
				if (event === "SIGNED_OUT" || (user && session?.user.id !== user.id)) invalidate();
			});
			const response = await Promise.race([
				stockzapSupabase.auth.getUser(),
				new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Tempo esgotado")), 12000); }),
			]);
			if (invalidated) return null;
			if (!response.data?.user && !response.error) { invalidate(); return null; }
			if (response.error) {
				if ([401, 403].includes(response.error.status) || response.error.name === "AuthSessionMissingError") { invalidate(); return null; }
				throw response.error;
			}
			user = response.data.user;
			shell();
			document.documentElement.dataset.session = "ready";
			panel.hidden = true;
			return user;
		} catch (_) {
			panel.replaceChildren(element("h1", "Não foi possível verificar sua sessão"), element("p", "Confira a conexão e tente novamente."));
			const retry = element("button", "Tentar novamente");
			retry.type = "button";
			retry.addEventListener("click", () => window.location.reload());
			const login = element("a", "Voltar ao login"); login.href = loginUrl;
			panel.append(retry, login);
			return null;
		} finally { clearTimeout(timeout); }
	})();
	window.addEventListener("pageshow", event => {
		if (event.persisted) { document.documentElement.dataset.session = "pending"; window.location.reload(); }
	});
	return { ready, active, message, element, storageKey, readPreference, writePreference, setName };
})();
