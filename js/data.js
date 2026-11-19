/*
 * Banana Verde — dados da prévia da loja online
 * ------------------------------------------------------------
 * Tudo o que é da loja fica aqui. Para atualizar a prévia,
 * edite só este arquivo.
 *
 * REGRAS:
 * - price: null  -> aparece como "[a confirmar]". Quando o dono
 *   passar o preço, troque por um número (ex.: 89.9) e o
 *   carrinho passa a somar em reais automaticamente.
 * - stock: null  -> disponibilidade "[a confirmar]".
 *   Use true (disponível) ou false (esgotado) quando souber.
 * - photo: null  -> espaço de foto marcado com o nome do produto.
 *   Quando houver foto real da loja, coloque o caminho
 *   (ex.: "img/produtos/filtro-de-barro.jpg").
 * - Só entram produtos cujo nome já aparece no site atual.
 */

window.BV_STORE = {
  name: "Banana Verde",
  whatsapp: "5551980368181",
  phoneDisplay: "(51) 98036-8181",
  address: "Av. José Bonifácio, 593",
  district: "Bairro Farroupilha, Porto Alegre–RS",
  instagram: "bananaverdepoa",
  currentSite: "https://bananaverde.eco.br/",
  reviews: { count: 97, rating: "5,0", source: "Google" }
};

window.BV_CATEGORIES = [
  {
    slug: "casa-ecologica",
    name: "Casa Ecológica",
    intro: "Para a cozinha, a limpeza e o lixo da casa: trocas simples que diminuem o descartável no dia a dia.",
    brands: ["Cerâmica Stefani", "Biowash", "Milão", "Projeto Águas Limpas", "Menos Um Lixo", "Embaleco"],
    ready: true
  },
  {
    slug: "infancia-sustentavel",
    name: "Infância Sustentável",
    intro: "Produtos ecológicos para os pequenos.",
    brands: [],
    ready: false
  },
  {
    slug: "cosmeticos-naturais",
    name: "Cosméticos Naturais",
    intro: "Cuidado com a pele e o cabelo com marcas de cosmética natural.",
    brands: ["Cativa Natureza", "Bioart", "Livealoe", "Herbia"],
    ready: false
  },
  {
    slug: "aromaterapia",
    name: "Aromaterapia",
    intro: "Aromas para a casa e para o bem-estar.",
    brands: [],
    ready: false
  },
  {
    slug: "eco-menstruacao",
    name: "Eco Menstruação",
    intro: "Alternativas reutilizáveis para o ciclo menstrual.",
    brands: [],
    ready: false
  },
  {
    slug: "higiene-e-bem-estar",
    name: "Higiene e Bem-estar",
    intro: "Higiene do dia a dia, sem tanto plástico.",
    brands: [],
    ready: false
  }
];

window.BV_PRODUCTS = [
  // ---- Casa Ecológica (categoria completa da prévia) ----
  { slug: "filtro-de-barro", name: "Filtro de barro", cat: "casa-ecologica",
    desc: "O clássico filtro de barro para a água de casa.", price: null, stock: null, photo: null, tone: "clay", featured: true },
  { slug: "coador-de-pano-de-cafe", name: "Coador de pano de café", cat: "casa-ecologica",
    desc: "Coador de pano reutilizável, no lugar do filtro de papel.", price: null, stock: null, photo: null, tone: "coffee", featured: true },
  { slug: "saquinhos-reutilizaveis", name: "Saquinhos reutilizáveis", cat: "casa-ecologica",
    desc: "Saquinhos para usar de novo e de novo, no lugar dos descartáveis.", price: null, stock: null, photo: null, tone: "linen", featured: false },
  { slug: "bucha-vegetal", name: "Bucha vegetal", cat: "casa-ecologica",
    desc: "Bucha natural para a louça e a limpeza.", price: null, stock: null, photo: null, tone: "straw", featured: true },
  { slug: "copo-reutilizavel", name: "Copo reutilizável", cat: "casa-ecologica",
    desc: "Um copo para levar junto e recusar o descartável.", price: null, stock: null, photo: null, tone: "sage", featured: true },
  { slug: "canudo-de-metal", name: "Canudo de metal", cat: "casa-ecologica",
    desc: "Canudo de metal reutilizável.", price: null, stock: null, photo: null, tone: "steel", featured: false },
  { slug: "composteira", name: "Composteira", cat: "casa-ecologica",
    desc: "Para transformar os restos orgânicos da cozinha em adubo.", price: null, stock: null, photo: null, tone: "soil", featured: true },

  // ---- Outras categorias: só os produtos já citados no site atual ----
  { slug: "fraldas-de-pano", name: "Fraldas de pano", cat: "infancia-sustentavel",
    desc: "Fraldas de pano reutilizáveis.", price: null, stock: null, photo: null, tone: "linen", featured: false },
  { slug: "coletor-menstrual", name: "Coletor menstrual", cat: "eco-menstruacao",
    desc: "Coletor menstrual reutilizável.", price: null, stock: null, photo: null, tone: "rose", featured: false }
];
