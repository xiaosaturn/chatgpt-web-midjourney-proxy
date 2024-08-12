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
                <span class="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-400">{{ rObj.priceWay
                    }}</span>
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
                <!-- 
                <li v-if="props.type != 1" class="flex gap-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-5 flex-none text-blue-600" viewBox="0 0 24 24"
                        stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                    </svg>
                    次数不够，可联系客服免费增加次数
                </li> -->

                <li class="flex gap-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-5 flex-none text-blue-600" viewBox="0 0 24 24"
                        stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                    </svg>
                    {{ $t('price.text2') }}
                </li>
                <li class="flex gap-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-5 flex-none text-blue-600" viewBox="0 0 24 24"
                        stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M9 12l2 2l4 -4"></path>
                    </svg>
                    {{ rObj.midjournaryText }}
                </li>
            </ul>
        </div>

        <n-popselect v-if="props.type > 1" v-model:value="rObj.selectValue" :options="rObj.options"
            :on-update:value="checkoutStripe">
            <n-button round :loading="loading" aria-describedby="tier-pro" type="primary"
                class="cursor-pointer mt-8 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-blue-50 shadow-sm hover:bg-blue-700">{{
                    $t('price.buy') }}</n-button>
        </n-popselect>

        <n-modal v-model:show="isShowWXPayUrl">
            <div class="flex bg-white justify-center items-center p-8 flex-col rounded-[20px]"
                style="position:fixed;top:30%;left:50%;transform: translateX(-50%);">
                <div class="text-[20px] font-bold">打开微信扫描下方二维码，进行付款，谢谢</div>
                <n-qr-code id="qr-code" style="margin-bottom: 20px;" :value="wxpayUrl" color="#ff08ff" />
                <n-button type="primary" @click="handleDownloadQRCode">
                    下载
                </n-button>
                <div class="text-[18px] font-bold mb-2">付款完成之后，请刷新页面</div>
                <div class="text-gray">支付遇到问题，请联系微信：XKSaturn</div>
            </div>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import request from '@/api/myAxios'
import {
    useNotification, NImage, NButton, NSpace, NPopselect,
    NPopconfirm, NDialog, NInput, useDialog, NModal, NQrCode
} from 'naive-ui'
import { t } from '@/locales'

const notification = useNotification()

const wxpayUrl = ref('');
const isShowWXPayUrl = ref(false)
const loading = ref(false)
const props = defineProps(['type'])
const rObj = reactive({
    selectValue: '',
    options: [{
        label: '信用卡/借记卡',
        value: 'usd'
    },
    {
        label: '微信支付',
        value: 'wxpay'
    },
    {
        label: '支付宝支付',
        value: 'alipay'
    }],
    type: '免费版',
    typeStr: '✨ 免费体验',
    price: '0',
    priceWay: '/一次性',
    numberStr: '5条消息',
    text: `所有AI模型均可使用
          (包括GPT-4o-mini、GPT-4o、GPT-4、GPT-3.5、Claude-3.5、Gemini-Pro、GLM、Moonshot等等)`,
    midjournaryText: ''
})

const handleDownloadQRCode = () => {
    const canvas = document
        .querySelector('#qr-code')
        ?.querySelector<HTMLCanvasElement>('canvas')
    if (canvas) {
        const url = canvas.toDataURL()
        const a = document.createElement('a')
        a.download = 'QRCode.png'
        a.href = url
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
}

const checkoutStripe = async (value: string) => {
    loading.value = true;
    if (value == 'usd' || value == 'alipay') {
        const res = await request.post('/api/app/money/create-checkout-session', {
            level: props.type,
            currency: value
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
    } else if (value == 'wxpay') {
        const res = await request.post('/api/app/money/wxnativepay', {
            level: props.type,
        });
        loading.value = false;
        if (res.code == 200) {
            wxpayUrl.value = res.data;
            isShowWXPayUrl.value = true;
        }
    }
}

onMounted(() => {
    if (props.type == 1) {
        // 5次体验，一次性
        rObj.type = t('price.free')
        rObj.typeStr = `✨ ${t('price.freeUse')}`
        rObj.price = '0'
        rObj.priceWay = `/${t('price.oneTime')}`
        rObj.numberStr = t('price.text1')
        rObj.midjournaryText = t('price.text7')
    } else if (props.type == 2) {
        // 1个月 9.9，限制每天50次
        rObj.type = t('price.monthly')
        rObj.typeStr = `🚀 ${t('price.monthlyUse')}`
        rObj.price = '9.9'
        rObj.priceWay = `/${t('price.month')}`
        rObj.numberStr = t('price.text3')
        rObj.midjournaryText = t('price.text5')
    } else if (props.type == 3) {
        // 1年99， 限制每天100次
        rObj.type = t('price.yearly')
        rObj.typeStr = t('price.yearlyUse')
        rObj.price = '99'
        rObj.priceWay = `/${t('price.year')}`
        rObj.numberStr = t('price.text4')
        rObj.midjournaryText = t('price.text6')
    }
})

</script>