import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { gptServerStore, useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

// 移动端自适应相关
const { isMobile } = useBasicLayout()


// 定义请求配置的接口
interface RequestConfig extends AxiosRequestConfig {
    retryTimes?: number;
    headers?: {}
}

// 定义响应数据的接口
interface ResponseData<T = any> {
    code: number;
    msg: string;
    data: T;
}

// 创建axios实例
const instance: AxiosInstance = axios.create({
    baseURL: '',
    timeout: 10000, // 10秒
    headers: {
        'Content-Type': 'application/json',
    }
});

// 用于存储请求的Map
const pendingRequests = new Map<string, AbortController>();

// 生成请求的唯一key
const generateRequestKey = (config: AxiosRequestConfig): string => {
    const { method, url, params, data } = config;
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
};

// 添加请求拦截器
instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // 获取token并添加到请求头
        config.headers = config.headers || {};
        config.headers['Authorization'] = gptServerStore.myData.SERVICE_TOKEN;
        
        console.log('gptServerStore.myData.SERVICE_TOKEN:', gptServerStore.myData.SERVICE_TOKEN)
        console.log('request header:', config.headers)
        // 生成请求key
        const requestKey = generateRequestKey(config);

        // 如果存在相同的请求，则取消之前的请求
        if (pendingRequests.has(requestKey)) {
            const controller = pendingRequests.get(requestKey);
            controller?.abort();
            pendingRequests.delete(requestKey);
        }

        // 创建新的AbortController并存储
        const controller = new AbortController();
        config.signal = controller.signal;
        pendingRequests.set(requestKey, controller);

        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// 添加响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        // 从pendingRequests中移除已完成的请求
        const requestKey = generateRequestKey(response.config);
        pendingRequests.delete(requestKey);

        return response;
    },
    (error: any) => {
        // 从pendingRequests中移除已完成的请求
        if (error.config) {
            const requestKey = generateRequestKey(error.config);
            pendingRequests.delete(requestKey);
        }

        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
        } else if (error.response) {
            // 处理响应错误
            return Promise.resolve(error.response)
            switch (error.response.status) {
                case 401:
                    // 处理未授权错误，例如跳转到登录页
                    if (isMobile) {
                        window.location.href = '/moblie/me'
                    }
                    break;
                case 404:
                    // 处理not found错误
                    break;
                default:
                    console.error('API error:', error.response.data);
            }
        } else if (error.request) {
            // 请求已经发出，但没有收到响应
            console.error('No response received:', error.request);
        } else {
            // 发送请求时出了点问题
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// 定义请求方法的接口
interface RequestMethods {
    get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>>;
    post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>;
    put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>;
    delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>>;
}

// 封装请求方法
const request: RequestMethods = {
    async get<T>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const response = await instance.get<ResponseData<T>>(url, { params, ...config });
        console.log('response,', response);
        return response.data;
    },
    async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const response = await instance.post<ResponseData<T>>(url, data, config);
        return response.data;
    },
    async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const response = await instance.put<ResponseData<T>>(url, data, config);
        return response.data;
    },
    async delete<T>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const response = await instance.delete<ResponseData<T>>(url, { params, ...config });
        return response.data;
    }
};

export default request;
