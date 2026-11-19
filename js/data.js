/*
 * Banana Verde — dados da prévia da loja online
 * ------------------------------------------------------------
 * Tudo o que é da loja fica aqui. Para atualizar a prévia,
 * edite só este arquivo.
 *
 * MOCKUP: preços, prazos e fretes abaixo são SIMULADOS para a
 * apresentação ao dono. As fotos são ilustrativas (banco de imagens).
 * Na loja real, tudo isso vem do dono / do sistema da loja.
 *
 * - price: número em reais (ex.: 89.9). O carrinho soma sozinho.
 * - stock: true (em estoque) / false (esgotado).
 * - photo: caminho da foto (img/produtos/...) OU endereço do Unsplash
 *   (images.unsplash.com/photo-...). O tamanho e o corte quadrado são
 *   ajustados sozinhos. Se a foto não carregar, aparece uma ilustração.
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
  reviews: { count: 97, rating: "5,0", source: "Google" },
  heroPhoto: "img/hero.jpg",
  hours: [["Segunda a sábado", "9h às 18h"], ["Domingo", "Fechado"]],

  // ---- valores SIMULADOS para o mockup ----
  sim: {
    maxInstallments: 3,       // parcelas sem juros no cartão
    minInstallment: 10,       // parcela mínima em R$
    pickup: { fee: 0, time: "pronto em até 2 horas" },
    poa: { fee: 12.9, time: "em até 1 dia útil" },
    ship: { fee: 24.9, time: "de 3 a 7 dias úteis" },
    freePoaFrom: 199          // entrega grátis em Porto Alegre acima deste valor
  }
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
    desc: "O clássico filtro de barro para a água de casa.", price: 189.9, stock: true, photo: "https://images.unsplash.com/photo-1673555136815-d19673464f37", tone: "clay", featured: true },
  { slug: "coador-de-pano-de-cafe", name: "Coador de pano de café", cat: "casa-ecologica",
    desc: "Coador de pano reutilizável, no lugar do filtro de papel.", price: 24.9, stock: true, photo: "img/produtos/coador-de-pano-de-cafe.jpg", tone: "coffee", featured: true },
  { slug: "saquinhos-reutilizaveis", name: "Saquinhos reutilizáveis", cat: "casa-ecologica",
    desc: "Saquinhos para usar de novo e de novo, no lugar dos descartáveis.", price: 39.9, stock: true, photo: "img/produtos/saquinhos-reutilizaveis.jpg", tone: "linen", featured: false },
  { slug: "bucha-vegetal", name: "Bucha vegetal", cat: "casa-ecologica",
    desc: "Bucha natural para a louça e a limpeza.", price: 9.9, stock: true, photo: "img/produtos/bucha-vegetal.jpg", tone: "straw", featured: true },
  { slug: "copo-reutilizavel", name: "Copo reutilizável", cat: "casa-ecologica",
    desc: "Um copo para levar junto e recusar o descartável.", price: 34.9, stock: true, photo: "img/produtos/copo-reutilizavel.jpg", tone: "sage", featured: true },
  { slug: "canudo-de-metal", name: "Canudo de metal", cat: "casa-ecologica",
    desc: "Canudo de metal reutilizável.", price: 19.9, stock: true, photo: "img/produtos/canudo-de-metal.jpg", tone: "steel", featured: false },
  { slug: "composteira", name: "Composteira", cat: "casa-ecologica",
    desc: "Para transformar os restos orgânicos da cozinha em adubo.", price: 279, stock: true, photo: "img/produtos/composteira.jpg", tone: "soil", featured: true },

  // ---- Outras categorias: só os produtos já citados no site atual ----
  { slug: "fraldas-de-pano", name: "Fraldas de pano", cat: "infancia-sustentavel",
    desc: "Fraldas de pano reutilizáveis.", price: 49.9, stock: true, photo: "img/produtos/fraldas-de-pano.jpg", tone: "linen", featured: false },
  { slug: "coletor-menstrual", name: "Coletor menstrual", cat: "eco-menstruacao",
    desc: "Coletor menstrual reutilizável.", price: 89.9, stock: true, photo: "img/produtos/coletor-menstrual.jpg", tone: "rose", featured: false }
];
