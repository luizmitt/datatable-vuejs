Vue.component("data-table", {
  props: ["columns", "urlApi", "actions", "filtered", "paginator"],
  template: `
      <table class="table">
        <thead>
            <tr>
                <th v-for="column in table.columns">{{column.title}}</th>
                <th v-show="actions.length">Ações</th>
            </tr>
            <tr v-show="filtered">
                <td v-for="column in table.columns">
                    <input class="form-control" type="text" name="column.field">
                    <td v-show="actions.length"></td>
                </td>
            </tr>
        </thead>
        
        <tbody>
            <tr v-if="!displayedData.length">
                <td colspan="100%">Nenhum registro encontrado.</td>
            </tr>
            
            <tr v-else v-for="row in displayedData">
                <td v-for="column in table.columns">{{row[column.field]}}</td>
                <td v-show="actions.length">
                    <button class="btn" :class="action.class" v-for="action in actions">
                        <i v-show="action.icon" :class="action.icon"></i>
                        {{action.label}}
                    </button>
                </td>
            </tr>
        </tbody>
        
        <tfoot>
            <tr>
                <td colspan="100%">
                    <nav aria-label="Pagination" v-show="table.data.length > table.perPage">
                        <ul class="pagination justify-content-end">
                            <li class="page-item" :class="{disabled:this.table.page <= 1}" @click="setPrevPage()">
                                <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Anterior</a>
                            </li>
                            <li class="page-item" :class="{active: pageNumber == table.page}" v-for="pageNumber in table.pages.slice(table.page-1, table.page+5)" @click="table.page = pageNumber"><a class="page-link" href="#"> {{pageNumber}}</a></li>
                            <li class="page-item"  :class="{disabled:this.table.page >= this.table.maxPage}" @click="setNextPage()">
                                <a class="page-link" href="#">Próximo</a>
                            </li>
                        </ul>
                    </nav>
                </td>
            </tr>
        </tfoot>
      </table>
    `,
  data: function() {
    return {
      table: {
        columns: this.columns,
        data: this.urlApi,
        actions: this.actions,
        total: 0,
        page: 1,
        perPage: 10,
        maxPage: 0,
        pages: []
      }
    };
  },
  watch: {
    "table.data": function() {
      this.setPages();
    }
  },
  computed: {
    displayedData() {
      return this.paginate(this.table.data);
    }
  },
  methods: {
    getData() {
      axios
        .get(this.table.data)
        .then(resp => {
          this.table.data = resp.data;
        })
        .catch(error => {});
    },
    setPages() {
      this.table.maxPage = Math.ceil(
        this.table.data.length / this.table.perPage
      );

      for (let index = 1; index <= this.table.maxPage; index++) {
        this.table.pages.push(index);
      }
    },
    paginate(data) {
      let page = this.table.page;
      let perPage = this.table.perPage;
      let from = page * perPage - perPage;
      let to = page * perPage;
      return data.slice(from, to);
    },
    setPrevPage() {
      if (this.table.page - this.table.perPage <= 1) {
        this.table.page = 1;
      } else {
        this.table.page -= this.table.perPage;
      }
    },
    setNextPage() {
      if (this.table.page + this.table.perPage >= this.table.maxPage) {
        this.table.page = this.table.maxPage;
      } else {
        this.table.page += this.table.perPage;
      }
    },
    setPage(page) {
      this.table.page = page;
    }
  },
  mounted() {
    this.getData();
  }
});
