import Vue from 'vue'
import Router from 'vue-router'
import Demo from '@/components/test'

Vue.use(Router)

export default new Router({
    routes: [{
            path: '/',
            name: 'Demo',
            component: Demo
                // component: () => '@/components/AggridComponent.vue'
        },
        {
            path: '/ag-grid',
            name: 'Aggrid',
            component: () => '@/components/AggridComponent.vue'
        }
    ]
})