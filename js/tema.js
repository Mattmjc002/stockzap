// =====================================================
// TEMA GLOBAL DO STOCKZAP
// =====================================================

function aplicarTema() {
	const tema = localStorage.getItem("stockzap_tema") || "claro";

	document.body.classList.toggle("tema-escuro", tema === "escuro");
}

// Aplica imediatamente quando a página carregar
aplicarTema();