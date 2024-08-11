<template>
    <div class="font-sans">
        <!-- 导航栏 -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex justify-between">
                    <div class="flex space-x-7">
                        <div>
                            <a href="#" class="flex items-center py-4">
                                <img src="path/to/all-ai-chat-logo.png" alt="All-AI.chat Logo" class="h-8 w-auto mr-2">
                            </a>
                        </div>
                    </div>
                    <div class="hidden md:flex items-center space-x-4">
                        <a v-for="item in navItems" :key="item" :href="'#' + item"
                            class="py-2 px-3 text-gray-700 hover:text-pink-500 transition duration-300">{{ $t('nav.' +
                            item) }}</a>
                        <a href="#"
                            class="py-2 px-3 bg-pink-500 text-white rounded hover:bg-pink-600 transition duration-300">{{
                            $t('nav.signup') }}</a>
                    </div>
                </div>
            </div>
        </nav>

        <!-- 英雄区域 -->
        <div class="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <div class="max-w-6xl mx-auto px-4 py-16 md:py-24">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold mb-4">{{ $t('hero.title') }}</h1>
                    <p class="text-xl md:text-2xl mb-8">{{ $t('hero.subtitle') }}</p>
                    <a href="#"
                        class="bg-white text-pink-500 py-3 px-6 rounded-full text-lg font-semibold hover:bg-pink-100 transition duration-300">{{
                            $t('hero.cta') }}</a>
                </div>
            </div>
        </div>

        <!-- 主要服务 -->
        <div class="max-w-6xl mx-auto px-4 py-16">
            <h2 class="text-3xl font-bold text-center mb-12">{{ $t('services.title') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div v-for="service in services" :key="service.name" class="bg-white rounded-lg shadow-md p-6">
                    <div class="text-pink-500 text-3xl mb-4">
                        <i :class="service.icon"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">{{ $t('services.' + service.name + '.title') }}</h3>
                    <p class="text-gray-600">{{ $t('services.' + service.name + '.description') }}</p>
                </div>
            </div>
        </div>

        <!-- 优势 -->
        <div class="bg-gray-100">
            <div class="max-w-6xl mx-auto px-4 py-16">
                <h2 class="text-3xl font-bold text-center mb-12">{{ $t('advantages.title') }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div v-for="(advantage, index) in advantages" :key="index"
                        class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-pink-500 text-3xl mb-4">
                            <i :class="advantage.icon"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">{{ $t('advantages.' + advantage.key + '.title') }}</h3>
                        <p class="text-gray-600">{{ $t('advantages.' + advantage.key + '.description') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 比较 -->
        <div class="max-w-6xl mx-auto px-4 py-16">
            <h2 class="text-3xl font-bold text-center mb-12">{{ $t('comparison.title') }}</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th
                                class="py-4 px-6 bg-gray-100 font-bold uppercase text-sm text-gray-600 border-b border-gray-200">
                                {{ $t('comparison.feature') }}</th>
                            <th
                                class="py-4 px-6 bg-gray-100 font-bold uppercase text-sm text-gray-600 border-b border-gray-200">
                                All-AI.chat</th>
                            <th
                                class="py-4 px-6 bg-gray-100 font-bold uppercase text-sm text-gray-600 border-b border-gray-200">
                                {{ $t('comparison.others') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(feature, index) in comparisonFeatures" :key="index">
                            <td class="py-4 px-6 border-b border-gray-200">{{ $t('comparison.features.' + feature) }}
                            </td>
                            <td class="py-4 px-6 border-b border-gray-200 text-pink-500"><i class="fas fa-check"></i>
                            </td>
                            <td class="py-4 px-6 border-b border-gray-200 text-gray-500"><i class="fas fa-times"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 定价 -->
        <div class="bg-gray-100">
            <div class="max-w-6xl mx-auto px-4 py-16">
                <h2 class="text-3xl font-bold text-center mb-12">{{ $t('pricing.title') }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div v-for="plan in pricingPlans" :key="plan.name" class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-xl font-semibold mb-2">{{ $t('pricing.' + plan.name + '.title') }}</h3>
                        <p class="text-3xl font-bold text-pink-500 mb-4">{{ plan.price }}</p>
                        <ul class="mb-6">
                            <li v-for="(feature, index) in plan.features" :key="index" class="mb-2 flex items-center">
                                <i class="fas fa-check text-pink-500 mr-2"></i>
                                {{ $t('pricing.' + plan.name + '.features.' + index) }}
                            </li>
                        </ul>
                        <a href="#"
                            class="block text-center bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition duration-300">{{
                            $t('pricing.selectPlan') }}</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- 注册表单 -->
        <div class="bg-pink-500 text-white">
            <div class="max-w-4xl mx-auto px-4 py-16">
                <h2 class="text-3xl font-bold text-center mb-8">{{ $t('signup.title') }}</h2>
                <form @submit.prevent="handleSubmit" class="bg-white text-gray-800 rounded-lg p-8 shadow-lg">
                    <div class="mb-4">
                        <label for="email" class="block mb-2 font-semibold">{{ $t('signup.email') }}</label>
                        <input type="email" id="email" v-model="email" required class="w-full px-3 py-2 border rounded">
                    </div>
                    <div class="mb-6">
                        <label for="password" class="block mb-2 font-semibold">{{ $t('signup.password') }}</label>
                        <input type="password" id="password" v-model="password" required
                            class="w-full px-3 py-2 border rounded">
                    </div>
                    <button type="submit"
                        class="w-full bg-pink-500 text-white py-3 rounded font-semibold hover:bg-pink-600 transition duration-300">{{
                            $t('signup.submit') }}</button>
                </form>
            </div>
        </div>

        <!-- 页脚 -->
        <footer class="bg-gray-800 text-white">
            <div class="max-w-6xl mx-auto px-4 py-8">
                <div class="flex flex-wrap justify-between">
                    <div class="w-full md:w-1/3 mb-6 md:mb-0">
                        <h3 class="text-xl font-semibold mb-2">{{ $t('footer.about.title') }}</h3>
                        <p class="text-gray-400">{{ $t('footer.about.description') }}</p>
                    </div>
                    <div class="w-full md:w-1/3 mb-6 md:mb-0">
                        <h3 class="text-xl font-semibold mb-2">{{ $t('footer.contact.title') }}</h3>
                        <p class="text-gray-400">{{ $t('footer.contact.email') }}</p>
                        <p class="text-gray-400">{{ $t('footer.contact.phone') }}</p>
                    </div>
                    <div class="w-full md:w-1/3">
                        <h3 class="text-xl font-semibold mb-2">{{ $t('footer.follow.title') }}</h3>
                        <div class="flex space-x-4">
                            <a v-for="social in socialMedia" :key="social" :href="'#' + social"
                                class="text-gray-400 hover:text-white transition duration-300">
                                <i :class="'fab fa-' + social"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="mt-8 text-center text-gray-400">
                    <p>{{ $t('footer.copyright') }}</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const advantages = [
    { icon: 'fas fa-brain', title: '先进的AI模型', description: '提供准确、相关的回答' },
    { icon: 'fas fa-user-cog', title: '个性化体验', description: '根据用户偏好定制对话' },
    { icon: 'fas fa-globe', title: '多领域专业知识', description: '涵盖广泛的主题和行业' },
    { icon: 'fas fa-shield-alt', title: '安全可靠', description: '保护用户隐私和数据安全' },
]

const features = [
    { icon: 'fas fa-comments', title: '实时对话', description: '即时获得AI回应' },
    { icon: 'fas fa-language', title: '多语言支持', description: '支持全球用户' },
    { icon: 'fas fa-lightbulb', title: '上下文理解', description: '保持连贯的对话流' },
    { icon: 'fas fa-sync', title: '持续学习', description: 'AI不断更新和改进' },
]

const reviews = [
    { avatar: 'path/to/avatar1.jpg', name: '张三', position: '企业家', comment: 'All-AI.chat 彻底改变了我们的客户服务体验。强烈推荐！' },
    { avatar: 'path/to/avatar2.jpg', name: '李四', position: '学生', comment: '作为学习助手，All-AI.chat 帮助我更好地理解复杂概念。' },
    { avatar: 'path/to/avatar3.jpg', name: '王五', position: '研究员', comment: 'All-AI.chat 的多领域知识给我的研究带来了新的视角。' },
]

const handleSubmit = () => {
    // 处理表单提交逻辑
    console.log('提交的邮箱:', email.value)
    console.log('提交的密码:', password.value)
    // 这里可以添加实际的注册逻辑
}

</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
</style>
