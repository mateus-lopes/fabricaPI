<script setup lang="ts">
const base = import.meta.env.BASE_URL
</script>

<template>
  <a class="pular" href="#conteudo">Ir para o conteúdo</a>

  <header class="cabecalho">
    <div class="container cabecalho__interno">
      <RouterLink to="/" class="marca">
        <img :src="`${base}marca/logo-ifc.png`" alt="Instituto Federal Catarinense" class="marca__logo" />
        <span class="marca__sistema">
          <strong>Censo Interno</strong>
          <span>Indicadores de desempenho educacional</span>
        </span>
      </RouterLink>
    </div>
  </header>

  <nav class="menu" aria-label="Menu principal">
    <div class="container menu__interno">
      <RouterLink to="/">Carregar arquivos</RouterLink>
      <RouterLink to="/relatorio">Relatório</RouterLink>
    </div>
  </nav>

  <main id="conteudo" class="container conteudo">
    <RouterView />
  </main>

  <footer class="rodape">
    <div class="container rodape__interno">
      <img :src="`${base}marca/logo-fabrica.png`" alt="Fábrica de Software" class="rodape__logo" />
      <p>
        Ferramenta desenvolvida na Fábrica de Software do IFC <em>Campus</em> Araquari.<br />
        Os arquivos são processados somente no seu navegador e não são enviados a nenhum servidor.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.pular {
  position: absolute;
  left: -9999px;
}

.pular:focus {
  left: 1rem;
  top: 1rem;
  z-index: 10;
  background: #fff;
  padding: 0.5rem;
}

.cabecalho {
  background: linear-gradient(180deg, var(--verde-cabecalho-2), var(--verde-cabecalho-1));
  color: #fff;
}

.cabecalho__interno {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.marca {
  display: inline-flex;
  align-items: center;
  gap: 1.25rem;
  color: #fff;
  text-decoration: none;
  flex-wrap: wrap;
}

.marca__logo {
  height: 56px;
  /* O logo do repositório é colorido; no cabeçalho verde o portal usa a versão branca. */
  filter: brightness(0) invert(1);
}

.marca__sistema {
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgb(255 255 255 / 0.5);
  padding-left: 1.25rem;
}

.marca__sistema strong {
  font-size: 1.5rem;
  line-height: 1.2;
}

.menu {
  background: var(--verde-escuro);
}

.menu__interno {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.menu a {
  color: #fff;
  text-decoration: none;
  padding: 0.55rem 0.8rem;
  border-left: 1px solid rgb(255 255 255 / 0.2);
}

.menu a:first-child {
  border-left: none;
}

.menu a.router-link-exact-active {
  background: var(--verde-mais-escuro);
  font-weight: 600;
}

.conteudo {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
  min-height: 60vh;
}

.rodape {
  background: var(--verde-escuro);
  color: #fff;
}

.rodape__interno {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.rodape__logo {
  height: 48px;
}

.rodape p {
  margin: 0;
  font-size: 0.85rem;
}

@media (max-width: 560px) {
  .marca__sistema {
    border-left: none;
    padding-left: 0;
  }

  .rodape__interno {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
