<script lang="ts" setup>
import { computed, onMounted, ref, h } from 'vue'
import { NButton, NInput, NPopconfirm, NSelect, useMessage, useNotification, NAvatar, NTag, useDialog } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon } from '@/components/common'
import { useAppStore, useUserStore, gptServerStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { getCurrentDate } from '@/utils/functions'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import axios from 'axios'
import request from '@/api/myAxios'

interface Emit {
    (e: 'loginSuccess'): void
}

const appStore = useAppStore()
const userStore = useUserStore()
const emit = defineEmits<Emit>()
const dialog = useDialog()

const { isMobile } = useBasicLayout()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userInfo = computed(() => userStore.userInfo)

const avatar = ref(userInfo.value.avatar ?? '')

const name = ref(userInfo.value.name ?? '')

const description = ref(userInfo.value.description ?? '')

const showRegister = ref(false)

const notification = useNotification()

const nickName = ref(userInfo.value.nickname)

const fileInput = ref<HTMLInputElement | null>(null);

let countdown = ref(60);
let timer: any;
let isDisabled = ref(false)
let btnStr = ref(t('userInfo.sendCode'))


const language = computed({
    get() {
        return appStore.language
    },
    set(value: Language) {
        appStore.setLanguage(value)
    },
})

const themeOptions: { label: string; key: Theme; icon: string }[] = [
    {
        label: 'Auto',
        key: 'auto',
        icon: 'ri:contrast-line',
    },
    {
        label: 'Light',
        key: 'light',
        icon: 'ri:sun-foggy-line',
    },
    {
        label: 'Dark',
        key: 'dark',
        icon: 'ri:moon-foggy-line',
    },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
    { label: '简体中文', key: 'zh-CN', value: 'zh-CN' },
    { label: '繁體中文', key: 'zh-TW', value: 'zh-TW' },
    { label: 'English', key: 'en-US', value: 'en-US' },
    { label: '한국어', key: 'ko-KR', value: 'ko-KR' },
    { label: '日本語', key: 'ja-JP', value: 'ja-JP' },
    { label: 'Русский язык', key: 'ru-RU', value: 'ru-RU' },
    { label: 'Tiếng Việt', key: 'vi-VN', value: 'vi-VN' },
    { label: 'Français', key: 'fr-FR', value: 'fr-FR' },
    { label: 'Türkçe', key: 'tr-TR', value: 'tr-TR' },

]

function updateUserInfo(options: Partial<UserInfo>) {
    userStore.updateUserInfo(options)
    ms.success(t('common.success'))
}

function handleReset() {
    userStore.resetUserInfo()
    gptServerStore.setInit()
    ms.success(t('common.success'))
    window.location.reload()
}

function exportData(): void {
    const date = getCurrentDate()
    const data: string = localStorage.getItem('chatStorage') || '{}'
    const jsonString: string = JSON.stringify(JSON.parse(data), null, 2)
    const blob: Blob = new Blob([jsonString], { type: 'application/json' })
    const url: string = URL.createObjectURL(blob)
    const link: HTMLAnchorElement = document.createElement('a')
    link.href = url
    link.download = `chat-store_${date}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

function importData(event: Event): void {
    const target = event.target as HTMLInputElement
    if (!target || !target.files)
        return

    const file: File = target.files[0]
    if (!file)
        return

    const reader: FileReader = new FileReader()
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result as string)
            localStorage.setItem('chatStorage', JSON.stringify(data))
            ms.success(t('common.success'))
            location.reload()
        }
        catch (error) {
            ms.error(t('common.invalidFileFormat'))
        }
    }
    reader.readAsText(file)
}

function clearData(): void {
    localStorage.removeItem('chatStorage')
    location.reload()
}

function handleImportButtonClick(): void {
    const fileInput = document.getElementById('fileInput2') as HTMLElement
    if (fileInput) fileInput.click()
}

const login = async () => {
    if (userInfo.value.email && userInfo.value.password) {
        // 登录
        const res = await request.post('/api/app/user/login', {
            email: userInfo.value.email,
            password: userInfo.value.password
        });
        if (res.code == 200) {
            notification.success({
                title: t('userInfo.loginSuccess'),
                duration: 3000,
            });
            gptServerStore.setMyData({
                SERVICE_TOKEN: res.data.token
            })
            userStore.updateUserInfo(res.data.user)
            emit('loginSuccess')
        } else {
            notification.error({
                title: res.msg,
                duration: 3000,
            });
        }
    }
}

const getCaptcha = async () => {
    if (validateEmail(userInfo.value.email)) {
        const res = await request.get('/api/app/user/captcha', {
            email: userInfo.value.email
        });
        if (res.code == 200) {
            if (timer != null) {
                return
            } else {
                timer = setInterval(() => {
                    countdown.value--;
                    btnStr.value = `${countdown.value}s`;
                    isDisabled.value = true;
                    if (countdown.value <= 0) {
                        clearInterval(timer);
                        timer = null;
                        btnStr.value = t('userInfo.sendCode');
                        isDisabled.value = false;
                        countdown.value = 60;
                    }
                }, 1000);
                notification.success({
                    title: t('userInfo.sendSuccess'),
                    duration: 3000,
                });
            }
        } else {
            notification.error({
                title: t('userInfo.sendFailure'),
                duration: 3000,
                description: res.msg
            });
        }
    } else {

    }
}

const register = async () => {
    if (validateEmail(userInfo.value.email) &&
        validatePassword(userInfo.value.password) &&
        validatePassword(userInfo.value.rePassword)) {
        if (userInfo.value.password != userInfo.value.rePassword) {
            notification.error({
                title: t('userInfo.twoNotSame'),
                duration: 3000,
            });
            return false
        }
        if (validateVerificationCode(userInfo.value.captcha)) {
            // 发送请求到后端
            const res = await request.post('/api/app/user/register', {
                email: userInfo.value.email,
                password: userInfo.value.password,
                captcha: userInfo.value.captcha
            });
            if (res.code == 200) {
                notification.success({
                    title: t('userInfo.registerSuccess2AutoLogin'),
                    duration: 3000,
                });
                gptServerStore.setMyData({
                    SERVICE_TOKEN: res.data.token
                })
                userStore.updateUserInfo(res.data.user)
                emit('loginSuccess')
            } else {
                notification.error({
                    title: res.msg,
                    duration: 3000,
                });
            }
        } else {
            notification.error({
                title: t('userInfo.captchaFormatNotCorrect'),
                duration: 3000,
            });
        }
    }
}

const validateEmail = (email?: string) => {
    if (email == null) {
        notification.error({
            title: t('userInfo.emailNotNull'),
            duration: 3000,
        });
        return false;
    }

    if (email.trim() === '') {
        notification.error({
            title: t('userInfo.emailNotNull'),
            duration: 3000,
        });
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        notification.error({
            title: t('userInfo.emailFormatNotCorrect'),
            duration: 3000,
        });
        return false;
    }
    return true;
}

const validatePassword = (password?: string) => {
    // 检查密码是否为空或null或undefined
    if (!password) {
        notification.error({
            title: t('userInfo.passwordNotNull'),
            duration: 3000,
        });
        return false;
    }

    if (password.trim() === '') {
        notification.error({
            title: t('userInfo.passwordNotNull'),
            duration: 3000,
        });
        return false;
    }

    // 密码长度至少为8位
    if (password.length < 8) {
        notification.error({
            title: t('userInfo.password8bit'),
            duration: 3000,
        });
        return false;
    }

    if (password.length > 32) {
        notification.error({
            title: t('userInfo.password32bit'),
            duration: 3000,
        });
        return false;
    }

    // 使用正则表达式检查密码格式
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;
    // const isValid = passwordRegex.test(password);
    // if (!isValid) {
    //     notification.error({
    //         title: t('userInfo.passwordFormatNotCorrect'),
    //         duration: 3000,
    //     });
    //     return false;
    // }
    return true;
}

const validateVerificationCode = (code?: string) => {
    if (code == null) {
        notification.error({
            title: t('userInfo.captchaNotNull'),
            duration: 3000,
        });
        return false;
    }
    const regex = /^\d{6}$/;
    return regex.test(code);
}

const getUserInfo = async () => {
    const res = await request.get('/api/app/user', null, {
        headers: {
            'Cache-Control': ' no-cache'
        }
    });
    if (res.code == 200) {
        userStore.updateUserInfo(res.data);
    } else if (res.code == 401 || res.code == 403) {
        // 401未授权，403 token 过期，都跳转到登录
        gptServerStore.setInit();
        userStore.resetUserInfo();
    } else {
        // 其他错误

    }
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file: File | undefined = target.files?.[0];
    if (file) {
        confirmUpload(file)
    }
};

const confirmUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/api/app/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    if (res.code == 200) {
        userStore.updateUserInfo({
            avatar: res.data
        });
        submitAvatar()
    } else {
        notification.error({
            title: res.msg ? res.msg : 'Internal Server Error',
            duration: 3000
        });
    }
}

const updateAvatar = (): void => {
    if (fileInput.value) {
        fileInput.value?.click();
    }
}

const updateNickname = () => {
    dialog.create({
        showIcon: false,
        title: t('userInfo.updateNickname'),
        style: {
            borderRadius: '20px'
        },
        content: () =>
            h('div', null, [
                h(NInput, {
                    value: nickName.value,
                    onUpdateValue: (value) => {
                        nickName.value = value;
                    },
                    placeholder: t('userInfo.inputNickname')
                })
            ]),
        positiveText: t('userInfo.confirm'),
        negativeText: t('userInfo.cancel'),
        onPositiveClick: () => {
            if (nickName.value && nickName.value.trim()) {
                submitNickname();
            } else {
                notification.warning({
                    title: t('userInfo.inputNickname')
                });
            }
        }
    })
}

const submitNickname = async () => {
    const res = await request.put('/api/app/user', {
        id: userInfo.value.id,
        avatar: userInfo.value.avatar,
        nickname: nickName?.value?.trim()
    });
    if (res.code == 200) {
        notification.success({
            title: t('userInfo.updateSuccess'),
            duration: 3000
        });
        userStore.updateUserInfo({
            nickname: nickName?.value?.trim()
        });
    } else {
        notification.warning({
            title: t('userInfo.updateFailure'),
            content: res.msg,
            duration: 3000
        });
    }
}

const submitAvatar = async () => {
    const res = await request.put('/api/app/user', {
        id: userInfo.value.id,
        avatar: userInfo.value.avatar,
    });
    if (res.code == 200) {
        notification.success({
            title: t('userInfo.updateAvatarSuccess'),
            duration: 3000
        });
        userStore.updateUserInfo({
            nickname: nickName?.value?.trim()
        });
    } else {
        notification.warning({
            title: t('userInfo.updateAvatarFailure'),
            content: res.msg,
            duration: 3000
        });
    }
}

const updateLanguage = (value: Language) => {
    appStore.setLanguage(value);
    setTimeout(() => {
        document.title = t('common.webTitle');
    }, 100)
}

onMounted(() => {
    getUserInfo();
})
</script>

<template>
    <div class="p-4 space-y-5 min-h-[200px] rounded-[20px]">
        <div class="space-y-6" v-if="gptServerStore.myData.SERVICE_TOKEN">
            <div class="flex items-center space-x-4 justify-start">
                <div class="text-[20px] mr-6">{{ $t('userInfo.chatCount') }}：
                    <n-tag type="primary" size="large" style="font-size:22px;font-weight: bold">{{ userInfo.chatCount
                        }}</n-tag>
                </div>
                <div class="text-[20px]">{{ $t('userInfo.drawCount') }}：
                    <n-tag type="primary" size="large" style="font-size:22px;font-weight: bold">{{ userInfo.drawCount
                        }}</n-tag>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
                <n-avatar round size="large" :src="userInfo.avatar"
                    fallback-src="https://deepimage.polo-e.net/applets/20240510/052220_26bfd6acdcacd555f4ecd7666c5941f.jpg" />
                <NButton size="tiny" type="primary" round @click="updateAvatar">
                    {{ $t('common.updateAvatar') }}
                </NButton>
                <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="handleFileChange">
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.nickname') }}</span>
                <n-tag v-if="userInfo.expireTime" type="success" round>
                    {{ userInfo.nickname }}
                </n-tag>
                <NButton size="tiny" type="primary" round @click="updateNickname">
                    {{ $t('common.updateNickname') }}
                </NButton>
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.email') }}</span>
                <n-tag type="success">
                    {{ userInfo.email }}
                </n-tag>
            </div>

            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.expireTime') }}</span>
                <n-tag v-if="userInfo.expireTime" type="warning" round>
                    {{ userInfo.expireTime }}
                </n-tag>
                <n-tag v-else type="warning" round>
                    {{ $t('userInfo.freeUser') }}
                </n-tag>
            </div>


            <!-- <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
                <div class="w-[200px]">
                <NInput v-model:value="name" placeholder="" />
                </div>
                <NButton size="tiny" text type="primary" @click="updateUserInfo({ name })">
                {{ $t('common.save') }}
                </NButton>
            </div> -->
            <!-- <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.description') }}</span>
                <div class="flex-1">
                <NInput v-model:value="description" placeholder="" />
                </div>
                <NButton size="tiny" text type="primary" @click="updateUserInfo({ description })">
                {{ $t('common.save') }}
                </NButton>
            </div> -->
            <div class="flex items-center space-x-4" :class="isMobile && 'items-start'">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.chatHistory') }}</span>

                <div class="flex flex-wrap items-center gap-4">
                    <NButton size="small" @click="exportData">
                        <template #icon>
                            <SvgIcon icon="ri:download-2-fill" />
                        </template>
                        {{ $t('common.export') }}
                    </NButton>

                    <!-- <input id="fileInput2" type="file" style="display:none" @change="importData">
                        <NButton size="small" @click="handleImportButtonClick">
                            <template #icon>
                            <SvgIcon icon="ri:upload-2-fill" />
                            </template>
                            {{ $t('common.import') }}
                        </NButton> -->

                    <NPopconfirm placement="bottom" @positive-click="clearData">
                        <template #trigger>
                            <NButton size="small">
                                <template #icon>
                                    <SvgIcon icon="ri:close-circle-line" />
                                </template>
                                {{ $t('common.clear') }}
                            </NButton>
                        </template>
                        {{ $t('chat.clearHistoryConfirm') }}
                    </NPopconfirm>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
                <div class="flex flex-wrap items-center gap-4">
                    <template v-for="item of themeOptions" :key="item.key">
                        <NButton size="small" :type="item.key === theme ? 'primary' : undefined"
                            @click="appStore.setTheme(item.key)">
                            <template #icon>
                                <SvgIcon :icon="item.icon" />
                            </template>
                        </NButton>
                    </template>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.language') }}</span>
                <div class="flex flex-wrap items-center gap-4">
                    <NSelect style="width: 140px" :value="language" :options="languageOptions"
                        @update-value="updateLanguage" />
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.resetUserInfo') }}</span>
                <NButton size="small" @click="handleReset">
                    {{ $t('common.reset') }}
                </NButton>
            </div>
        </div>
        <div v-else>
            <div v-if="showRegister">
                <div class="flex items-center space-x-4 mb-2">
                    <span class="flex-shrink-0 w-[100px]">{{ $t('setting.email') }}</span>
                    <div class="flex-1">
                        <NInput v-model:value="userInfo.email" :placeholder="$t('setting.plzEmail')" />
                    </div>
                </div>
                <div class="flex items-center space-x-4 mb-2">
                    <span class="flex-shrink-0 w-[100px]">{{ $t('setting.password') }}</span>
                    <div class="flex-1">
                        <NInput type="password" show-password-on="mousedown" v-model:value="userInfo.password"
                            :placeholder="$t('setting.plzPassword')" />
                    </div>
                </div>
                <div class="flex items-center space-x-4 mb-2">
                    <span class="flex-shrink-0 w-[100px]">{{ $t('setting.rePassword') }}</span>
                    <div class="flex-1">
                        <NInput v-model:value="userInfo.rePassword" :placeholder="$t('setting.plzPassword')" />
                    </div>
                </div>
                <div class="flex items-center space-x-4 mb-4">
                    <span class="flex-shrink-0 w-[100px]">{{ $t('setting.captcha') }}</span>
                    <div class="flex-1">
                        <NInput v-model:value="userInfo.captcha" :placeholder="$t('setting.plzCaptcha')" />
                    </div>
                    <NButton :disabled="isDisabled" size="tiny" text type="primary" @click="getCaptcha">
                        <!-- {{ $t('setting.getCaptcha') }} -->
                        {{ btnStr }}
                    </NButton>
                </div>
                <div class="flex flex-col justify-center items-center">
                    <NButton type="primary" @click="register">
                        {{ $t('setting.register') }}
                    </NButton>
                    <div class="h-4"></div>
                    <NButton text type="primary" @click="showRegister = false">
                        <span class="flex-shrink-0">{{ $t('setting.back') }}</span>
                    </NButton>
                </div>
            </div>
            <div v-else>
                <div class="flex items-center space-x-4 mb-2">
                    <span class="flex-shrink-0">{{ $t('setting.email') }}</span>
                    <div class="flex-1">
                        <NInput v-model:value="userInfo.email" :placeholder="$t('setting.plzEmail')" />
                    </div>
                </div>
                <div class="flex items-center space-x-4 mb-10">
                    <span class="flex-shrink-0">{{ $t('setting.password') }}</span>
                    <div class="flex-1">
                        <NInput type="password" show-password-on="mousedown" v-model:value="userInfo.password"
                            :placeholder="$t('setting.plzPassword')" />
                    </div>
                </div>
                <div class="flex flex-col justify-center items-center">
                    <NButton class="mb-4" type="primary" @click="login">
                        {{ $t('setting.login') }}
                    </NButton>
                    <div class="h-4"></div>
                    <NButton text type="primary" @click="showRegister = true">
                        <span class="flex-shrink-0">{{ $t('setting.noAccount') }}</span>
                    </NButton>
                </div>
            </div>
        </div>
    </div>
</template>
