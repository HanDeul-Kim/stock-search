import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import StockDetail from '../views/StockDetail.vue'
import Home from '../views/Home.vue'

const routes = [
    {
        path: "/",
        component: Home
    },
    {
        path: "/detail/:code",
        component: StockDetail
        
    },
    // {
    //     path: "/mypage",
    //     component: Mypage
    // }



]

const router = createRouter({
    // history: createWebHistory(), 
    // 서버 없으니 hash
    history: createWebHashHistory(),
    routes
})

export default router