import { createI18n } from 'vue-i18n'
import { chinese } from './lang/zh'
import { english } from './lang/en'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': chinese,
    'en-US': english,
  },
})

export const t = i18n.global.t

export default i18n
