<script setup lang="ts">
import { NConfigProvider, darkTheme } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import aiOther from "@/views/mj/aiOther.vue"
import { onMounted } from 'vue'
import { t } from "@/locales";

const { theme } = useTheme()
const { language } = useLanguage()

const updateTitle = () => {
    document.title = t('common.webTitle'); // 更新标题为当前语言的标题
};

const themeOverrides = {
    common: {
        primaryColor: '#ff08ff',
        primaryColorHover: '#ff08ff',
    },
    Button: {
        colorPrimary: '#ff08ff',
        textColorPrimary: '#ffffff',
        textColorHoverPrimary: '#fff'
        // colorDisabledPrimary: '#ff08ff',
        // rippleColor: '#ff08ff',
        // colorSuccess: '#ff08ff',
        // colorDisabledSuccess: '#ff08ff',
        // textColorTextPrimary: '#ff08ff',
    },
    Input: {
        // border: '1px solid #ff08ff',
        borderHover: '1px solid #ff08ff',
        borderFocus: '1px solid #ff08ff'
    },
    Message: {
        iconColorSuccess: '#ff08ff'
    },
    Notification: {
        iconColorSuccess: '#ff08ff'
    },
    Dialog: {
        iconColor: '#ff08ff'
    },
    Slider: {
        fillColor: '#ff08ff',
        fillColorHover: '#ff08ff'
    }
}

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
