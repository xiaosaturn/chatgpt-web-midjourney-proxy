<template>
    <div class="dark:bg-[#24272e] transition-all p-0" :class="[isMobile ? 'h55' : 'h-full']">
        <div class="h-full overflow-hidden" :class="getMobileClass">
            <NLayout class="z-40 transition" :class="getContainerClass" has-sider>
                <NLayoutContent class="h-full">
                    <div class="register-container flex flex-col justify-center">
                        <h1 class="title text-center ">注册账号</h1>
                        <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="top">
                            <n-form-item label="邮箱" path="email">
                                <n-input v-model:value="formModel.email" placeholder="请输入邮箱" />
                            </n-form-item>
                            <n-form-item label="密码" path="password">
                                <n-input v-model:value="formModel.password" type="password" placeholder="请输入密码"
                                    show-password-on="click" />
                            </n-form-item>
                            <n-form-item label="确认密码" path="confirmPassword">
                                <n-input v-model:value="formModel.confirmPassword" type="password"
                                    placeholder="请再次输入密码" show-password-on="click" />
                            </n-form-item>
                            <n-form-item label="验证码" path="verificationCode">
                                <n-input-group>
                                    <n-input v-model:value="formModel.verificationCode" placeholder="请输入验证码" />
                                    <n-button :disabled="isCountingDown" @click="sendVerificationCode"
                                        :loading="isCountingDown">
                                        {{ countDownText }}
                                    </n-button>
                                </n-input-group>
                            </n-form-item>
                        </n-form>
                        <n-button type="primary" block @click="handleRegister"
                            :disabled="isSubmitting">注册</n-button>
                        <div class="login-link">
                            已有账号？<n-button text @click="goToLogin">立即登录</n-button>
                        </div>
                    </div>
                </NLayoutContent>
            </NLayout>
        </div>
    </div>
    <aiMobileMenu />
</template>

<script lang="ts" setup>
import aiMobileMenu from '@/views/mj/aiMobileMenu.vue';
import { useBasicLayout } from '@/hooks/useBasicLayout';
import { NLayout, NLayoutContent, NCard, NButton, NForm, NInput, useMessage, darkTheme } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { debounce } from 'lodash-es'

const { isMobile } = useBasicLayout()
const theme = ref(null) // 如果需要暗色主题，可以设置为 darkTheme
const message = useMessage()

const formRef = ref(null)
const formModel = ref({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
})

const rules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            validator: (rule, value) => value === formModel.value.password,
            message: '两次输入的密码不一致',
            trigger: 'blur'
        }
    ],
    verificationCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { length: 6, message: '验证码长度应为6位', trigger: ['blur', 'change'] }
    ]
}

const isSubmitting = ref(false)
const handleRegister = debounce(() => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    formRef.value?.validate((errors) => {
        if (!errors) {
            message.success('注册成功')
            // 这里可以添加注册逻辑
        } else {
            message.error('请填写正确的信息')
        }
        isSubmitting.value = false
    })
}, 300)

const goToLogin = () => {
    // 跳转到登录页面的逻辑
}

const countDown = ref(0)
const isCountingDown = computed(() => countDown.value > 0)
const countDownText = computed(() => isCountingDown.value ? `${countDown.value}s后重新发送` : '发送验证码')

const sendVerificationCode = debounce(() => {
    if (isCountingDown.value) return
    // 这里可以添加发送验证码的逻辑
    message.success('验证码已发送')
    countDown.value = 60
    const timer = setInterval(() => {
        countDown.value--
        if (countDown.value === 0) {
            clearInterval(timer)
        }
    }, 1000)
}, 300)
</script>

<style lang="scss" scoped>
.container {
    .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
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
        margin-top: 24px;
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