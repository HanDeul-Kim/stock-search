import './assets/common.css'
import './assets/style.css'
import './assets/media.css'
import { createApp } from 'vue'
import router from './router/route'
import App from './App.vue'

createApp(App).use(router).mount('#app')
