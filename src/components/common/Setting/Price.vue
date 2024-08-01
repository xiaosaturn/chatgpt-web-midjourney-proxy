<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NSpin, NImage, NSplit } from 'naive-ui'
import PriceItem from './PriceItem.vue'

const loading = ref(false)

</script>

<template>
    <NSpin :show="loading">
        <div class="p-4 space-y-4 flex flex-col items-center">
            <div class="grid grid-cols-3 gap-6">
                <PriceItem :type="1" />
                <PriceItem :type="2" />
                <PriceItem :type="3" />
            </div>
            <div class="flex flex-col items-center w-[100%]">
                <div class="text-[18px] font-bold">支付遇到问题，联系客服</div>
                <div class="flex justify-between w-[100%] flex-1">
                    <div class="text-[20px] font-bold">电报：@MasterH0</div>
                    <div class="text-[20px] font-bold">微信：XKSaturn</div>
                    <div class="text-[20px] font-bold">推特：@MasterHXK</div>
                    <div class="text-[20px] font-bold">邮箱：mpcexiao@gmail.com</div>
                </div>
            </div>
        </div>
    </NSpin>
</template>
