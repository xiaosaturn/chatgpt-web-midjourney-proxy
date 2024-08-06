<template>
    <div
        class="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-6 shadow dark:border-slate-700 dark:bg-slate-800">
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <div class="relative inline-flex flex flex-col items-center">
                    <n-image :src="userInfo.avatar" alt="user"
                        class="h-20 w-20 rounded-full bg-slate-400 dark:border-slate-700 mb-2" />
                    <n-button @click="updateAvatar" type="primary" round>{{ $t('common.updateAvatar') }}</n-button>
                    <input type="file" ref="fileInput" accept="image/*" style="display: none;"
                        @change="handleFileChange">
                </div>
                <div class="ml-4 flex flex-col justify-between">
                    <div class="flex items-center mb-2">
                        <h3 class="text-xl font-bold text-slate-900 dark:text-slate-200 mr-2">
                            {{ userInfo.nickname }}
                        </h3>
                        <SvgIcon @click="updateNickname" class="text-lg" icon="lucide:edit" />
                    </div>

                    <span class="text-lg text-slate-400 mb-2">{{ userInfo.email }}</span>
                    <div>
                        <span v-if="userInfo.expireTime"
                            class="rounded-full bg-green-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-green-600">
                            {{ $t('setting.expireTime') }} {{ userInfo.expireTime }}
                        </span>
                        <span v-else
                            class="rounded-full bg-green-600/10 px-3 py-1 text-xs font-semibold leading-5 text-green-600">
                            {{ $t('userInfo.freeUser') }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div></div>
        <div class="flex items-center">
            <div class="text-[18px] font-bold">支付遇到问题，联系客服：</div>
            <div class="text-[28px] font-bold">mpcexiao@gmail.com</div>
        </div> -->
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, h, onMounted } from 'vue'
import { gptServerStore, useUserStore } from '@/store'
import { useNotification, NImage, NButton, NDialog, NInput, useDialog } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import request from '@/api/myAxios'
import { uploadFile } from '@/utils/uploadfile'
import { randomString } from '@/utils/common'
import { t } from '@/locales'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const notification = useNotification()
const dialog = useDialog()
const nickName = ref(userInfo.value.nickname)

const fileInput = ref<HTMLInputElement | null>(null);
const dialogVisible = ref(false)
const previewUrl = ref<string>('');
const fileBuffer = ref<ArrayBuffer | null>(null);

const go2WX = () => {
    const wxid = 'mengxinxianhai'; // 替换为实际的微信号
    // const qrCodeUrl = 'https://deepimage.polo-e.net/applets/20240724/093722_9110e21f6f0a55a537554c96dbe8812.jpg';
    const url = `weixin://contacts/profile/${wxid}`;
    // const url = `weixin://scanqrcode?qr=${encodeURIComponent(qrCodeUrl)}`;

    window.location.href = url;
}

const copyToClipboard = () => {
    const wxid = 'mengxinxianhai'; // 替换为实际的微信号
    navigator.clipboard.writeText(wxid).then(() => {
        notification.success({
            title: '复制客服微信成功，将为你跳转到微信',
            duration: 3000,
        });
        setTimeout(() => {
            go2WX();
        }, 1500)
    }).catch(err => {
        console.error('Error in copying text: ', err);
    });
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
    const res = await request.post('/app/upload', formData, {
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
            title: res.msg,
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
    const res = await request.put('/app/user', {
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
    const res = await request.put('/app/user', {
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

const getUserInfo = async () => {
    const res = await request.get('/app/user');
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

onMounted(() => {
    getUserInfo();
})
</script>
