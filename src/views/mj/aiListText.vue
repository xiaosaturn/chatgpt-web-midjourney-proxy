<script setup lang="ts">
import { gptConfigType } from '@/store';
import { NPopover, NAvatar } from "naive-ui";
import { SvgIcon } from '@/components/common'

defineProps<{ myItem: Chat.History, myObj?: gptConfigType }>()

</script>

<template>
    <span class="flex justify-start items-center">
        <!-- <SvgIcon v-if="!myObj" icon="vscode-icons:file-type-excalidraw" class="w-6 h-6" /> -->
        <n-avatar v-if="!myObj" class="w-6 h-6"
            src="https://deepimage.polo-e.net/applets/20240813/012414_1723512253388.png"></n-avatar>
        <n-avatar v-else-if="myObj.gpts" class="w-6 h-6" :src="myObj.gpts.logo" fallback-src="../../assets/avatar.jpg"
            :size="24" round />
        <!-- <SvgIcon icon="bi:chat" v-else /> -->
        <SvgIcon v-else icon="cryptocurrency-color:chat" class="w-6 h-6" />
    </span>
    <div class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap"
        style="border-color:#ff80ff;">
        <slot />
        <div v-if="!myObj">
            <span class="text-[16px]">{{ myItem.title }}</span>
            <div class="text-[12px] text-gray-400">{{ myItem.latestTime }}</div>
        </div>
        <n-popover v-else placement="right-start" trigger="hover">
            <template #trigger>
                <div>
                    <div class="text-[16px]">{{ myItem.title }}</div>
                    <div class="text-[12px] text-gray-400">{{ myItem.latestTime }}</div>
                </div>
            </template>
            <ul>
                <template v-if="myObj.gpts">
                    <li class="flex justify-start items-center space-x-2">
                        <n-avatar :src="myObj.gpts.logo" fallback-src="../../assets/avatar.jpg" round />
                        <span>{{ myObj.gpts.name }}</span>
                    </li>
                    <li>ID: {{ myObj.model }}</li>
                </template>
                <li v-else> {{ $t('mjset.model') }}: {{ myObj.model }}</li>
                <li> {{ $t('mjchat.historyCnt') }}: {{ myObj.talkCount }}</li>
                <li> {{ $t('mjchat.historyTCnt') }}: {{ myObj.max_tokens }}</li>
                <li v-if="myObj.systemMessage">{{ $t('mjchat.role') }}: {{ myObj.systemMessage }}</li>
            </ul>
        </n-popover>
    </div>
</template>