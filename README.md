# Banana Verde — prévia da loja online

Prévia ao vivo da nova loja online da **Banana Verde** (Av. José Bonifácio, 593 — Porto Alegre/RS), produzida pela **Femik**.

- **Link público (GitHub Pages):** https://kimciddev.github.io/banana-verde-loja/
- **Estado:** mockup / protótipo — preços, parcelas, fretes e prazos **simulados**; fotos ilustrativas de banco de imagens (Unsplash)
- **Site atual da loja:** https://bananaverde.eco.br/

## O que tem nesta prévia

- Homepage da loja: proposta numa frase, busca de produtos, as 6 categorias, destaques, avaliações (97 no Google, 5 estrelas) perto do topo, como comprar, kits/presentes, blog ligado ao produto, mapa, um único quadro de horários, WhatsApp fixo e Instagram.
- Categoria **Casa Ecológica completa**: 7 produtos já citados no site atual, cada um com espaço de foto marcado, preço, parcelamento, botão de compra e WhatsApp por produto.
- Página de produto, carrinho (soma itens e valores), checkout como interface (dados → retirada/entrega/envio → cartão parcelado) e confirmação com envio do pedido pelo WhatsApp.
- As outras 5 categorias abrem com caminho de compra pelo WhatsApp enquanto a vitrine não é montada.

**Nada é cobrado.** O pagamento real, a plataforma da loja e o provedor de pagamento serão decididos com o dono.

## Dados simulados

Tudo fica em **`js/data.js`**: preços dos produtos e, em `sim`, parcelas (até 3x sem juros), retirada grátis, entrega em POA (R$ 12,90 ou grátis acima de R$ 199) e envio (R$ 24,90). O carrinho e o checkout calculam subtotal, frete, total e parcelas a partir daí.

## Fotos

Coloque as fotos (de preferência quadradas, ~1000×1000, JPG) com estes nomes exatos. Enquanto o arquivo não existe, aparece uma ilustração com o nome do produto — nunca imagem quebrada.

| Arquivo | Sugestão de busca no Unsplash |
|---|---|
| `img/hero.jpg` (horizontal, ~1600×1200) | zero waste kitchen / eco products flat lay |
| `img/produtos/filtro-de-barro.jpg` | clay water filter / terracotta water jar |
| `img/produtos/coador-de-pano-de-cafe.jpg` | cloth coffee filter / pour over cloth |
| `img/produtos/saquinhos-reutilizaveis.jpg` | reusable cotton produce bags |
| `img/produtos/bucha-vegetal.jpg` | loofah sponge |
| `img/produtos/copo-reutilizavel.jpg` | reusable coffee cup |
| `img/produtos/canudo-de-metal.jpg` | metal straws |
| `img/produtos/composteira.jpg` | compost bin kitchen |
| `img/produtos/fraldas-de-pano.jpg` | cloth diapers |
| `img/produtos/coletor-menstrual.jpg` | menstrual cup |

## Como abrir

Abra `index.html` no navegador — não precisa de build nem de servidor. Navegação por `#/` (funciona em arquivos estáticos e no GitHub Pages).

## Arquivos

- `index.html` — estrutura (cabeçalho, busca, rodapé, WhatsApp fixo)
- `css/style.css` — estilos, mobile-first
- `js/data.js` — loja, categorias e produtos (edite aqui)
- `js/app.js` — páginas, busca, carrinho e checkout
