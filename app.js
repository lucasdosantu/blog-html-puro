const POSTS_POR_PAGINA = 10;
let listaPosts = [];

const app = document.getElementById("app");

async function iniciar() {
  try {
    const res = await fetch("posts.json");
    listaPosts = await res.json();

    window.addEventListener("hashchange", roteador);
    roteador();
  } catch (err) {
    app.innerHTML = "<p>Erro ao carregar a lista de posts.</p>";
    console.error(err);
  }
}

function roteador() {
  const hash = window.location.hash;

  if (hash.startsWith("#/post/")) {
    const slug = hash.replace("#/post/", "");
    renderizarPostIndividual(slug);
  } else if (hash.startsWith("#/pagina/")) {
    const numPagina = parseInt(hash.replace("#/pagina/", ""), 10) || 1;
    renderizarListaPosts(numPagina);
  } else {
    renderizarListaPosts(1);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderizarListaPosts(pagina) {
  const totalPaginas = Math.ceil(listaPosts.length / POSTS_POR_PAGINA) || 1;
  const paginaAtual = Math.max(1, Math.min(pagina, totalPaginas));

  const inicio = (paginaAtual - 1) * POSTS_POR_PAGINA;
  const fim = inicio + POSTS_POR_PAGINA;
  const postsPagina = listaPosts.slice(inicio, fim);

  document.title = "Meu Blog";

  let html = '<section class="lista-posts">';

  if (postsPagina.length === 0) {
    html += "<p>Nenhum post encontrado.</p>";
  } else {
    postsPagina.forEach((post) => {
      html += `
        <article class="card-post">
          <h2><a href="#/post/${post.slug}">${post.title}</a></h2>
          <small>🗓️ ${post.date}</small>
          <p>${post.summary}</p>
          <a href="#/post/${post.slug}" class="btn-ler">Ler artigo completo →</a>
        </article>
      `;
    });
  }

  html += "</section>";

  html += `
    <nav class="paginacao">
      ${
        paginaAtual > 1
          ? `<a href="#/pagina/${paginaAtual - 1}" class="btn">← Anterior</a>`
          : '<span class="btn disabled">← Anterior</span>'
      }
      
      <span>Página ${paginaAtual} de ${totalPaginas}</span>
      
      ${
        paginaAtual < totalPaginas
          ? `<a href="#/pagina/${paginaAtual + 1}" class="btn">Próxima →</a>`
          : '<span class="btn disabled">Próxima →</span>'
      }
    </nav>
  `;

  app.innerHTML = html;
}

async function renderizarPostIndividual(slug) {
  app.innerHTML = "<p>Carregando artigo...</p>";

  const metaPost = listaPosts.find((p) => p.slug === slug);

  try {
    const res = await fetch(`./posts/${slug}.md`);

    if (!res.ok) throw new Error("Post não encontrado");

    const markdownText = await res.text();
    const htmlConteudo = marked.parse(markdownText);

    document.title = metaPost
      ? `${metaPost.title} - Meu Blog`
      : "Artigo - Meu Blog";

    app.innerHTML = `
      <article class="post-completo">
        <header class="header-post">
          <a href="#" class="btn-voltar">← Voltar para a lista</a>
          ${metaPost ? `<br><small>Publicado em: ${metaPost.date}</small>` : ""}
        </header>
        <hr>
        <div class="conteudo-markdown">
          ${htmlConteudo}
        </div>
      </article>
    `;
  } catch (err) {
    document.title = "Post não encontrado";
    app.innerHTML = `
      <div class="card-post">
        <h2>404 - Post não encontrado</h2>
        <p>O artigo que você procura não existe.</p>
        <a href="#" class="btn-voltar">← Voltar para o início</a>
      </div>
    `;
  }
}

iniciar();
