import { createApp } from 'vue'
import 'vue-sonner/style.css'
import './style.css'
import App from './App.vue'
import { i18n } from './i18n'

document.documentElement.lang = i18n.global.locale.value
createApp(App).use(i18n).mount('#app')
