import { InitLanguageData } from '@/shared/services/Language'

import en from './LanguageData/en.js'
import ja from './LanguageData/ja.js'
import zh_cn from './LanguageData/zh_cn.js'
import zh_tw from './LanguageData/zh_tw.js'

export default function(){
  InitLanguageData({ zh_tw, en, ja, zh_cn })
}
