import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/pet',
        name: 'Pet',
        component: () => import('../views/Pet.vue')
    },
    {
        path: '/achievements',
        name: 'Achievements',
        component: () => import('../views/Achievements.vue')
    },
    {
        path: '/challenges',
        name: 'Challenges',
        component: () => import('../views/Challenges.vue')
    },
    {
        path: '/stats',
        name: 'Stats',
        component: () => import('../views/Stats.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
    },
    {
        path: '/games',
        name: 'Games',
        component: () => import('../views/Games.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router