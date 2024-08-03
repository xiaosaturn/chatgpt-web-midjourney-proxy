<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NSpin, NImage, NSplit } from 'naive-ui'
import PriceItem from './PriceItem.vue'
import { t } from '@/locales'

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
            <div class="flex flex-col w-[100%]">
                <div class="text-[16px] font-bold">{{ $t('price.contact') }}:</div>
                <div class="flex justify-between w-[100%] flex-1">
                    <div class="text-[20px] font-bold">{{ $t('price.telegram') }}：@MasterH0</div>
                    <div class="w-[1px] h-5 bg-gray-300"></div>
                    <div class="text-[20px] font-bold">{{ $t('price.wechat') }}：XKSaturn</div>
                    <div class="w-[1px] h-5 bg-gray-300"></div>
                    <div class="text-[20px] font-bold">{{ $t('price.twitter') }}：@MasterHXK</div>
                    <div class="w-[1px] h-5 bg-gray-300"></div>
                    <div class="text-[20px] font-bold">{{ $t('price.email') }}：mpcexiao@gmail.com</div>
                </div>
            </div>
        </div>
    </NSpin>
</template>
