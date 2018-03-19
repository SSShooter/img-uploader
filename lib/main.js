import Vue from 'vue'
import Demo from './Demo'
import gallery from 'img-vuer'

Vue.config.productionTip = false
Vue.use(gallery)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(Demo)
})
