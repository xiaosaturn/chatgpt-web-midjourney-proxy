import { createDiscreteApi } from 'naive-ui'

const { notification } = createDiscreteApi(['notification'])

const validateEmail = (email?: string) => {
    if (email == null) {
        notification.error({
            title: '邮箱不能为空',
            duration: 3000,
        });
        return false;
    }

    if (email.trim() === '') {
        notification.error({
            title: '邮箱不能为空',
            duration: 3000,
        });
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        notification.error({
            title: '邮箱地址格式不正确',
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
            title: '密码不能为空',
            duration: 3000,
        });
        return false;
    }

    if (password.trim() === '') {
        notification.error({
            title: '密码不能为空',
            duration: 3000,
        });
        return false;
    }

    // 密码长度至少为8位
    if (password.length < 8) {
        notification.error({
            title: '密码至少8位',
            duration: 3000,
        });
        return false;
    }

    if (password.length > 32) {
        notification.error({
            title: '密码不能超过32位',
            duration: 3000,
        });
        return false;
    }

    // 使用正则表达式检查密码格式，不校验这个了，要不麻烦
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;
    // const isValid = passwordRegex.test(password);
    // if (!isValid) {
    //     notification.error({
    //         title: '密码格式不符合要求，至少包含一个大写字母、一个小写字母、一个数字和一个特殊符号',
    //         duration: 3000,
    //     });
    //     return false;
    // }
    return true;
}

const validateVerificationCode = (code?: string) => {
    if (code == null) {
        notification.error({
            title: '验证码不能为空',
            duration: 3000,
        });
        return false;
    }
    const regex = /^\d{6}$/;
    return regex.test(code);
}

export {
    validateEmail,
    validatePassword,
    validateVerificationCode
}