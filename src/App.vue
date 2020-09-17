<template>
  <div id="app">
    <input
      @input="debouncePesquisa"
      type="text"
      placeholder="Pesquisa por nome..."
    />
    <a @click="mudarEstiloLista()" class="btn-mais linkStl01">
      <span>{{ estilo == "card" ? "Lista" : "Card" }}</span>
    </a>
    <a @click="mudarSortMode()" class="btn-mais linkStl01">
      <span>{{
        sortMode == "sizeDesc" ? "Tamanho Crescente" : "Tamanho Decrescente"
      }}</span>
    </a>
    <a @click="mudarSortModeNome()" class="btn-mais linkStl01">
      <span>{{
        sortMode == "nomeDesc" ? "Nome Crescente" : "Nome Decrescente"
      }}</span>
    </a>
    <div id="paginacao">
      <a
        href="#"
        class="linkStl01 verde"
        v-for="pagina in paginas"
        :key="pagina"
      >
        <button
          :disabled="paginaAtual == pagina"
          @click.prevent="mudarPagina(pagina)"
        >
          {{ pagina }}
        </button>
      </a>
    </div>
    <div class="documentos">
      <div
        class="container"
        v-for="documento in documentosFiltrados"
        :key="documento.ID"
      >
        <div class="boxDestaque01 destaqueStl03 card" v-if="estilo == 'card'">
          <div class="card-header">
            <h1>{{ documento[categoria] }}</h1>
          </div>
          <div class="card-content">
            <p>{{ documento.Title }}</p>
            <p>
              <a
                :href="documento.File.ServerRelativeUrl"
                :title="documento.File.Name"
                target="_blank"
                style="display: block;"
                class="btnDownload bgVerde linkStl01"
                >Fazer Download ({{ toMB(documento.File.Length) }})</a
              >
            </p>
          </div>
          <div class="card-footer">
            <h2>{{ documento[subcategoria] }}</h2>
          </div>
        </div>
        <ul v-if="estilo == 'lista'">
          <li>
            <a
              :href="documento.File.ServerRelativeUrl"
              :title="documento.File.Name"
              target="_blank"
              class="linkStl01"
              >{{ documento.Title }} ({{ toMB(documento.File.Length) }})</a
            >
          </li>
        </ul>
      </div>
    </div>
    <div id="paginacao" v-if="estilo != 'lista'">
      <a
        href="#"
        class="linkStl01 verde"
        v-for="pagina in paginas"
        :key="pagina"
      >
        <button
          :disabled="paginaAtual == pagina"
          @click.prevent="mudarPagina(pagina)"
        >
          {{ pagina }}
        </button>
      </a>
    </div>
  </div>
</template>
<script lang="ts">
function compare(a: any, b: any) {
  if (a.ID < b.ID) return -1;
  if (a.ID > b.ID) return 1;
  return 0;
}
function sizeDesc(a: any, b: any) {
  if (parseInt(a.File.Length) < parseInt(b.File.Length)) return 1;
  if (parseInt(a.File.Length) > parseInt(b.File.Length)) return -1;
  return 0;
}
function sizeAsc(a: any, b: any) {
  if (parseInt(a.File.Length) < parseInt(b.File.Length)) return -1;
  if (parseInt(a.File.Length) > parseInt(b.File.Length)) return 1;
  return 0;
}
function nomeDesc(a: any, b: any) {
  return b.Title.trim().localeCompare(a.Title.trim());
}
function nomeAsc(a: any, b: any) {
  return a.Title.trim().localeCompare(b.Title.trim());
}

import Vue from "vue";
import debounce from "debounce";

export default Vue.extend({
  data() {
    return {
      pesquisa: "",
      sortMode: "compare",
      smin: 0,
      smax: 10,
      paginas: this.$root.$data.paginas,
      paginaAtual: 1,
      paginaAnteriorPesquisa: 1,
      categoria: "Abrangencia",
      subcategoria: "Elementos",
      estilo: this.$root.$data.estilo,
      tituloLista: this.$root.$data.tituloLista
    };
  },
  computed: {
    documentosFiltrados() {
      let inicio = 1;
      const arrayPaginas = [];

      const arrayFiltrada = (this.$root.$data.documentos as Array<any>)
        .filter(documento => {
          return documento.Title.toLowerCase().includes(
            (this as any).pesquisa.toLowerCase()
          );
        })
        .sort(eval((this as any).sortMode));

      const total = arrayFiltrada.length / 10;
      while (inicio <= total) {
        arrayPaginas.push(inicio);
        inicio++;
      }
      (this as any).paginas = arrayPaginas;

      return arrayFiltrada.slice((this as any).smin, (this as any).smax);
    }
  },
  methods: {
    debouncePesquisa: debounce(function(e: Event) {
      const termo = (e.target as HTMLInputElement).value;
      (this as any).pesquisa = termo;
      if (termo.length > 0) {
        (this as any).paginaAnteriorPesquisa = (this as any).paginaAtual;
        (this as any).mudarPagina(1);
      } else {
        (this as any).mudarPagina((this as any).paginaAnteriorPesquisa);
        (this as any).paginaAnteriorPesquisa = 1;
      }
    }, 500),
    toMB(bytes: number, decimals = 2) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    },
    mudarEstiloLista() {
      (this as any).estilo = this.estilo == "card" ? "lista" : "card";
    },
    mudarSortMode() {
      (this as any).sortMode =
        this.sortMode == "sizeAsc" ? "sizeDesc" : "sizeAsc";
    },
    mudarSortModeNome() {
      (this as any).sortMode =
        this.sortMode == "nomeAsc" ? "nomeDesc" : "nomeAsc";
    },
    mudarPagina(pagina = 1) {
      (this as any).paginaAtual = pagina;
      (this as any).smin = this.paginaAtual * 10 - 10;
      (this as any).smax = this.paginaAtual * 10;
    }
  }
});
</script>
<style lang="scss" scoped>
.cContent #contentBox #new-layouts #app {
  .documentos {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    .container {
      width: 49%;
      margin: 30px 0;
      .card {
        background: #7ac042;
        width: 100%;
        margin: 0;
        box-sizing: border-box;
        padding: 20px;
        display: flex;
        flex-flow: column;
        justify-content: space-evenly;

        .card-header {
          width: 100%;
          display: block;
          text-align: center;
        }
        .card-content {
          width: 100%;
        }
        .card-footer {
          width: 100%;
        }
      }
      .lista {
        margin: 30px 0;
        background: rgba(123, 192, 66, 0.4);
        transition: transform, background 0.4s ease-in-out;
        &:hover {
          transform: scale(1.2);
          background: rgba(123, 192, 66, 0.6);
          margin: 35px 0;
        }
      }
    }
  }
}
</style>
