<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NSpin, NImage } from 'naive-ui'

const loading = ref(false)

</script>

<template>
    <NSpin :show="loading">
        <div class="p-4 space-y-4 flex flex-col items-center">
            <div class="text-[18px] font-bold">微信扫描下方二维码，联系客服</div>
            <n-image width="300" src="https://image.xiaosaturn.com/Photo/2024720/123315/xqfaorni9d1721449995145.png"></n-image>
        </div>
    </NSpin>
</template>
