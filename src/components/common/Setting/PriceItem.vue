<template>
    <div
        class="flex w-full max-w-md flex-col justify-between rounded-3xl bg-slate-50 p-8 text-slate-900 ring-1 ring-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-300/20 xl:p-10">
        <div class='mb-6'>
            <div class="flex items-center justify-between gap-x-4">
                <h3 id="tier-starter" class="text-lg font-semibold leading-8">{{ rObj.type }}</h3>
                <p class="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                    {{ rObj.typeStr }}
                </p>
            </div>
            <p class="mt-6 flex items-baseline gap-x-1">
                <span class="text-5xl font-bold tracking-tight">
                    
                    {{ '$' + rObj.price }}
                </span>
                <span class="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-400">{{ rObj.priceWay }}</span>
            </p>
            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-400">
                <li class="flex gap-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-5 flex-none text-blue-600" viewBox="0 0 24 24"
                        stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                    </svg>
                    {{ rObj.numberStr }}
                </li>
                <li v-if="props.type != 1" class="flex gap-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-5 flex-none text-blue-600" viewBox="0 0 24 24"
                        stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                    </svg>
                    次数不够，可联系客服免费增加次数
                </li>
                <li class="flex gap-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-5 flex-none text-blue-600" viewBox="0 0 24 24"
                        stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                    </svg>
                    {{ rObj.text }}
                </li>
            </ul>
        </div>
        <n-button
          v-if="props.type > 1"
          @click="checkoutStripe"
          round
          :loading="loading"
          aria-describedby="tier-pro"
          type="primary"
          class="cursor-pointer mt-8 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-blue-50 shadow-sm hover:bg-blue-700"
          >Buy plan</n-button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import request from '@/api/myAxios'
import { useNotification, NImage, NButton, NDialog, NInput, useDialog } from 'naive-ui'
const notification = useNotification()

const loading = ref(false)
const props = defineProps(['type'])
const rObj = reactive({
    type: '免费版',
    typeStr: '✨ 免费体验',
    price: '0',
    priceWay: '/一次性',
    numberStr: '5条消息',
    text: `所有AI模型均可使用
          (包括GPT-4o-mini、GPT-4o、GPT-4、GPT-3.5、Claude-3.5、Gemini-Pro、GLM、Moonshot等等)`
})

const checkoutStripe = async () => {
    loading.value = true;
    const res = await request.post('/app/money/create-checkout-session', {
        level: props.type
    });
    loading.value = false;
    if (res.code == 200) {
        window.location.href = res.data.url;
    } else if (res.code = 401) {
        notification.error({
            title: '请先登录',
            duration: 3000
        });
    } else {
        notification.error({
            title: res.msg,
            duration: 3000
        });
    }
}

onMounted(() => {
    if (props.type == 1) {
        // 5次体验，一次性
        rObj.type = '免费版'
        rObj.typeStr = '✨ 免费体验'
        rObj.price = '0'
        rObj.priceWay = '/一次性'
        rObj.numberStr = '赠送5条消息，免费尝鲜'
    } else if (props.type == 2) {
        // 1个月 9.9，限制每天50次
        rObj.type = '按月付费'
        rObj.typeStr = '🚀 小试牛刀'
        rObj.price = '9.9'
        rObj.priceWay = '/月'
        rObj.numberStr = '每天50条消息'
    } else if (props.type == 3) {
        // 1年99， 限制每天100次
        rObj.type = '按年付费'
        rObj.typeStr = '最划算'
        rObj.price = '99'
        rObj.priceWay = '/年'
        rObj.numberStr = '每天100条消息'
    }
})

</script>