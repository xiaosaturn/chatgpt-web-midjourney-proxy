<template>
    <!-- <div class="container dark:bg-[#24272e] transition-all p-0" :class="[isMobile ? 'h55' : 'h-full']">
        <div class="h-full" :class="getMobileClass">
            <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
                <NLayoutContent class="h-full">
                    <div class="flex flex-col px-8" style="overflow: scroll;">
                        <n-space vertical>
                            <PriceItem :type="1" />
                            <PriceItem :type="2" />
                            <PriceItem :type="3" />
                        </n-space>
                    </div>
                </NLayoutContent>
            </NLayout>
        </div>
    </div> -->
    <div class="container dark:bg-[#24272e] transition-all p-0 h55">
        <div class="flex flex-col pt-4 px-4 pb-[70px]" style="overflow: scroll;">
            <n-space vertical>
                <PriceItem :type="1" />
                <PriceItem :type="2" />
                <PriceItem :type="3" />
                <button
                    class="mt-6 w-full rounded-lg border border-slate-300 p-4 text-center text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-blue-600 hover:text-slate-50 focus:outline-none dark:border-slate-700 dark:text-slate-200"
                    type="button" @click="copyToClipboard">
                    ✨ 联系客服开通会员权限
                </button>
                <div class="text-3xl text-center py-2 font-bold">或</div>
                <div class="text-center">微信扫描下方二维码，添加客服微信</div>
                <div class="flex justify-center">
                    <n-image width="300" src="https://image.xiaosaturn.com/Photo/2024720/123315/xqfaorni9d1721449995145.png"></n-image>
                </div>
            </n-space>
        </div>
        <aiMobileMenu />
    </div>
</template>

<script lang="ts" setup>
import { NSpace, useNotification, NImage } from 'naive-ui'
import PriceItem from '@/components/common/Setting/PriceItem.vue'
import aiMobileMenu from '@/views/mj/aiMobileMenu.vue';

const notification = useNotification()

const go2WX = () => {
    const wxid = 'mengxinxianhai'; // 替换为实际的微信号
    const url = `weixin://contacts/profile/${wxid}`;
    window.location.href = url;
}

const copyToClipboard = () => {
    const wxid = 'mengxinxianhai'; // 替换为实际的微信号
    navigator.clipboard.writeText(wxid).then(() => {
        notification.success({
            title: '复制客服微信成功，将为你跳转到微信',
            duration: 3000,
        });
        setTimeout(() => {
            go2WX();
        }, 1500)
    }).catch(err => {
        console.error('Error in copying text: ', err);
    });
}
</script>

<style lang="scss" scoped>
.container {
    .h55 {
        height: calc(100% - 55px);
    }
}

</style>