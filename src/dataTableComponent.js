Vue.component('data-table', {
    props: ['columns', 'urlApi', 'actions', 'filtered', 'paginator'],
    components: [
        'dataModelComponent'
    ],
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
           <tr v-for="row in table.data">
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
        </tfoot>
      </table>
    `,
    data: function () {
        return {
            table: {
                columns: this.columns,
                data: this.urlApi,
                actions: this.actions,
                total: 0
            },
        }
    },
    watch: {},
    methods: {
        load() {
            axios.get(this.table.data, {
                    page: 2
                })
                .then((resp) => {
                    this.table.data = resp.data
                })
                .catch((error) => {})
        }
    },

    mounted() {
        this.load()
    }
})