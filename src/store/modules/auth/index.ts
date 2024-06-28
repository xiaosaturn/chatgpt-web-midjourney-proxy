import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from './helper'
import { store } from '@/store/helper'
import { fetchSession } from '@/api'
import { gptConfigStore, homeStore } from '@/store/homeStore'
import { useAppStore } from '@/store'
const appStore = useAppStore()
interface SessionResponse {
  theme?: string
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<SessionResponse>()
        // const data = {
        //   theme: "light",
        //   auth: false,
        //   model: "ChatGPTAPI",
        //   "disableGpt4": "",
        //   "isWsrv": "",
        //   "uploadImgSize": "1",
        //   "isCloseMdPreview": false,
        //   "notify": "",
        //   "baiduId": "",
        //   "googleId": "",
        //   "isHideServer": false,
        //   "isUpload": false,
        //   "amodel": "gpt-3.5-turbo",
        //   "isApiGallery": false,
        //   "cmodels": "",
        //   "isUploadR2": false,
        //   "gptUrl": "",
        //   "menuDisable": "",
        //   "visionModel": "",
        //   "systemMessage": "",
        //   "customVisionModel": ""
        // }
        this.session = {
          theme: "light",
          auth: false,
          model: "ChatGPTAPI",
        }

        homeStore.setMyData({ session: data });
        if (appStore.$state.theme == 'auto') {
          appStore.setTheme(data.theme && data.theme == 'light' ? 'light' : 'dark')
        }

        let str = localStorage.getItem('gptConfigStore');
        if (!str) setTimeout(() => gptConfigStore.setInit(), 500);
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
