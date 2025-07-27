import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// PWA Registration
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update available notification
    console.log('Update available')
  },
  onOfflineReady() {
    // Show ready to work offline notification
    console.log('App ready to work offline')
  },
})

// Create Pinia Store
const pinia = createPinia()

// Create Vue App
const app = createApp(App)

// Use plugins
app.use(pinia)
app.use(router)

// Mount app
app.mount('#app')

// Error handling
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

// Global properties
app.config.globalProperties.$updateSW = updateSW