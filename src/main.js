import Vue from 'vue'
import App from './App'
import router from './router'

import store from '@/store/'
import VueKonva from 'vue-konva'

Vue.use(VueKonva)

Vue.config.productionTip = false


/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>',
    store
})