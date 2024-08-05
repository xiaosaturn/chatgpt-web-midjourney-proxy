<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import aiOther from "@/views/mj/aiOther.vue"
import { onMounted } from 'vue'
import { t } from "@/locales";

const { theme, themeOverrides } = useTheme()
const { language } = useLanguage()

const updateTitle = () => {
    document.title = t('common.webTitle'); // 更新标题为当前语言的标题
};

onMounted(() => {
    updateTitle()
})
</script>

<template>
    <NConfigProvider class="h-full" :theme="theme" :theme-overrides="themeOverrides" :locale="language">
        <NaiveProvider>
            <RouterView />
        </NaiveProvider>
    </NConfigProvider>
    <aiOther />
</template>
