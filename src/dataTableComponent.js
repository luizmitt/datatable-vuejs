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
                        <button type="button" class="btn btn-secondary">
                            <i class="fa fa-plus"></i> Novo Registro
                        </button>
                    </div>
                    <div class="col-md-6 text-right">
                        <div class="btn-group">
                            <button type="button" class="btn btn-default" :style="[filtered ? {'color':'#bbb'} : {'color':'#000'}]" @click="withFiltered()">
                                <i class="fa fa-filter"></i>
                            
                            </button>
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-cogs"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right">
                                <div class="form-check" v-for="column, index in table.columns">
                                    <input class="form-check-input" type="checkbox" :checked="isVisibleColumn(column)" @click="showColumn(column)">
                                    <label class="form-check-label" for="defaultCheck1">
                                        {{column.title}}
                                    </label>
                                </div>
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
                <th v-for="column in table.columns" v-if="column.visible">{{column.title}}<i v-if="column.sortable" :ref="'sort_'+column.field" @click="sortColumn(column.field)" class="fa fa-sort" style="float:right"></i></th>
                <th v-show="actions.length">Ações</th>
            </tr>
            <tr v-show="filtered">
                <td v-show="checkable">
                    
                </td>
                <td v-for="column, index in table.columns" v-if="column.visible">
                    <input v-if="!column.selectbox" class="form-control" type="text" :name="column.field" v-model="filter.searchValues[index]">
                    <select v-else class="form-control select2" :name="column.field" v-model="filter.searchValues[index]">
                        <option v-for="option in column.selectbox" :name="column.field" :value="option.id">{{option.text}}</option>
                    </select>
                </td>
                <td v-show="actions.length">
                    <div class="group-btn">
                        <button class="btn btn-default">
                            <i class="fa fa-search"></i>
                        </button>

                        <button class="btn btn-default" type="button" @click.prevent="getData()">
                            <i class="fa fa-sync"></i>
                        </button>
                    </div>
                </td>
            </tr>
        </thead>
        
        <tbody>
            <tr v-if="!displayedData.length">
                <td colspan="100%">Nenhum registro encontrado.</td>
            </tr>
            
            <tr v-else-if="table.loading && !displayedData.length">
                <td colspan="100%">Carregando....</td>
            </tr>

            <tr v-else v-for="row in displayedData">
                <td v-show="checkable">
                    <input type="checkbox" name="selection[]">
                </td>
                <td v-for="column in table.columns" v-if="column.visible">{{row[column.field]}}</td>
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
                    <div class="row">
                        <div class="col-md-12">
                            total de <b>{{table.total}}</b> registros, 
                            <select v-model="table.perPage">
                                <option value="10" selected>10</option>
                                <option value="30">30</option>
                                <option value="60">60</option>
                                <option value="100">100</option>
                            </select>
                            por página.
                        </div>
                        <div class="col-md-12 text-right">
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
                        </div>
                    </div>

                </td>
            </tr>
        </tfoot>
      </table>
      </div>
      <slot name="modal1"/>
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
                pages: [],
                loading: false
            },
            filter: {
                searchColumns: [],
                searchValues: [],
                data: [],
                checkedColumns: []
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
        },

        "columns": function (options) {
            if (options.visible == undefined) {
                options.visible = true;
            }
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
                    this.table.total = this.table.data.length;
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
            if (typeof data != "object") {
                return [];
            }

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
        },
        compareValues(key, order = 'asc') {
            return function (a, b) {
                if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                    return 0;
                }

                const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
                const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

                let comparison = 0;

                if (varA > varB) {
                    comparison = 1;
                } else if (varA < varB) {
                    comparison = -1;
                }

                return (order == 'desc') ? (comparison * -1) : comparison
            };
        },
        showColumn(obj) {
            obj.visible = !obj.visible;
        },
        isVisibleColumn(obj) {
            return obj.visible;
        },
        withFiltered() {
            this.filtered = !this.filtered;
        },
        sortColumn(column, dir = 'asc') {
            let className = this.$refs['sort_' + column][0].className;

            document.querySelectorAll(".fa-sort-down, .fa-sort-up").forEach(el => {
                el.className = 'fa fa-sort'
            });

            if (className.toString().toLowerCase().indexOf("sort_asc") !== -1) {
                dir = 'asc';
                this.$refs['sort_' + column][0].className = 'sort_desc fa fa-sort-up';
            } else {
                dir = 'desc';
                this.$refs['sort_' + column][0].className = 'sort_asc fa fa-sort-down';
            }
            this.filter.data.sort(this.compareValues(column, dir))
        },
    },
    beforeUpdate() {
        this.table.loading = true
    },
    updated() {
        //this.table.loading = false
    },

    mounted() {
        this.getData();
        console.log(this.displayedData);
    }
});