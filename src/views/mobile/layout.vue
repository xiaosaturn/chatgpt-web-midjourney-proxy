<template>
    <div class="container dark:bg-[#24272e] transition-all p-0" :class="[isMobile ? 'h55' : 'h-full']">
        <div class="h-full overflow-hidden">
            <NLayout class="z-40 transition" has-sider>
                <NLayoutContent class="h-full">
                    <div v-if="userInfo.id" class="pt-[40px] flex flex-col justify-center items-center"
                        style="overflow: scroll;">
                        <UserInfo />
                    </div>
                    <template v-else>
                        <div v-if="showRegister" class="register-container flex flex-col items-center">
                            <n-space vertical>
                                <h1 class="title text-center">{{ $t('setting.register') }}</h1>
                                <n-form ref="formRef" inline :model="formModel" :rules="rules" label-placement="top">
                                    <n-space vertical>
                                        <n-form-item :label="$t('setting.email')" path="email">
                                            <n-input v-model:value="userInfo.email"
                                                :placeholder="$t('setting.plzEmail')" />
                                        </n-form-item>
                                        <n-form-item :label="$t('password')" path="password">
                                            <n-input v-model:value="userInfo.password" type="password"
                                                :placeholder="$t('setting.plzPassword')" show-password-on="click" />
                                        </n-form-item>
                                        <n-form-item :label="$t('setting.confirmPassword')" path="confirmPassword">
                                            <n-input v-model:value="userInfo.rePassword" type="password"
                                                :placeholder="$t('setting.rePassword')" show-password-on="click" />
                                        </n-form-item>
                                        <n-form-item :label="$t('setting.captcha')" path="verificationCode">
                                            <div class="flex justify-between">
                                                <n-space>
                                                    <n-input v-model:value="userInfo.captcha"
                                                        :placeholder="$t('setting.plzCaptcha')" />
                                                    <n-button :disabled="isCountingDown" type="primary"
                                                        @click="sendVerificationCode">
                                                        {{ countDownText }}
                                                    </n-button>
                                                </n-space>
                                            </div>
                                        </n-form-item>
                                    </n-space>
                                </n-form>
                                <n-button type="primary" block @click="handleRegister" :disabled="isSubmitting"
                                    size="large">{{ $t('setting.register') }}</n-button>
                                <div class="login-link">
                                    {{ $t('setting.haveAccount') }}<n-button text @click="showRegister = false"
                                        color="#2080f0">{{ $t('setting.nowLogin') }}</n-button>
                                </div>
                            </n-space>
                        </div>
                        <div v-else class="register-container flex flex-col items-center">
                            <n-space vertical>
                                <h1 class="title text-center">{{ $t('setting.login') }}</h1>
                                <n-form ref="formRef2" inline :model="formModel" :rules="rules" label-placement="top">
                                    <n-space vertical>
                                        <n-form-item :label="$t('setting.email')" path="email">
                                            <n-input v-model:value="userInfo.email"
                                                :placeholder="$t('setting.plzEmail')" />
                                        </n-form-item>
                                        <n-form-item :label="$t('setting.password')" path="password">
                                            <n-input v-model:value="userInfo.password" type="password"
                                                :placeholder="$t('setting.plzPassword')" show-password-on="click" />
                                        </n-form-item>
                                    </n-space>
                                </n-form>
                                <n-button type="primary" block @click="handleLogin" :disabled="isSubmitting"
                                    size="large">{{ $t('setting.login') }}</n-button>
                                <div class="login-link">
                                    {{ $t('setting.noAccount2') }}<n-button text @click="showRegister = true"
                                        color="#2080f0">{{ $t('setting.nowRegister') }}</n-button>
                                </div>
                            </n-space>
                        </div>
                    </template>
                </NLayoutContent>
            </NLayout>
        </div>
    </div>
    <aiMobileMenu />
</template>

