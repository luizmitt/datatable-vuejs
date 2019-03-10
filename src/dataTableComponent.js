Vue.component("data-table", {
    props: {
        columns: {
            type: [Array, Object]
        },
        urlApi: {
            type: String
        },
        actions: {
            type: [Array, Object]
        },
        filtered: {
            type: Boolean,
            default: true
        },
        checkable: {
            type: Boolean,
            default: true
        },
        paginator: {
            type: Object,
            default: function () {
                return {
                    perPage: 15
                };
            }
        }
    },
    template: `
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-6">
                        <button type="button" class="btn btn-default">
                            <i class="fa fa-plus"></i> Novo Registro
                        </button>
                    </div>
                    <div class="col-md-6 text-right">
                        <div class="btn-group">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-cogs"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>
                                <a class="dropdown-item" href="#">Something else here</a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="#">Separated link</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body" style="padding:0 !important">

      <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th v-show="checkable">
                    <input type="checkbox">
                </th>            
                <th v-for="column in table.columns">{{column.title}}</th>
                <th v-show="actions.length">Ações</th>
            </tr>
            <tr v-show="filtered">
                <td v-show="checkable">
                    
                </td>
                <td v-for="column, index in table.columns" >
                    <input v-if="!column.selectbox" class="form-control" type="text" :name="column.field" v-model="filter.searchValues[index]">
                    <select v-else class="form-control select2" :name="column.field" v-model="filter.searchValues[index]">
                        <option v-for="option in column.selectbox" :name="column.field" :value="option.id">{{option.text}}</option>
                    </select>
                </td>
                <td v-show="actions.length"></td>
            </tr>
        </thead>
        
        <tbody>
            <tr v-if="!displayedData.length">
                <td colspan="100%">Nenhum registro encontrado.</td>
            </tr>
            
            <tr v-else v-for="row in displayedData">
                <td v-show="checkable">
                    <input type="checkbox" name="selection[]">
                </td>
                <td v-for="column in table.columns">{{row[column.field]}}</td>
                <td v-show="actions.length">
                    <div class="btn-group">
                    <button class="btn" :class="action.class" v-for="action in actions">
                        <i v-show="action.icon" :class="action.icon"></i>
                        {{action.label}}
                    </button>
                    </div>
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
                            <li class="page-item" :class="{active: pageNumber == table.page}" v-for="pageNumber in table.pages.slice(table.page-1, table.page+5)" @click="setPage(pageNumber)"><a class="page-link" href="#"> {{pageNumber}}</a></li>
                            <li class="page-item"  :class="{disabled:this.table.page >= this.table.maxPage}" @click="setNextPage()">
                                <a class="page-link" href="#">Próximo</a>
                            </li>
                        </ul>
                        <input v-model="table.page">
                    </nav>
                </td>
            </tr>
        </tfoot>
      </table>
      </div>
      </div>
    `,
    data: function () {
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
            },
            filter: {
                searchColumns: [],
                searchValues: [],
                data: []
            }
        };
    },
    watch: {
        "table.data": function () {
            this.setPages();
        },
        "filter.data": function () {
            this.setPages();
        },

        "filter.searchValues": function () {
            let search = this.mergeArrayByIndex(
                this.filter.searchColumns,
                this.filter.searchValues
            );

            columns = Object.keys(search).filter(field => search[field]);
            this.filter.data = this.table.data.filter(data => columns.every(field => data[field].toString().toLowerCase().indexOf(search[field]) !== -1));
        }
    },
    computed: {
        displayedData() {
            this.filter.data = this.filter.data.length ? this.filter.data : this.table.data;
            return this.paginate(this.filter.data);
        }
    },
    methods: {
        getData() {
            axios
                .get(this.table.data)
                .then(resp => {
                    this.filter.data = this.table.data = resp.data;
                })
                .catch(error => {});

            this.table.columns.filter(data => {
                this.filter.searchColumns.push(data.field);
                if (data.selectbox != undefined) {
                    switch (typeof data.selectbox) {
                        case "string":
                            axios.get(data.selectbox).then(resp => {
                                data.selectbox = resp.data;
                            });
                            break;
                    }
                }
            });
        },
        setPages() {
            this.table.pages = [];
            this.table.maxPage = Math.ceil(
                this.filter.data.length / this.table.perPage
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
        },
        mergeArrayByIndex(array1, array2) {
            var obj = {};
            array1.map((e, i) => {
                if (array2[i] == undefined) array2[i] = "";
                obj[e] = array2[i];
            });
            return obj;
        }
    },
    beforeUpdate() {
        console.log("atualizando")
    },
    updated() {
        console.log("atualizado!")
    },

    mounted() {
        this.getData();
    }
});