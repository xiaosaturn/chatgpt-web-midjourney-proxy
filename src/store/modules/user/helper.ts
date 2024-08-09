import { ss } from '@/utils/storage'
import { t } from '@/locales'
const LOCAL_NAME = 'userStorage'

export interface UserInfo {
    id?: number,
    nickname?: string,
    email?: string
    password?: string,
    rePassword?: string
    captcha?: string
    avatar: string
    name?: string
    description?: string
    expireDate?: string
    expireTime?: string
    chatCount?: string
    drawCount?: string
    level?: string
}

export interface UserState {
    userInfo: UserInfo
}

export function defaultSetting(): UserState {
    return {
        userInfo: {
            // avatar: 'https://raw.githubusercontent.com/Dooy/chatgpt-web-midjourney-proxy/main/src/assets/avatar.jpg',
            avatar: 'https://deepimage.polo-e.net/applets/20240510/052220_26bfd6acdcacd555f4ecd7666c5941f.jpg',
            nickname: t('mjset.sysname'), //'AI绘图',
            description: 'Star on <a href="https://github.com/Dooy/chatgpt-web-midjourney-proxy" class="text-blue-500" target="_blank" >GitHub</a>',
        },
    }
}

export function getLocalState(): UserState {
    const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
    return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
    ss.set(LOCAL_NAME, setting)
}
