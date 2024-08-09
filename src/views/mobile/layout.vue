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
                                <div class="box">
                                    <div class="content">
                                        <h1 class="title text-center">{{ $t('setting.login') }}</h1>
                                        <div>
                                            <input type="text" v-model="userInfo.email"
                                                :placeholder="$t('setting.plzEmail')" />
                                        </div>
                                        <div>
                                            <input v-model="userInfo.password" type="password"
                                                :placeholder="$t('setting.plzPassword')">
                                        </div>
                                        <div @click="handleLogin" class="login text-white text-center h-10 leading-10">
                                            <!-- <input type="submit" value="登录"> -->
                                            {{ $t('setting.login') }}
                                        </div>
                                    </div>
                                    <!-- <div href="#" class="btns">忘记密码</div> -->
                                    <div @click="showRegister = true" class="btns register">{{ $t('setting.register')
                                        }}</div>
                                </div>
                                <!-- <h1 class="title text-center">{{ $t('setting.login') }}</h1>
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
                                </div> -->
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
    console.log('useriemail:', userInfo.value.email)
    return;
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

    .box {
        position: relative;
        display: flex;
        justify-content: space-between;
        margin: 20px auto;
    }

    .content {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        width: 350px;
        height: 350px;
        padding: 60px 20px;
        box-shadow: inset 20px 20px 20px rgba(0, 0, 0, 0.05),
            25px 35px 20px rgba(0, 0, 0, 0.05), 25px 30px 30px rgba(0, 0, 0, 0.05),
            inset -20px -20px 25px rgba(255, 255, 255, 0.9);
    }

    .content {
        border-radius: 52% 48% 33% 67% / 38% 45% 55% 62%;
        transition: 0.5s;
    }

    .content:hover {
        border-radius: 50%;
    }

    .content::before {
        content: "";
        position: absolute;
        top: 50px;
        left: 85px;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: #fff;
        opacity: 0.9;
    }

    .content::after {
        content: "";
        position: absolute;
        top: 90px;
        left: 110px;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: #fff;
        opacity: 0.9;
    }

    .box .content div {
        position: relative;
        width: 225px;
        border-radius: 25px;
        box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.1),
            inset -2px -5px 10px rgba(255, 255, 255, 1),
            15px 15px 10px rgba(0, 0, 0, 0.05), 15px 10px 15px rgba(0, 0, 0, 0.025);
    }

    .box .content div::before {
        content: "";
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 65%;
        height: 5px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 5px;
    }

    // :deep(.n-input__input-el) {
    //     width: 100%;
    //     border: none;
    //     outline: none;
    //     background: transparent;
    //     font-size: 16px;
    //     padding: 10px 15px;
    // }

    .box .content input {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        font-size: 16px;
        padding: 10px 15px;
    }

    .box .content input[type="submit"] {
        color: #fff;
        cursor: pointer;
    }

    .box .content .login {
        width: 120px;
        background: #ff0f5b;
        box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.1),
            15px 15px 10px rgba(0, 0, 0, 0.05), 15px 10px 15px rgba(0, 0, 0, 0.025);
        transition: 0.5s;
    }

    .box .content div:last-child:hover {
        width: 150px;
    }

    .btns {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 80px;
        height: 80px;
        background: #c61dff;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        text-decoration: none;
        color: #fff;
        font-size: 14px;
        box-shadow: inset 10px 10px 10px rgba(190, 1, 254, 0.05),
            15px 25px 10px rgba(190, 1, 254, 0.1), 15px 20px 20px rgba(190, 1, 254, 0.1),
            inset -10px -10px 15px rgba(255, 255, 255, 0.5);
        border-radius: 44% 56% 65% 35% / 57% 58% 42% 43%;
    }

    .register {
        bottom: 0px;
        left: 10px;
        width: 80px;
        height: 80px;
        border-radius: 49% 51% 52% 48% / 63% 59% 41% 37%;
        background: #01b4ff;
        box-shadow: inset 10px 10px 10px rgba(1, 180, 255, 0.05),
            15px 25px 10px rgba(1, 180, 255, 0.1), 15px 20px 20px rgba(1, 180, 255, 0.1),
            inset -10px -10px 15px rgba(255, 255, 255, 0.5);
    }

    .btns::before {
        content: "";
        position: absolute;
        top: 15px;
        left: 30px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        opacity: 0.45;
    }

    .register::before {
        left: 20px;
        width: 15px;
        height: 15px;
    }

    .btns {
        transition: 0.25s;
    }

    .btns:hover {
        border-radius: 50%;
    }
}
</style>