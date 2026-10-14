// Formatação para exibir na tela. A API devolve dados "crus" (data ISO, número)
// e o front decide como mostrar: separar dado de apresentação.

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });

// 4487 -> "R$ 4.487,00"
export function formatarMoeda(valor) {
  return moeda.format(valor);
}

// "2000-06-02" -> "02/06/2000" (sem new Date, para não haver efeito de fuso horário)
export function formatarData(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

// 6 -> "6"; 1.5 -> "1,5"
export function formatarQuantidade(quantidade) {
  return numero.format(quantidade);
}
