import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'
import mjlayout from '@/views/mj/layout.vue'
import sunoLayout from '@/views/suno/layout.vue'
import lumaLayout from '@/views/luma/layout.vue'
import mobileMeLayout from '@/views/mobile/layout.vue'
import mobilePriceLayout from '@/views/mobile/price.vue'
import landingpage from '@/views/LandingPage.vue'
import policyService from '@/views/protocol/service.vue'
import policyPrivacy from '@/views/protocol/privacy.vue'
import policyPay from '@/views/protocol/pay.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Root',
        component: ChatLayout,
        redirect: '/chat',
        children: [
            {
                path: '/chat/:uuid?',
                name: 'Chat',
                component: () => import('@/views/chat/index.vue'),
            },
        ],
    },
    {
        path: '/g',
        name: 'g',
        component: ChatLayout,
        redirect: '/g/g-2fkFE8rbu',
        children: [
            {
                path: '/g/:gid',
                name: 'GPTs',
                component: () => import('@/views/chat/index.vue'),
            },
        ],
    },
    {
        path: '/m',
        name: 'm',
        component: ChatLayout,
        redirect: '/m/gpt-3.5-turbo',
        children: [
            {
                path: '/m/:gid',
                name: 'Model',
                component: () => import('@/views/chat/index.vue'),
            },
        ],
    },
    {
        path: '/s',
        name: 's',
        component: ChatLayout,
        redirect: '/s/t',
        children: [
            {
                path: '/s/t',
                name: 'Setting',
                component: () => import('@/views/chat/index.vue'),
            },
        ],
    },


    {
        path: '/draw',
        name: 'Rootdraw',
        component: mjlayout,
        redirect: '/draw/index',
        children: [
            {
                path: '/draw/:uuid?',
                name: 'draw',
                component: () => import('@/views/mj/draw.vue'),
            },
        ],
    },

    {
        path: '/music',
        name: 'music',
        component: sunoLayout,
        redirect: '/music/index',
        children: [
            {
                path: '/music/:uuid?',
                name: 'music',
                component: () => import('@/views/suno/music.vue'),
            },
        ],



    },
    {
        path: '/video',
        name: 'video',
        component: lumaLayout,
        redirect: '/video/index',
        children: [
            {
                path: '/video/:uuid?',
                name: 'video',
                component: () => import('@/views/luma/video.vue'),
            },
        ],
    },

    {
        path: '/dance',
        name: 'dance',
        component: lumaLayout,
        redirect: '/dance/index',
        children: [
            {
                path: '/dance/:uuid?',
                name: 'dance',
                component: () => import('@/views/viggle/dance.vue'),
            },
        ],
    },

    {
        path: '/mobile/me',
        name: 'mobileme',
        component: mobileMeLayout,
    },
    {
        path: '/mobile/price',
        name: 'mobileprice',
        component: mobilePriceLayout,
    },

    {
        path: '/landing/page',
        name: 'landingpage',
        component: landingpage,
    },

    {
        path: '/policy/service',
        name: 'policyService',
        component: policyService,
    },

    {
        path: '/policy/privacy',
        name: 'policyPrivacy',
        component: policyPrivacy,
    },

    {
        path: '/policy/pay',
        name: 'policyPay',
        component: policyPay,
    },


    //调试
    // {
    //   path: '/mytest',
    //   name: 'mytest',
    //   component: () => import('@/views/mj/myTest.vue'),
    // },

    {
        path: '/404',
        name: '404',
        component: () => import('@/views/exception/404/index.vue'),
    },

    {
        path: '/500',
        name: '500',
        component: () => import('@/views/exception/500/index.vue'),
    },

    {
        path: '/:pathMatch(.*)*',
        name: 'notFound',
        redirect: '/404',
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
    app.use(router)
    await router.isReady()
}