<script lang="ts" setup>
import aiMobileMenu from '@/views/mj/aiMobileMenu.vue';
import { useBasicLayout } from '@/hooks/useBasicLayout';
import { NLayout, NLayoutContent, NCard, NButton, NForm, NInput, useMessage, useNotification, darkTheme, NSpace } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { useAppStore, useUserStore, gptServerStore } from '@/store'
import request from '@/api/myAxios'
import { validateEmail, validatePassword, validateVerificationCode } from '@/utils/validator'
import UserInfo from './userInfo.vue'
import { t } from '@/locales'

const userStore = useUserStore()
const { isMobile } = useBasicLayout()
const theme = ref(null) // 如果需要暗色主题，可以设置为 darkTheme
const message = useMessage()
const notification = useNotification()
const showRegister = ref(false)
const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const formModel = ref({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
})

const { isLogin } = route.params as { isLogin: boolean }

const userInfo = computed(() => userStore.userInfo)
let timer: any;
let isDisabled = ref(false)
let btnStr = ref(t('userInfo.sendCode'))

const rules = {
    email: [
        { required: true, message: t('setting.plzEmail'), trigger: 'blur' },
        { type: 'email', message: t('userInfo.emailFormatNotCorrect'), trigger: 'blur' }
    ],
    password: [
        { required: true, message: t('setting.plzPassword'), trigger: 'blur' },
        { min: 8, message: t('userInfo.password8bit'), trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: t('setting.plzPassword'), trigger: 'blur' },
        {
            validator: (rule, value) => value === formModel.value.password,
            message: t('userInfo.twoNotSame'),
            trigger: 'blur'
        }
    ],
    verificationCode: [
        { required: true, message: t('setting.plzCaptcha'), trigger: 'blur' },
        { length: 6, message: t('userInfo.captchaFormatNotCorrect'), trigger: ['blur', 'change'] }
    ]
}

const isSubmitting = ref(false)
const handleRegister = debounce(() => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    formRef.value?.validate((errors) => {
        if (!errors) {
            realRegister()
        } else {
            message.error('请填写正确的信息')
        }
        isSubmitting.value = false
    })
}, 300)

const realRegister = async () => {
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
                // emit('loginSuccess')
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
const goToLogin = () => {
    // 跳转到登录页面的逻辑

}

const countdown = ref(0)
const isCountingDown = computed(() => countdown.value > 0)
const countDownText = computed(() => isCountingDown.value ? `${countdown.value}s` : t('userInfo.sendCode'))

// const sendVerificationCode = debounce(() => {
//     if (isCountingDown.value) return
//     // 这里可以添加发送验证码的逻辑
//     message.success('验证码已发送')
//     countDown.value = 60
//     const timer = setInterval(() => {
//         countDown.value--
//         if (countDown.value === 0) {
//             clearInterval(timer)
//         }
//     }, 1000)
// }, 300)

const handleLogin = async () => {
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
            // emit('loginSuccess')
        } else {
            notification.error({
                title: res.msg,
                duration: 3000,
            });
        }
    }
}

const sendVerificationCode = async () => {
    const isEmail = validateEmail(userInfo.value.email)
    if (!isEmail) {
        return
    }
    countdown.value = 60;
    const res = await request.get('/api/app/user/captcha', {
        email: userInfo.value.email
    });
    if (res.code == 200) {
        if (timer != null) {
            return
        } else {
            timer = setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    clearInterval(timer);
                    timer = null;
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
}

onMounted(() => {

})

</script>

<style lang="scss" scoped>
.container {
    .register-container {
        padding: 60px 20px;
        display: flex;
        // justify-content: center;
        // align-items: center;
        min-height: 100vh;
        background-color: #f5f7fa;
        font-size: 16px;
    }

    .register-card {
        width: 90%;
        max-width: 400px;
        padding: 20px;
    }

    .title {
        text-align: center;
        font-size: 32px;
        margin-bottom: 32px;
        color: #2080f0;
        font-weight: bold;
    }

    .login-link {
        margin-top: 20px;
        text-align: center;
        font-size: 14px;
        color: #606266;
    }

    :deep(.n-form-item) {
        margin-bottom: 24px;
    }

    :deep(.n-input) {
        font-size: 16px;
    }

    :deep(.n-button) {
        font-size: 16px;
    }

    :deep(.n-form-item-label) {
        font-size: 16px;
        color: #303133;
    }
}
</style>