/**
 * 腾讯COS相关操作
 */
import COS from 'cos-nodejs-sdk-v5'

const cos = new COS({
    SecretId: process.env.COS_SECRETID, // 腾讯云账号 SecretId
    SecretKey: process.env.COS_SECRETKEY, // 腾讯云账号 SecretKey
})

cos.putBucketAcl({
    Bucket: 'xiaosaturn-1254446013', /* 必须 */
    Region: 'ap-nanjing',    /* 必须 */
    ACL: 'public-read'
}, function (err, data) {
    
});

export {
    cos
}