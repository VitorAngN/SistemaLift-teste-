// Chamadas do navegador para a NOSSA API (/api/...), nunca direto para a Lift.

// Busca um JSON e, se a resposta for de erro, lança um Error com a mensagem
// que o servidor mandou em { "erro": "..." } e o status HTTP.
export async function buscarJson(caminho) {
  const resposta = await fetch(caminho);
  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = new Error(corpo?.erro ?? `Erro HTTP ${resposta.status}`);
    erro.status = resposta.status;
    throw erro;
  }

  return corpo;
}
