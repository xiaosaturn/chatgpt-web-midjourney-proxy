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
                <div class="flex flex-col items-center">
                    <div class="text-[18px] font-bold">支付遇到问题，联系客服</div>
                    <div class="text-[20px] font-bold">电报：@MasterH0</div>
                    <div class="text-[20px] font-bold">微信：XKSaturn</div>
                    <div class="text-[20px] font-bold">推特：@MasterHXK</div>
                    <div class="text-[20px] font-bold">邮箱：mpcexiao@gmail.com</div>
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