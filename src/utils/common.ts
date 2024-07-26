/**
 * 生成随机字符串
 * @param { 包含的字符类型，1:大写字母，2:小写字母，3:数字，4:特殊符号，传值形式1或1,2或2等 } charType 
 * @param { 自定义字符，最终会以字符串形式传递 } customizeChar 
 * @param { 生成的随机字符串位数 } length 
 */
const randomString = (charType = '1,2,3', customizeChar = '', length = 8) => {
    if(isNullOrEmpty(charType)) {
        charType = '1,2,3'; // 默认大写字母、小写字母、数字组合
    }
    if (isNullOrEmpty(customizeChar)) {
        customizeChar = '';
    }
    if (isNullOrEmpty(length)) {
        length = 8; // 默认8位
    }
    const charTypeArr = charType.split(',');
    let strPool = customizeChar; // 初始值赋值为自定义字符
    charTypeArr.map(item => {
        strPool += charTypeMap[item];
    });
    let randomStr = "";
    const max = strPool.length - 1;
    for (let i = 0; i < length; i++) {
        randomStr += strPool.charAt(Math.floor(Math.random() * max));
    }
    return randomStr;
}


/**
 * 判断一个变量是否为空、空字符串、null、undefined
 * @param { 字符串值 } value 
 * @returns 
 */
const isNullOrEmpty = (value) => {
    if (!value || value === '' || value === undefined || value === null) {
        return true;
    }
    if (typeof value === 'string') {
        // string类型才进行trim()
        value = value.trim();
        if (value === '') {
            return true;
        }
    }
    return false;
}

const charTypeMap = {
    '1': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '2': 'abcdefghijklmnopqrstuvwxyz',
    '3': '0123456789',
    '4': '~!@#$%^&*()_+'
}

export {
    randomString,
    isNullOrEmpty
}
