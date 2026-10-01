/* Regras locais compartilhadas. Persistência por empresa será implementada no banco. */
(function (root) {
	"use strict";
	function productKey(userId) {
		if (typeof userId !== "string" || !userId.trim()) throw new Error("Faça login novamente.");
		return `stockzap:usuario:${userId}:produtos:v1`;
	}
	function validateProduct(product) {
		if (!product || typeof product !== "object") return "Produto inválido.";
		for (const [field, limit] of [["nome", 120], ["codigo", 60], ["categoria", 80]]) {
			if (typeof product[field] !== "string" || !product[field].trim() || product[field].length > limit) {
				return "Preencha nome, código e categoria dentro dos limites dos campos.";
			}
		}
		if (!Number.isFinite(product.preco) || product.preco < 0 || product.preco > 999999999) return "Informe um preço válido e não negativo.";
		for (const field of ["estoque", "estoqueMinimo"]) {
			if (!Number.isSafeInteger(product[field]) || product[field] < 0) return "As quantidades devem ser números inteiros e não negativos.";
		}
		return "";
	}
	function validateProducts(items) {
		if (!Array.isArray(items)) throw new Error("Formato de produtos inválido.");
		const ids = new Set();
		const codes = new Set();
		for (const item of items) {
			const error = validateProduct(item);
			if (error) throw new Error(error);
			if (!(typeof item.id === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(item.id)) && !(Number.isSafeInteger(item.id) && item.id > 0)) throw new Error("Identificador de produto inválido.");
			const id = String(item.id);
			const code = item.codigo.trim().toLocaleLowerCase("pt-BR");
			if (ids.has(id) || codes.has(code)) throw new Error("Há produtos com identificadores ou códigos duplicados.");
			ids.add(id); codes.add(code);
		}
		return items;
	}
	function loadProducts(storage, userId) {
		const raw = storage.getItem(productKey(userId));
		if (raw === null) return { items: [], raw: null };
		try {
			return { items: validateProducts(JSON.parse(raw)), raw };
		} catch (_) {
			throw new Error("Os produtos salvos neste navegador não puderam ser lidos. Os dados foram preservados; não é possível editar até revisar esse armazenamento.");
		}
	}
	function saveProducts(storage, userId, items, expectedRaw) {
		validateProducts(items);
		const key = productKey(userId);
		if (storage.getItem(key) !== expectedRaw) throw new Error("Os produtos mudaram em outra aba. Recarregue a página antes de salvar para não sobrescrever alterações.");
		const raw = JSON.stringify(items);
		try { storage.setItem(key, raw); }
		catch (_) { throw new Error("Não foi possível salvar neste navegador. Libere espaço ou permita o armazenamento e tente novamente."); }
		return raw;
	}
	function upsertProduct(items, draft, id, newId) {
		const error = validateProduct(draft);
		if (error) throw new Error(error);
		const code = draft.codigo.trim().toLocaleLowerCase("pt-BR");
		if (items.some(item => String(item.id) !== String(id) && item.codigo.trim().toLocaleLowerCase("pt-BR") === code)) throw new Error("Já existe um produto com esse código.");
		if (id) {
			if (!items.some(item => String(item.id) === String(id))) throw new Error("Produto não encontrado. Recarregue a página.");
			return items.map(item => String(item.id) === String(id) ? { ...draft, id: item.id } : item);
		}
		return [...items, { ...draft, id: newId }];
	}
	const api = Object.freeze({ productKey, validateProduct, validateProducts, loadProducts, saveProducts, upsertProduct });
	if (typeof module !== "undefined" && module.exports) module.exports = api;
	else root.StockZapCore = api;
})(typeof window !== "undefined" ? window : globalThis);
