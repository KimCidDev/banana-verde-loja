# Banana Verde — prévia da loja online

Prévia ao vivo da nova loja online da **Banana Verde** (Av. José Bonifácio, 593 — Porto Alegre/RS), produzida pela **Femik**.

- **Link público (GitHub Pages):** https://kimciddev.github.io/banana-verde-loja/
- **Estado:** protótipo (prévia para validação interna e vídeo para o dono da loja)
- **Site atual da loja:** https://bananaverde.eco.br/

## O que tem nesta prévia

- Homepage da loja: proposta numa frase, busca de produtos, as 6 categorias, destaques, avaliações (97 no Google, 5 estrelas) perto do topo, como comprar, kits/presentes, blog ligado ao produto, mapa, um único quadro de horários, WhatsApp fixo e Instagram.
- Categoria **Casa Ecológica completa**: 7 produtos já citados no site atual, cada um com espaço de foto marcado, preço, parcelamento, botão de compra e WhatsApp por produto.
- Página de produto, carrinho (soma itens e valores), checkout como interface (dados → retirada/entrega/envio → cartão parcelado) e confirmação com envio do pedido pelo WhatsApp.
- As outras 5 categorias abrem com caminho de compra pelo WhatsApp enquanto a vitrine não é montada.

**Nada é cobrado.** O pagamento real, a plataforma da loja e o provedor de pagamento serão decididos com o dono.

## Dados [a confirmar]

Preços, estoque, fotos, nº de parcelas, custos e prazos de entrega/envio, horários e estacionamento aparecem marcados como `[a confirmar]`. Tudo fica em **`js/data.js`**: troque `price: null` por um número (ex.: `89.9`) e o carrinho passa a somar em reais automaticamente.

## Como abrir

Abra `index.html` no navegador — não precisa de build nem de servidor. Navegação por `#/` (funciona em arquivos estáticos e no GitHub Pages).

## Arquivos

- `index.html` — estrutura (cabeçalho, busca, rodapé, WhatsApp fixo)
- `css/style.css` — estilos, mobile-first
- `js/data.js` — loja, categorias e produtos (edite aqui)
- `js/app.js` — páginas, busca, carrinho e checkout
