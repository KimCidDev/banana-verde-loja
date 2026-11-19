/*
 * Banana Verde — prévia da loja online
 * Navegação por hash (#/...), funciona em arquivos estáticos e no GitHub Pages.
 * Rotas:
 *   #/                         início
 *   #/categoria/<slug>         vitrine da categoria
 *   #/produto/<slug>           página do produto
 *   #/carrinho                 carrinho
 *   #/checkout                 finalizar compra (interface; sem pagamento real)
 *   #/pedido                   confirmação da prévia + envio pelo WhatsApp
 * Todos os cliques são ligados aqui no JavaScript (sem handlers inline).
 */
(function () {
  "use strict";

  var STORE = window.BV_STORE;
  var CATS = window.BV_CATEGORIES;
  var PRODUCTS = window.BV_PRODUCTS;
  var app = document.getElementById("app");

  /* ---------------- utilidades ---------------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }
  function money(n) {
    return "R$ " + n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function tbc(label) {
    return '<span class="tbc">' + esc(label || "a confirmar") + "</span>";
  }
  function priceHTML(p) {
    if (typeof p.price === "number") return '<span class="price">' + money(p.price) + "</span>";
    return '<span class="price price--tbc">R$ ' + tbc() + "</span>";
  }
  var SIM = STORE.sim;
  function installmentsCount(total) {
    return Math.max(1, Math.min(SIM.maxInstallments, Math.floor(total / SIM.minInstallment)));
  }
  function installmentsText(total, short) {
    var n = installmentsCount(total);
    if (n < 2) return "à vista no cartão";
    return n + "x de " + money(Math.round(total * 100 / n) / 100) + (short ? "" : " sem juros");
  }
  // frete simulado: retirada grátis; POA grátis acima do mínimo; envio só com CEP completo
  function deliveryFee(type, subtotal, cep) {
    if (type === "retirada") return SIM.pickup.fee;
    if (type === "poa") return subtotal >= SIM.freePoaFrom ? 0 : SIM.poa.fee;
    return String(cep || "").replace(/\D/g, "").length === 8 ? SIM.ship.fee : null;
  }
  function feeText(fee) { return fee === null ? "informe o CEP" : (fee === 0 ? "Grátis" : money(fee)); }
  function stockHTML(p) {
    if (p.stock === true) return '<span class="stock stock--ok">Em estoque</span>';
    if (p.stock === false) return '<span class="stock stock--out">Esgotado</span>';
    return '<span class="stock">Disponibilidade ' + tbc() + "</span>";
  }
  function getProduct(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    return null;
  }
  function getCat(slug) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].slug === slug) return CATS[i];
    return null;
  }
  function productsOf(catSlug) {
    return PRODUCTS.filter(function (p) { return p.cat === catSlug; });
  }
  function waLink(text) {
    return "https://wa.me/" + STORE.whatsapp + "?text=" + encodeURIComponent(text);
  }
  function waProduct(p, qty) {
    var cat = getCat(p.cat);
    return waLink("Olá, Banana Verde! Vi na loja online e quero comprar: " +
      (qty && qty > 1 ? qty + "x " : "") + p.name + (cat ? " (" + cat.name + ")" : "") +
      ". Tem disponível? Qual o preço?");
  }
  var MAPS_QUERY = encodeURIComponent("Banana Verde, " + STORE.address + ", Porto Alegre - RS");
  var MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=" + MAPS_QUERY;
  var TEL = "tel:+" + STORE.whatsapp;
  var INSTAGRAM = "https://www.instagram.com/" + STORE.instagram + "/";

  var ICON = {
    leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c7 2 14-3 15-15-9 0-15 5-15 15z"/><path d="M5 19c3-4 6-7 10-9"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3c.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/></svg>',
    store: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10h18M9 20v-5h6v5"/></svg>',
    bike: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-8h5l3 8M10 9 8 5H6M13 9l-2 8"/></svg>',
    box: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="fill"/></svg>',
    gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8C10 4 6 4 7 7c.5 1 5 1 5 1zm0 0c2-4 6-4 5-1-.5 1-5 1-5 1z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
    pix: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M8 12h8M12 8v8"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>'
  };
  var STARS = ICON.star + ICON.star + ICON.star + ICON.star + ICON.star;

  // Endereços do Unsplash: pede o tamanho certo (rápido no celular, nítido na tela retina)
  function imgSrc(url, w, h) {
    if (!/^https:\/\/images\.unsplash\.com\//.test(url)) return url;
    var base = url.split("?")[0];
    return base + "?auto=format&fit=crop&q=75&w=" + w + (h ? "&h=" + h : "");
  }
  // Foto do produto. Se o arquivo não carregar, a imagem é removida e fica a ilustração.
  function photoHTML(p, big) {
    return '<div class="ph ph--' + esc(p.tone || "sage") + (big ? " ph--big" : "") + (p.photo ? "" : " ph--fallback") + '">' +
      ICON.leaf +
      '<span class="ph-name">' + esc(p.name) + "</span>" +
      (p.photo ? '<img class="ph-img" src="' + esc(imgSrc(p.photo, big ? 1000 : 600, big ? 750 : 600)) + '" alt="' + esc(p.name) + '" loading="lazy">' : "") +
      "</div>";
  }

  /* ---------------- carrinho ---------------- */

  var CART_KEY = "bv-cart-v1";
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}") || {}; } catch (e) { cart = {}; }
  // remove itens que não existem mais nos dados
  Object.keys(cart).forEach(function (k) { if (!getProduct(k) || !(cart[k] > 0)) delete cart[k]; });

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* sem storage: segue em memória */ }
    updateBadge();
  }
  function addToCart(slug, qty) {
    qty = qty || 1;
    cart[slug] = Math.min(99, (cart[slug] || 0) + qty);
    saveCart();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
    });
  }
  function setQty(slug, qty) {
    if (qty <= 0) delete cart[slug]; else cart[slug] = Math.min(99, qty);
    saveCart();
  }
  // Soma do carrinho. Se algum item ainda não tem preço, o total fica "a confirmar".
  function cartTotals() {
    var lines = [], count = 0, subtotal = 0, unknown = 0;
    Object.keys(cart).forEach(function (slug) {
      var p = getProduct(slug); if (!p) return;
      var q = cart[slug];
      count += q;
      var line = typeof p.price === "number" ? Math.round(p.price * 100) * q / 100 : null;
      if (line === null) unknown += q; else subtotal = Math.round((subtotal + line) * 100) / 100;
      lines.push({ p: p, qty: q, line: line });
    });
    return { lines: lines, count: count, subtotal: subtotal, unknown: unknown, complete: unknown === 0 };
  }
  window.BV_cartTotals = cartTotals; // exposto para testes
  window.BV_cart = { add: addToCart, set: setQty, get: function () { return cart; } };

  function updateBadge() {
    var t = cartTotals();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = t.count;
      el.hidden = t.count === 0;
    });
  }
  function totalHTML(t) {
    if (t.count === 0) return money(0);
    if (t.complete) return money(t.subtotal);
    return tbc();
  }

  /* ---------------- toast ---------------- */

  var toastEl = document.querySelector("[data-toast]");
  var toastTimer;
  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 250);
    }, 2600);
  }

  /* ---------------- pedaços de interface ---------------- */

  function cardHTML(p) {
    return '<article class="card">' +
      '<a class="card-media" href="#/produto/' + p.slug + '" aria-label="Ver ' + esc(p.name) + '">' + photoHTML(p) + "</a>" +
      '<div class="card-body">' +
        '<a class="card-title" href="#/produto/' + p.slug + '">' + esc(p.name) + "</a>" +
        priceHTML(p) +
        '<span class="card-installments">' + installmentsText(p.price, true) + "</span>" +
        '<div class="card-actions">' +
          '<button type="button" class="btn btn--primary btn--sm" data-action="add" data-slug="' + p.slug + '">Adicionar</button>' +
          '<a class="btn-wa-mini" href="' + waProduct(p) + '" target="_blank" rel="noopener" aria-label="Comprar ' + esc(p.name) + ' pelo WhatsApp">' + ICON.wa + "</a>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  function catTileHTML(c) {
    var n = productsOf(c.slug).length;
    var sub = c.ready ? n + (n === 1 ? " produto na vitrine" : " produtos na vitrine") : (n ? n + " produto · vitrine em montagem" : "vitrine em montagem");
    return '<a class="cat-tile cat-tile--' + c.slug + (c.ready ? " is-ready" : "") + '" href="#/categoria/' + c.slug + '">' +
      '<span class="cat-tile-name">' + esc(c.name) + "</span>" +
      '<span class="cat-tile-sub">' + sub + "</span>" +
      '<span class="cat-tile-arrow">' + ICON.arrow + "</span>" +
    "</a>";
  }

  function ratingHTML(extraClass) {
    return '<a class="rating ' + (extraClass || "") + '" href="' + MAPS_LINK + '" target="_blank" rel="noopener">' +
      '<span class="stars">' + STARS + "</span>" +
      "<strong>" + STORE.reviews.rating + "</strong>" +
      "<span>no " + STORE.reviews.source + "</span>" +
    "</a>";
  }

  function deliveryInfoHTML() {
    return '<ul class="perks">' +
      "<li>" + ICON.card + "<div><strong>Parcele sua compra</strong><span>em até " + SIM.maxInstallments + "x sem juros no cartão de crédito</span></div></li>" +
      "<li>" + ICON.store + "<div><strong>Retire na loja</strong><span>Grátis · " + SIM.pickup.time + " na " + esc(STORE.address) + "</span></div></li>" +
      "<li>" + ICON.bike + "<div><strong>Entrega em Porto Alegre</strong><span>" + SIM.poa.time + " · grátis acima de " + money(SIM.freePoaFrom) + "</span></div></li>" +
      "<li>" + ICON.box + "<div><strong>Enviamos o seu pedido</strong><span>até a sua casa · " + SIM.ship.time + "</span></div></li>" +
    "</ul>";
  }

  function hoursHTML() {
    return '<div class="hours">' +
      '<div class="hours-head">' + ICON.clock + "<strong>Horário de funcionamento</strong></div>" +
      "<dl>" + STORE.hours.map(function (h) { return "<div><dt>" + esc(h[0]) + "</dt><dd>" + esc(h[1]) + "</dd></div>"; }).join("") + "</dl>" +
    "</div>";
  }

  function visitHTML() {
    return '<section class="section visit" id="visite">' +
      '<div class="wrap">' +
        '<p class="eyebrow">Loja física</p>' +
        '<h2 class="h2">Visite a Banana Verde</h2>' +
        '<div class="visit-grid">' +
          '<div class="visit-info">' +
            '<p class="visit-address">' + ICON.pin + "<span><strong>" + esc(STORE.address) + "</strong><br>" + esc(STORE.district) + "<br><em>Em frente ao parque — é só atravessar a rua.</em></span></p>" +
            hoursHTML() +
            '<p class="visit-phone"><a href="' + TEL + '">' + esc(STORE.phoneDisplay) + "</a></p>" +
            '<div class="visit-actions">' +
              '<a class="btn btn--wa" href="' + waLink("Olá, Banana Verde! Vim pela loja online.") + '" target="_blank" rel="noopener">' + ICON.wa + " WhatsApp</a>" +
              '<a class="btn btn--ghost" href="' + TEL + '">' + ICON.phone + " Ligar</a>" +
              '<a class="btn btn--ghost visit-route" href="' + MAPS_LINK + '" target="_blank" rel="noopener">' + ICON.pin + " Como chegar</a>" +
            "</div>" +
          "</div>" +
          '<div class="map">' +
            '<iframe title="Mapa: Banana Verde, ' + esc(STORE.address) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + MAPS_QUERY + '&z=16&output=embed"></iframe>' +
          "</div>" +
        "</div>" +
      "</div>" +
    "</section>";
  }

  /* ---------------- páginas ---------------- */

  function renderHome() {
    var casa = getCat("casa-ecologica");
    var featured = PRODUCTS.filter(function (p) { return p.featured; });
    return '' +
    '<section class="hero">' +
      '<div class="wrap">' +
        '<p class="eyebrow">Consumo consciente · Porto Alegre</p>' +
        '<h1 class="h1">Produtos ecológicos para o dia a dia. <span>Agora você compra online.</span></h1>' +
        '<p class="lead">Escolha na vitrine, parcele no cartão e retire na loja ou receba em casa.</p>' +
        '<button type="button" class="hero-search" data-action="open-search">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          "<span>Buscar produto: filtro de barro, bucha…</span>" +
        "</button>" +
        ratingHTML("rating--hero") +
        '<div class="hero-ctas">' +
          '<a class="btn btn--primary" href="#/categoria/casa-ecologica">Ver Casa Ecológica</a>' +
          '<a class="btn btn--wa-outline" href="' + waLink("Olá, Banana Verde! Vim pela loja online e quero tirar uma dúvida.") + '" target="_blank" rel="noopener">' + ICON.wa + " WhatsApp</a>" +
        "</div>" +
        '<div class="hero-photo"><img class="hero-img" src="' + esc(imgSrc(STORE.heroPhoto, 1400, 1050)) + '" alt="Produtos ecológicos para a casa"></div>' +
      "</div>" +
    "</section>" +

    '<section class="section section--tight">' +
      '<div class="wrap">' + deliveryInfoHTML() + "</div>" +
    "</section>" +

    '<section class="section">' +
      '<div class="wrap">' +
        '<div class="section-head"><h2 class="h2">Mais vistos</h2><a class="link" href="#/categoria/casa-ecologica">Ver todos</a></div>' +
      "</div>" +
      '<div class="rail-wrap" data-rail-wrap>' +
        '<button type="button" class="rail-arrow rail-arrow--prev" data-action="rail-prev" aria-label="Produtos anteriores" disabled>' + ICON.chevL + "</button>" +
        '<div class="rail" data-rail aria-label="Produtos em destaque">' + featured.map(cardHTML).join("") + "</div>" +
        '<button type="button" class="rail-arrow rail-arrow--next" data-action="rail-next" aria-label="Mais produtos">' + ICON.chevR + "</button>" +
      "</div>" +
    "</section>" +

    '<section class="section">' +
      '<div class="wrap">' +
        '<h2 class="h2">Categorias</h2>' +
        '<div class="cat-grid">' + CATS.map(catTileHTML).join("") + "</div>" +
      "</div>" +
    "</section>" +

    '<section class="section">' +
      '<div class="wrap">' +
        '<div class="how">' +
          '<h2 class="h2">Como comprar</h2>' +
          "<ol>" +
            "<li><span>1</span><div><strong>Escolha</strong>Navegue pelas categorias ou busque o produto.</div></li>" +
            "<li><span>2</span><div><strong>Adicione ao carrinho</strong>Ou toque no WhatsApp do produto e fale direto com a loja.</div></li>" +
            "<li><span>3</span><div><strong>Retire ou receba</strong>Retire na Av. José Bonifácio, 593, ou receba em casa.</div></li>" +
          "</ol>" +
        "</div>" +
      "</div>" +
    "</section>" +

    '<section class="section">' +
      '<div class="wrap two-up">' +
        '<a class="promo promo--gift" href="' + waLink("Olá, Banana Verde! Quero montar um presente até R$ 50.") + '" target="_blank" rel="noopener">' +
          ICON.gift +
          '<div><p class="eyebrow">Kits e presentes</p><strong>Presentes até R$ 50</strong><span>Kits prontos para presentear · monte o seu pelo WhatsApp</span></div>' +
        "</a>" +
        '<a class="promo promo--blog" href="#/produto/filtro-de-barro">' +
          ICON.leaf +
          '<div><p class="eyebrow">Do blog</p><strong>Filtro de barro</strong><span>Leu o artigo? O filtro está aqui na loja, pronto para comprar.</span></div>' +
        "</a>" +
      "</div>" +
    "</section>" +

    '<section class="section reviews">' +
      '<div class="wrap">' +
        '<p class="eyebrow">Quem compra, recomenda</p>' +
        '<div class="reviews-score"><span class="big">' + STORE.reviews.rating + '</span><span class="stars">' + STARS + "</span></div>" +
        "<p>Nota máxima no Google, dada por quem compra na loja.</p>" +
        '<a class="btn btn--ghost" href="' + MAPS_LINK + '" target="_blank" rel="noopener">Ler as avaliações no Google</a>' +
      "</div>" +
    "</section>" +

    visitHTML() +

    '<section class="section">' +
      '<div class="wrap">' +
        '<a class="ig-band" href="' + INSTAGRAM + '" target="_blank" rel="noopener">' +
          ICON.ig + "<div><strong>@" + STORE.instagram + "</strong><span>Novidades, vídeos dos produtos e dicas no Instagram</span></div>" + ICON.arrow +
        "</a>" +
      "</div>" +
    "</section>";
  }

  function renderCategory(slug) {
    var c = getCat(slug);
    if (!c) return renderNotFound();
    var list = productsOf(slug);
    var brands = c.brands.length
      ? '<div class="brands"><span class="brands-label">Marcas parceiras</span>' + c.brands.map(function (b) { return '<span class="chip">' + esc(b) + "</span>"; }).join("") + "</div>"
      : "";
    var grid = list.length ? '<div class="grid">' + list.map(cardHTML).join("") + "</div>" : "";
    var building = !c.ready
      ? '<div class="notice">' +
          (list.length
            ? "<strong>Mais produtos em breve.</strong><p>A vitrine de " + esc(c.name) + " está crescendo. Procura outro item? A loja responde na hora pelo WhatsApp.</p>"
            : "<strong>Vitrine completa em breve.</strong><p>Os produtos desta categoria entram na loja online na próxima etapa. Enquanto isso, a loja responde na hora pelo WhatsApp.</p>") +
          '<a class="btn btn--wa" href="' + waLink("Olá, Banana Verde! Quero ver os produtos de " + c.name + ".") + '" target="_blank" rel="noopener">' + ICON.wa + " Ver produtos de " + esc(c.name) + "</a>" +
        "</div>"
      : "";
    return '' +
    '<section class="page-head">' +
      '<div class="wrap">' +
        '<nav class="crumbs" aria-label="Você está em"><a href="#/">Início</a><span>/</span><span>' + esc(c.name) + "</span></nav>" +
        '<h1 class="h1 h1--page">' + esc(c.name) + "</h1>" +
        '<p class="lead">' + esc(c.intro) + "</p>" +
        (list.length ? '<p class="count">' + list.length + (list.length === 1 ? " produto" : " produtos") + "</p>" : "") +
      "</div>" +
    "</section>" +
    '<section class="section section--flush">' +
      '<div class="wrap">' + grid + building + brands + "</div>" +
    "</section>" +
    '<section class="section">' +
      '<div class="wrap">' +
        '<div class="ask">' +
          "<div><strong>Procurando outro item?</strong><span>Pergunte para a loja — a resposta vem pelo WhatsApp.</span></div>" +
          '<a class="btn btn--wa" href="' + waLink("Olá, Banana Verde! Estou na categoria " + c.name + " da loja online e procuro: ") + '" target="_blank" rel="noopener">' + ICON.wa + " Perguntar</a>" +
        "</div>" +
        deliveryInfoHTML() +
      "</div>" +
    "</section>";
  }

  function renderProduct(slug) {
    var p = getProduct(slug);
    if (!p) return renderNotFound();
    var c = getCat(p.cat);
    var related = productsOf(p.cat).filter(function (x) { return x.slug !== p.slug; });
    return '' +
    '<article class="product">' +
      '<div class="wrap product-grid">' +
        '<nav class="crumbs" aria-label="Você está em"><a href="#/">Início</a><span>/</span><a href="#/categoria/' + c.slug + '">' + esc(c.name) + "</a></nav>" +
        '<div class="product-media">' + photoHTML(p, true) + "</div>" +
        '<div class="product-info">' +
          '<p class="eyebrow">' + esc(c.name) + "</p>" +
          '<h1 class="h1 h1--product">' + esc(p.name) + "</h1>" +
          '<div class="product-price">' + priceHTML(p) + "</div>" +
          '<p class="installments">' + ICON.card + "<span>" + installmentsText(p.price).replace(" no cartão", "") + " no cartão de crédito</span></p>" +
          stockHTML(p) +
          '<p class="product-desc">' + esc(p.desc) + "</p>" +
          '<div class="qty-row">' +
            '<span class="qty-label">Quantidade</span>' +
            '<div class="qty" data-qty-box>' +
              '<button type="button" data-action="qty-dec" aria-label="Diminuir">−</button>' +
              '<output data-qty-value>1</output>' +
              '<button type="button" data-action="qty-inc" aria-label="Aumentar">+</button>' +
            "</div>" +
          "</div>" +
          '<div class="product-ctas">' +
            '<button type="button" class="btn btn--primary btn--block" data-action="add-qty" data-slug="' + p.slug + '">Adicionar ao carrinho</button>' +
            '<a class="btn btn--wa btn--block" data-wa-product="' + p.slug + '" href="' + waProduct(p) + '" target="_blank" rel="noopener">' + ICON.wa + " Comprar pelo WhatsApp</a>" +
          "</div>" +
          '<div class="product-delivery">' +
            "<h2>Como receber</h2>" +
            '<ul class="mini-list">' +
              "<li>" + ICON.store + "<span><strong>Retirar na loja</strong> — grátis, " + SIM.pickup.time + "</span></li>" +
              "<li>" + ICON.bike + "<span><strong>Entrega em Porto Alegre</strong> — " + money(SIM.poa.fee) + ", " + SIM.poa.time + " (grátis acima de " + money(SIM.freePoaFrom) + ")</span></li>" +
              (p.localOnly ? "" : "<li>" + ICON.box + "<span><strong>Envio para a sua casa</strong> — " + money(SIM.ship.fee) + ", " + SIM.ship.time + "</span></li>") +
            "</ul>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</article>" +
    (related.length
      ? '<section class="section">' +
          '<div class="wrap"><div class="section-head"><h2 class="h2">Também em ' + esc(c.name) + '</h2><a class="link" href="#/categoria/' + c.slug + '">Ver todos</a></div></div>' +
          '<div class="rail-wrap" data-rail-wrap>' +
        '<button type="button" class="rail-arrow rail-arrow--prev" data-action="rail-prev" aria-label="Produtos anteriores" disabled>' + ICON.chevL + "</button>" +
        '<div class="rail" data-rail aria-label="Produtos relacionados">' + related.map(cardHTML).join("") + "</div>" +
        '<button type="button" class="rail-arrow rail-arrow--next" data-action="rail-next" aria-label="Mais produtos">' + ICON.chevR + "</button>" +
      "</div>" +
        "</section>"
      : "") +
    '<div class="sticky-buy">' +
      '<div class="sticky-buy-info"><strong>' + esc(p.name) + "</strong>" + priceHTML(p) + "</div>" +
      '<button type="button" class="btn btn--primary" data-action="add-qty" data-slug="' + p.slug + '">Adicionar</button>' +
    "</div>";
  }

  function renderCart() {
    var t = cartTotals();
    if (t.count === 0) {
      return '<section class="page-head"><div class="wrap">' +
        '<h1 class="h1 h1--page">Seu carrinho</h1>' +
        '<div class="empty">' +
          "<p>Seu carrinho está vazio.</p>" +
          '<a class="btn btn--primary" href="#/categoria/casa-ecologica">Ver Casa Ecológica</a>' +
        "</div>" +
      "</div></section>";
    }
    var lines = t.lines.map(function (l) {
      return '<li class="line">' +
        '<a class="line-media" href="#/produto/' + l.p.slug + '">' + photoHTML(l.p) + "</a>" +
        '<div class="line-body">' +
          '<a class="line-title" href="#/produto/' + l.p.slug + '">' + esc(l.p.name) + "</a>" +
          '<span class="line-unit">Unitário: ' + priceHTML(l.p) + "</span>" +
          '<div class="line-controls">' +
            '<div class="qty qty--sm">' +
              '<button type="button" data-action="cart-dec" data-slug="' + l.p.slug + '" aria-label="Diminuir">−</button>' +
              "<output>" + l.qty + "</output>" +
              '<button type="button" data-action="cart-inc" data-slug="' + l.p.slug + '" aria-label="Aumentar">+</button>' +
            "</div>" +
            '<button type="button" class="icon-btn icon-btn--sm" data-action="cart-remove" data-slug="' + l.p.slug + '" aria-label="Remover ' + esc(l.p.name) + '">' + ICON.trash + "</button>" +
          "</div>" +
        "</div>" +
        '<span class="line-total">' + (l.line === null ? tbc() : money(l.line)) + "</span>" +
      "</li>";
    }).join("");
    return '' +
    '<section class="page-head"><div class="wrap">' +
      '<h1 class="h1 h1--page">Seu carrinho</h1>' +
      '<p class="count">' + t.count + (t.count === 1 ? " item" : " itens") + "</p>" +
    "</div></section>" +
    '<section class="section section--flush"><div class="wrap cart-grid">' +
      '<ul class="lines">' + lines + "</ul>" +
      '<aside class="summary">' +
        '<div class="summary-row"><span>Itens</span><span>' + t.count + "</span></div>" +
        '<div class="summary-row"><span>Subtotal</span><span>' + totalHTML(t) + "</span></div>" +
        '<div class="summary-row"><span>Entrega</span><span>escolha no próximo passo</span></div>' +
        '<div class="summary-row summary-row--total"><span>Total</span><span>' + totalHTML(t) + "</span></div>" +
        '<p class="installments">' + ICON.card + "<span>" + installmentsText(t.subtotal) + "</span></p>" +
        '<a class="btn btn--primary btn--block" href="#/checkout">Finalizar compra</a>' +
        '<a class="btn btn--wa-outline btn--block" href="' + waLink(cartMessage(t)) + '" target="_blank" rel="noopener">' + ICON.wa + " Enviar carrinho pelo WhatsApp</a>" +
        '<a class="link center" href="#/categoria/casa-ecologica">Continuar comprando</a>' +
      "</aside>" +
    "</div></section>";
  }

  function cartMessage(t, extra) {
    var msg = "Olá, Banana Verde! Quero fazer este pedido pela loja online:\n";
    t.lines.forEach(function (l) { msg += "• " + l.qty + "x " + l.p.name + "\n"; });
    if (extra) msg += extra;
    return msg;
  }

  var checkoutState = { name: "", phone: "", email: "", delivery: "retirada", cep: "", street: "", number: "", complement: "", pay: "pix" };

  function renderCheckout() {
    var t = cartTotals();
    if (t.count === 0) { location.hash = "#/carrinho"; return ""; }
    var s = checkoutState;
    var localOnly = t.lines.some(function (l) { return l.p.localOnly; });
    if (localOnly && s.delivery === "envio") s.delivery = "retirada";
    function opt(val, icon, title, sub, disabled) {
      return '<label class="option' + (disabled ? " is-disabled" : "") + '">' +
        '<input type="radio" name="delivery" value="' + val + '"' + (s.delivery === val ? " checked" : "") + (disabled ? " disabled" : "") + ">" +
        '<span class="option-box">' + icon + "<span><strong>" + title + "</strong><small>" + sub + "</small></span></span>" +
      "</label>";
    }
    return '' +
    '<section class="page-head"><div class="wrap">' +
      '<nav class="crumbs"><a href="#/carrinho">' + ICON.back + " Carrinho</a></nav>" +
      '<h1 class="h1 h1--page">Finalizar compra</h1>' +
    "</div></section>" +
    '<section class="section section--flush"><div class="wrap cart-grid">' +
      '<form class="checkout" data-checkout novalidate>' +
        '<fieldset class="step"><legend><span>1</span> Seus dados</legend>' +
          '<label class="field"><span>Nome</span><input name="name" autocomplete="name" required value="' + esc(s.name) + '"></label>' +
          '<label class="field"><span>WhatsApp</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(51) 9…" required value="' + esc(s.phone) + '"></label>' +
          '<label class="field"><span>E-mail <em>(opcional)</em></span><input name="email" type="email" autocomplete="email" value="' + esc(s.email) + '"></label>' +
        "</fieldset>" +
        '<fieldset class="step"><legend><span>2</span> Como receber</legend>' +
          opt("retirada", ICON.store, "Retirar na loja · Grátis", esc(STORE.address) + " · " + SIM.pickup.time) +
          opt("poa", ICON.bike, "Entrega em Porto Alegre · " + feeText(deliveryFee("poa", t.subtotal)), SIM.poa.time + " · grátis acima de " + money(SIM.freePoaFrom)) +
          opt("envio", ICON.box, "Envio para o meu endereço · " + money(SIM.ship.fee),
            localOnly ? "Indisponível: picolé congelado sai só para retirada ou entrega em Porto Alegre" : SIM.ship.time, localOnly) +
          '<div class="address" data-cep-field' + (s.delivery === "retirada" ? " hidden" : "") + ">" +
            '<label class="field"><span>CEP</span><input name="cep" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9" value="' + esc(s.cep) + '"></label>' +
            '<label class="field"><span>Rua</span><input name="street" autocomplete="address-line1" value="' + esc(s.street) + '"></label>' +
            '<div class="field-row">' +
              '<label class="field"><span>Número</span><input name="number" inputmode="numeric" value="' + esc(s.number) + '"></label>' +
              '<label class="field"><span>Complemento <em>(opcional)</em></span><input name="complement" autocomplete="address-line2" value="' + esc(s.complement) + '"></label>' +
            "</div>" +
          "</div>" +
        "</fieldset>" +
        '<fieldset class="step"><legend><span>3</span> Pagamento</legend>' +
          '<label class="option"><input type="radio" name="pay" value="pix"' + (s.pay === "pix" ? " checked" : "") + '><span class="option-box">' + ICON.pix + "<span><strong>Pix</strong><small>aprovação na hora · QR Code ou copia e cola</small></span></span></label>" +
          '<label class="option"><input type="radio" name="pay" value="cartao"' + (s.pay === "cartao" ? " checked" : "") + '><span class="option-box">' + ICON.card + '<span><strong>Cartão de crédito</strong><small data-co-installments>' + installmentsOptions(t) + "</small></span></span></label>" +
          '<div class="pay-secure">' + ICON.lock + "<p>Você paga em ambiente seguro na próxima etapa. Seus dados de pagamento não passam por este formulário.</p></div>" +
        "</fieldset>" +
        '<p class="form-error" data-form-error hidden>Preencha o seu nome e WhatsApp para continuar.</p>' +
        '<button type="submit" class="btn btn--primary btn--block">Finalizar pedido</button>' +
      "</form>" +
      '<aside class="summary" data-co-summary>' + checkoutSummaryHTML(t) + "</aside>" +
    "</div></section>";
  }

  function checkoutTotal(t) {
    var fee = deliveryFee(checkoutState.delivery, t.subtotal, checkoutState.cep);
    return { fee: fee, total: Math.round((t.subtotal + (fee || 0)) * 100) / 100 };
  }
  function installmentsOptions(t) {
    var n = installmentsCount(checkoutTotal(t).total);
    return n < 2 ? "à vista" : "em até " + installmentsText(checkoutTotal(t).total);
  }
  function checkoutSummaryHTML(t) {
    var ct = checkoutTotal(t);
    return "<h2>Resumo</h2>" +
      t.lines.map(function (l) {
        return '<div class="summary-row"><span>' + l.qty + "× " + esc(l.p.name) + "</span><span>" + money(l.line) + "</span></div>";
      }).join("") +
      '<div class="summary-row"><span>Subtotal</span><span>' + money(t.subtotal) + "</span></div>" +
      '<div class="summary-row"><span>Entrega</span><span>' + feeText(ct.fee) + "</span></div>" +
      '<div class="summary-row summary-row--total"><span>Total</span><span>' + money(ct.total) + "</span></div>" +
      '<p class="installments">' + (checkoutState.pay === "pix" ? ICON.pix + "<span>Pix · aprovação na hora</span>" : ICON.card + "<span>" + installmentsText(ct.total) + "</span>") + "</p>";
  }
  function refreshCheckoutSummary() {
    var t = cartTotals();
    var el = document.querySelector("[data-co-summary]");
    if (el) el.innerHTML = checkoutSummaryHTML(t);
    var inst = document.querySelector("[data-co-installments]");
    if (inst) inst.innerHTML = installmentsOptions(t);
  }

  var lastOrder = null;

  function renderOrder() {
    if (!lastOrder) { location.hash = "#/"; return ""; }
    var o = lastOrder;
    var deliveryLabel = { retirada: "Retirar na loja (" + STORE.address + ")", poa: "Entrega em Porto Alegre", envio: "Envio para o endereço" }[o.delivery];
    var extra = "\nNome: " + o.name + "\nWhatsApp: " + o.phone +
      (o.email ? "\nE-mail: " + o.email : "") +
      "\nRecebimento: " + deliveryLabel + (o.address ? "\nEndereço: " + o.address : "") + (o.cep ? " · CEP " + o.cep : "") +
      "\nEntrega: " + feeText(o.fee) + "\nTotal: " + money(o.total) +
      "\nPagamento: " + (o.pay === "pix" ? "Pix" : "cartão de crédito, " + installmentsText(o.total));
    return '' +
    '<section class="page-head"><div class="wrap order-done">' +
      '<span class="done-icon">' + ICON.check + "</span>" +
      '<h1 class="h1 h1--page">Pedido montado, ' + esc(o.name.split(" ")[0]) + "!</h1>" +
      '<p class="lead">Recebemos o seu pedido. A Banana Verde confirma tudo pelo WhatsApp.</p><p class="small muted">Demonstração: nada foi cobrado.</p>' +
      '<div class="summary">' +
        o.totals.lines.map(function (l) {
          return '<div class="summary-row"><span>' + l.qty + "× " + esc(l.p.name) + "</span><span>" + (l.line === null ? tbc() : money(l.line)) + "</span></div>";
        }).join("") +
        '<div class="summary-row"><span>Recebimento</span><span>' + esc(deliveryLabel) + "</span></div>" +
        '<div class="summary-row"><span>Entrega</span><span>' + feeText(o.fee) + "</span></div>" +
        '<div class="summary-row"><span>Pagamento</span><span>' + (o.pay === "pix" ? "Pix" : "Cartão · " + installmentsText(o.total, true)) + "</span></div>" +
        '<div class="summary-row summary-row--total"><span>Total</span><span>' + money(o.total) + "</span></div>" +
      "</div>" +
      '<a class="btn btn--wa btn--block" href="' + waLink(cartMessage(o.totals, extra)) + '" target="_blank" rel="noopener">' + ICON.wa + " Enviar este pedido pelo WhatsApp</a>" +
      '<a class="btn btn--ghost btn--block" href="#/">Voltar ao início</a>' +
    "</div></section>";
  }

  function renderNotFound() {
    return '<section class="page-head"><div class="wrap"><h1 class="h1 h1--page">Página não encontrada</h1>' +
      '<p class="lead">Talvez o produto tenha mudado de lugar.</p><a class="btn btn--primary" href="#/">Ir para o início</a></div></section>';
  }

  /* ---------------- shell: nav de categorias e rodapé ---------------- */

  function renderShell() {
    document.querySelector("[data-cat-nav]").innerHTML =
      '<div class="cat-nav-inner">' +
        CATS.map(function (c) { return '<a href="#/categoria/' + c.slug + '" data-cat-link="' + c.slug + '">' + esc(c.name) + "</a>"; }).join("") +
      "</div>";

    document.querySelector("[data-footer]").innerHTML =
      '<div class="wrap footer-grid">' +
        "<div>" +
          '<p class="footer-brand">Banana Verde</p>' +
          '<p class="footer-tag">Cuidar do planeta e mudar as coisas nos interessa mais.</p>' +
          ratingHTML("rating--footer") +
        "</div>" +
        "<div>" +
          "<h2>Categorias</h2>" +
          "<ul>" + CATS.map(function (c) { return '<li><a href="#/categoria/' + c.slug + '">' + esc(c.name) + "</a></li>"; }).join("") + "</ul>" +
        "</div>" +
        "<div>" +
          "<h2>Contato</h2>" +
          "<ul>" +
            "<li>" + esc(STORE.address) + "<br>" + esc(STORE.district) + "</li>" +
            '<li><a href="' + TEL + '">Telefone ' + esc(STORE.phoneDisplay) + "</a></li>" +
            '<li><a href="' + waLink("Olá, Banana Verde!") + '" target="_blank" rel="noopener">WhatsApp</a></li>' +
            '<li><a href="' + INSTAGRAM + '" target="_blank" rel="noopener">Instagram @' + STORE.instagram + "</a></li>" +
          "</ul>" +
        "</div>" +
      "</div>" +
      '<p class="footer-note wrap">Demonstração Femik · fotos ilustrativas e preços simulados</p>';

    document.querySelector("[data-wa-float]").href = waLink("Olá, Banana Verde! Vim pela loja online.");
  }

  /* ---------------- roteador ---------------- */

  function route() {
    var hash = location.hash.replace(/^#/, "") || "/";
    var parts = hash.split("/").filter(Boolean);
    var html, title = "Banana Verde — Loja online", activeCat = null, page = "home";

    if (parts.length === 0) {
      html = renderHome();
    } else if (parts[0] === "categoria" && parts[1]) {
      html = renderCategory(parts[1]); activeCat = parts[1]; page = "category";
      var c = getCat(parts[1]); if (c) title = c.name + " — Banana Verde";
    } else if (parts[0] === "produto" && parts[1]) {
      html = renderProduct(parts[1]); page = "product";
      var p = getProduct(parts[1]); if (p) { title = p.name + " — Banana Verde"; activeCat = p.cat; }
    } else if (parts[0] === "carrinho") {
      html = renderCart(); page = "cart"; title = "Carrinho — Banana Verde";
    } else if (parts[0] === "checkout") {
      html = renderCheckout(); page = "checkout"; title = "Finalizar compra — Banana Verde";
    } else if (parts[0] === "pedido") {
      html = renderOrder(); page = "order"; title = "Pedido — Banana Verde";
    } else {
      html = renderNotFound();
    }
    if (html === "") return; // redirecionou

    app.innerHTML = html;
    document.body.setAttribute("data-page", page);
    document.title = title;
    document.querySelectorAll("[data-cat-link]").forEach(function (a) {
      var on = a.getAttribute("data-cat-link") === activeCat;
      a.classList.toggle("is-active", on);
      if (on && a.scrollIntoView) {
        var nav = a.parentElement;
        nav.scrollLeft = a.offsetLeft - 16;
      }
    });
    closeSearch();
    clearTimeout(toastTimer); toastEl.classList.remove("show"); toastEl.hidden = true;
    window.scrollTo(0, 0);
    onScroll();
    updateRails();
    markLoaded();
    updateBadge();
  }

  /* ---------------- busca ---------------- */

  var searchEl = document.querySelector("[data-search]");
  var searchInput = document.querySelector("[data-search-input]");
  var searchResults = document.querySelector("[data-search-results]");

  function openSearch() {
    searchEl.hidden = false;
    document.body.classList.add("no-scroll");
    renderSearch("");
    searchInput.value = "";
    setTimeout(function () { searchInput.focus(); }, 30);
  }
  function closeSearch() {
    if (searchEl.hidden) return;
    searchEl.hidden = true;
    document.body.classList.remove("no-scroll");
  }
  function searchProducts(q) {
    var nq = norm(q);
    if (!nq) return [];
    var words = nq.split(/\s+/);
    return PRODUCTS.filter(function (p) {
      var hay = norm(p.name + " " + getCat(p.cat).name);
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
  }
  window.BV_search = searchProducts; // exposto para testes

  function resultRow(p) {
    return '<a class="result" href="#/produto/' + p.slug + '">' +
      '<span class="result-thumb ph--' + esc(p.tone) + '">' + ICON.leaf + (p.photo ? '<img class="ph-img" src="' + esc(imgSrc(p.photo, 120, 120)) + '" alt="">' : "") + "</span>" +
      '<span class="result-text"><strong>' + esc(p.name) + "</strong><small>" + esc(getCat(p.cat).name) + "</small></span>" +
      priceHTML(p) +
    "</a>";
  }

  function renderSearch(q) {
    var nq = norm(q);
    if (!nq) {
      searchResults.innerHTML =
        '<p class="search-label">Mais vistos</p>' +
        '<div class="chips">' + PRODUCTS.filter(function (p) { return p.featured; }).map(function (p) {
          return '<button type="button" class="chip chip--btn" data-action="search-suggest" data-q="' + esc(p.name) + '">' + esc(p.name) + "</button>";
        }).join("") + "</div>" +
        '<p class="search-label">Categorias</p>' +
        '<div class="search-cats">' + CATS.map(function (c) { return '<a href="#/categoria/' + c.slug + '">' + esc(c.name) + "</a>"; }).join("") + "</div>";
      return;
    }
    var found = searchProducts(q);
    var cats = CATS.filter(function (c) { return norm(c.name).indexOf(nq) !== -1; });
    var html = "";
    if (found.length) {
      html += '<p class="search-label">' + found.length + (found.length === 1 ? " produto" : " produtos") + "</p>" + found.map(resultRow).join("");
    }
    if (cats.length) {
      html += '<p class="search-label">Categorias</p><div class="search-cats">' + cats.map(function (c) { return '<a href="#/categoria/' + c.slug + '">' + esc(c.name) + "</a>"; }).join("") + "</div>";
    }
    if (!found.length && !cats.length) {
      html = '<div class="search-empty">' +
        "<p>Ainda não encontramos <strong>“" + esc(q) + "”</strong> na vitrine online.</p>" +
        '<a class="btn btn--wa" href="' + waLink("Olá, Banana Verde! Vocês têm " + q + "?") + '" target="_blank" rel="noopener">' + ICON.wa + " Perguntar se tem “" + esc(q) + "”</a>" +
      "</div>";
    }
    searchResults.innerHTML = html;
  }

  searchInput.addEventListener("input", function () { renderSearch(searchInput.value); });
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var first = searchResults.querySelector(".result");
      if (first) { location.hash = first.getAttribute("href"); }
    }
  });
  searchEl.addEventListener("click", function (e) {
    if (e.target === searchEl) closeSearch();
  });

  /* ---------------- eventos (delegação) ---------------- */

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) {
      // clique num link de resultado da busca: fecha o painel mesmo se o hash não mudar
      if (e.target.closest(".search-results a[href^='#']")) closeSearch();
      return;
    }
    var action = el.getAttribute("data-action");
    var slug = el.getAttribute("data-slug");
    var p, qtyEl, q;

    switch (action) {
      case "open-search": openSearch(); break;
      case "close-search": closeSearch(); break;
      case "search-suggest":
        searchInput.value = el.getAttribute("data-q");
        renderSearch(searchInput.value);
        break;
      case "add":
        p = getProduct(slug); addToCart(slug, 1);
        toast(ICON.check + " <span><strong>" + esc(p.name) + '</strong> no carrinho</span><a href="#/carrinho">Ver</a>');
        break;
      case "qty-dec":
      case "qty-inc":
        qtyEl = document.querySelector("[data-qty-value]");
        q = parseInt(qtyEl.textContent, 10) || 1;
        q = action === "qty-inc" ? Math.min(99, q + 1) : Math.max(1, q - 1);
        qtyEl.textContent = q;
        var waBtn = document.querySelector("[data-wa-product]");
        if (waBtn) waBtn.href = waProduct(getProduct(waBtn.getAttribute("data-wa-product")), q);
        break;
      case "add-qty":
        p = getProduct(slug);
        qtyEl = document.querySelector("[data-qty-value]");
        q = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
        addToCart(slug, q);
        toast(ICON.check + " <span><strong>" + q + "× " + esc(p.name) + '</strong> no carrinho</span><a href="#/carrinho">Ver</a>');
        break;
      case "rail-prev":
      case "rail-next":
        var r = el.parentNode.querySelector("[data-rail]");
        r.scrollBy({ left: (action === "rail-next" ? 1 : -1) * r.clientWidth * 0.8, behavior: "smooth" });
        break;
      case "cart-inc": setQty(slug, (cart[slug] || 0) + 1); route(); break;
      case "cart-dec": setQty(slug, (cart[slug] || 0) - 1); route(); break;
      case "cart-remove": setQty(slug, 0); route(); break;
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target.name === "delivery") {
      checkoutState.delivery = e.target.value;
      var cep = document.querySelector("[data-cep-field]");
      if (cep) cep.hidden = e.target.value === "retirada";
      refreshCheckoutSummary();
    }
    if (e.target.name === "pay") { checkoutState.pay = e.target.value; refreshCheckoutSummary(); }
  });

  document.addEventListener("input", function (e) {
    var f = e.target.closest("[data-checkout]");
    if (!f) return;
    if (e.target.name === "cep") {
      var d = e.target.value.replace(/\D/g, "").slice(0, 8);
      e.target.value = d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
    }
    if (e.target.name in checkoutState) checkoutState[e.target.name] = e.target.value;
    if (e.target.name === "cep") refreshCheckoutSummary();
  });

  document.addEventListener("submit", function (e) {
    var f = e.target.closest("[data-checkout]");
    if (!f) return;
    e.preventDefault();
    var data = new FormData(f);
    var name = String(data.get("name") || "").trim();
    var phone = String(data.get("phone") || "").trim();
    var err = f.querySelector("[data-form-error]");
    if (!name || phone.replace(/\D/g, "").length < 8) {
      err.hidden = false;
      (name ? f.querySelector("[name=phone]") : f.querySelector("[name=name]")).focus();
      return;
    }
    var delivery = String(data.get("delivery") || "retirada");
    if (delivery !== "retirada") {
      var miss = ["cep", "street", "number"].filter(function (k) {
        var v = String(data.get(k) || "").trim();
        return k === "cep" ? v.replace(/\D/g, "").length !== 8 : !v;
      });
      if (miss.length) {
        err.textContent = "Preencha CEP, rua e número para a entrega.";
        err.hidden = false; f.querySelector("[name=" + miss[0] + "]").focus(); return;
      }
    }
    err.hidden = true;
    lastOrder = {
      name: name, phone: phone, email: String(data.get("email") || "").trim(),
      delivery: String(data.get("delivery") || "retirada"),
      cep: delivery === "retirada" ? "" : String(data.get("cep") || "").trim(),
      address: delivery === "retirada" ? "" : [data.get("street"), data.get("number"), data.get("complement")].map(function (v) { return String(v || "").trim(); }).filter(Boolean).join(", "),
      pay: String(data.get("pay") || "pix"),
      totals: cartTotals()
    };
    var ctOrder = checkoutTotal(lastOrder.totals);
    lastOrder.fee = ctOrder.fee; lastOrder.total = ctOrder.total;
    cart = {}; saveCart();
    location.hash = "#/pedido";
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
  });

  function markLoaded() {
    document.querySelectorAll("img.ph-img, img.hero-img").forEach(function (i) { if (i.complete && i.naturalWidth) i.classList.add("is-loaded"); });
  }
  document.addEventListener("load", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG") t.classList.add("is-loaded");
  }, true);

  // foto que não carrega: remove a imagem e deixa a ilustração
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (!t || t.tagName !== "IMG") return;
    if (t.classList.contains("hero-img")) t.parentNode.remove();
    else if (t.classList.contains("ph-img")) { t.parentNode.classList.add("ph--fallback"); t.remove(); }
  }, true);

  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });

  // setas do carrossel: some a seta quando chega no começo/fim
  function updateRails() {
    document.querySelectorAll("[data-rail-wrap]").forEach(function (w) {
      var r = w.querySelector("[data-rail]");
      var max = r.scrollWidth - r.clientWidth - 4;
      w.querySelector(".rail-arrow--prev").disabled = r.scrollLeft <= 4;
      w.querySelector(".rail-arrow--next").disabled = r.scrollLeft >= max;
      w.classList.toggle("at-end", r.scrollLeft >= max);
      w.classList.toggle("at-start", r.scrollLeft <= 4);
    });
  }
  document.addEventListener("scroll", function (e) {
    if (e.target && e.target.matches && e.target.matches("[data-rail]")) updateRails();
  }, true);
  window.addEventListener("resize", updateRails);

  window.addEventListener("hashchange", route);

  renderShell();
  route();
})();
