import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标库
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入树形控件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入NProgress包对应的js和css文件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置接口的基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios 请求拦截器, 在请求拦截其中展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  // 为请求头对象，添加token验证的Authorization字段，预处理config
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在响应拦截器中隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

// 可以直接通过this访问到axios
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 全局注册富文本编辑器
Vue.use(VueQuillEditor)

Vue.filter('deteFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  // 将获取到的月份转化为字符串，如果长度小于2，就拼接一个 0
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
