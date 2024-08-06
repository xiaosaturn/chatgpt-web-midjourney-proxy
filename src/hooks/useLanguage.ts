import { computed } from 'vue'
import { enUS, koKR, zhCN, zhTW, jaJP } from 'naive-ui'
import { useAppStore } from '@/store'
import { setLocale } from '@/locales'

export function useLanguage() {
    const appStore = useAppStore()

    const language = computed(() => {
        switch (appStore.language) {
            case 'en-US':
                setLocale('en-US')
                return enUS
            case 'ru-RU':
                setLocale('ru-RU')
                return enUS
            case 'ko-KR':
                setLocale('ko-KR')
                return koKR
            case 'zh-CN':
                setLocale('zh-CN')
                return zhCN
            case 'zh-TW':
                setLocale('zh-TW')
                return zhTW
            case 'vi-VN':
                setLocale('vi-VN')
                return zhTW
            case 'fr-FR':
                setLocale('fr-FR')
                return enUS
            case 'tr-TR':
                setLocale('tr-TR')
                return enUS
            case 'ja-JP':
                setLocale('ja-JP')
                return jaJP
            default:
                setLocale('zh-CN')
                return zhCN
        }
    })

    return { language }
}
