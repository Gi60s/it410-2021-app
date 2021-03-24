import axios from '@/assets/axios'
import Vue from 'vue'

Vue.use({
  install (Vue, options) {
    Vue.prototype.$axios = axios
  }
})