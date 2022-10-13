import { useI18n } from 'vue-i18n'

import { EnchantEquipment } from '@/lib/Enchant/Enchant'

export function getSuccessRateDisplay(eq: EnchantEquipment) {
  const { t } = useI18n()
  const rate = eq.successRate
  return rate === -1
    ? t('enchant-simulator.success-rate-unlimited')
    : Math.floor(rate) + '%'
}
