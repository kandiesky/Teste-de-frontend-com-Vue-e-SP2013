"use strict";

import Vue from "vue";
import axios from "axios";
import App from "./App.vue";
import vueAxios from "vue-axios";
Vue.config.devtools = true;
Vue.use(vueAxios, axios);

const apps = [];

document.querySelectorAll("lista-documentos").forEach((lista, index) => {
  const estilo = lista.getAttribute("estilo");
  const tituloLista = lista.getAttribute("titulo-lista");
  const url = lista.getAttribute("url");
  const items = axios.get(
    `${url}/_api/Web/Lists/getbytitle('${tituloLista}')/items?$expand=File`,
    {
      headers: {
        Accept: "application/json;odata=verbose"
      }
    }
  );
  const campos = axios.get(
    `${url}/_api/Web/Lists/getbytitle('${tituloLista}')/fields`,
    {
      headers: {
        Accept: "application/json;odata=verbose"
      }
    }
  );

  Promise.all([items, campos]).then(resposta => {
    let inicio = 1;
    const arrayPaginas = [];
    const total = resposta[0].data.d.results.length / 10;

    while (inicio <= total) {
      arrayPaginas.push(inicio);
      inicio++;
    }

    apps[index] = new Vue({
      data: {
        estilo,
        tituloLista,
        paginas: arrayPaginas,
        documentos: resposta[0].data.d.results,
        campos: resposta[1].data.d.results
      },
      render: h => h(App)
    }).$mount(lista);
  });
});
