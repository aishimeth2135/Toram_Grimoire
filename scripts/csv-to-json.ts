/**
 * One-time conversion script: reads all CSVs from data/ and writes
 * structured JSON to src/data/. Run with: yarn convert-data
 *
 * Keep this script for future re-syncs when CSVs are refreshed.
 */
import { readCsv, writeJson } from './utils'
import { convertStats, convertStatsLocale } from './converters/convertStats'
import { convertCharacterStats } from './converters/convertCharacterStats'
import { convertGlossary, convertGlossaryLocale } from './converters/convertGlossary'
import { convertQuest } from './converters/convertQuest'
import { convertCrystal } from './converters/convertCrystal'
import { convertPotion } from './converters/convertPotion'
import { convertRegistlet } from './converters/convertRegistlet'
import { convertEnchant } from './converters/convertEnchant'
import { convertEquipment, convertEquipmentLocale } from './converters/convertEquipment'
import { convertSkill } from './converters/convertSkill'
import { convertSkillMain, convertSkillMainLocale } from './converters/convertSkillMain'

function run() {
  console.log('\n=== CSV → JSON conversion ===\n')

  // Stats
  console.log('Stats...')
  const statsCsv = readCsv('stats.csv')
  writeJson('stats.json', convertStats(statsCsv))
  const statsEnCsv = readCsv('stats_lang_en.csv')
  if (statsEnCsv.length) writeJson('stats.en.json', convertStatsLocale(statsCsv, statsEnCsv))
  const statsZhCnCsv = readCsv('stats_lang_zh_cn.csv')
  if (statsZhCnCsv.length) writeJson('stats.zh_cn.json', convertStatsLocale(statsCsv, statsZhCnCsv))

  // Character Stats
  console.log('Character Stats...')
  writeJson('character_stats.json', convertCharacterStats(readCsv('character_stats.csv')))

  // Glossary
  console.log('Glossary...')
  const glossaryCsv = readCsv('glossary.csv')
  writeJson('glossary.json', convertGlossary(glossaryCsv))
  const glossaryEnCsv = readCsv('glossary_lang_en.csv')
  if (glossaryEnCsv.length) writeJson('glossary.en.json', convertGlossaryLocale(glossaryCsv, glossaryEnCsv))
  const glossaryJaCsv = readCsv('glossary_lang_ja.csv')
  if (glossaryJaCsv.length) writeJson('glossary.ja.json', convertGlossaryLocale(glossaryCsv, glossaryJaCsv))
  const glossaryZhCnCsv = readCsv('glossary_lang_zh_cn.csv')
  if (glossaryZhCnCsv.length) writeJson('glossary.zh_cn.json', convertGlossaryLocale(glossaryCsv, glossaryZhCnCsv))

  // Quest
  console.log('Quest...')
  writeJson('quest.json', convertQuest(readCsv('quest.csv')))

  // Crystal
  console.log('Crystal...')
  writeJson('crystal.json', convertCrystal(readCsv('crystal.csv')))

  // Potion
  console.log('Potion...')
  writeJson('potion.json', convertPotion(readCsv('potion.csv')))

  // Registlet
  console.log('Registlet...')
  writeJson('registlet.json', convertRegistlet(readCsv('registlet.csv')))

  // Enchant
  console.log('Enchant...')
  writeJson('enchant.json', convertEnchant(readCsv('enchant.csv')))

  // Equipment
  console.log('Equipment...')
  const equipmentCsv = readCsv('equipment.csv')
  writeJson('equipment.json', convertEquipment(equipmentCsv))
  const equipmentEnCsv = readCsv('equipment_lang_en.csv')
  if (equipmentEnCsv.length) writeJson('equipment.en.json', convertEquipmentLocale(equipmentCsv, equipmentEnCsv))

  // Skill
  console.log('Skill...')
  writeJson('skill.json', convertSkill(readCsv('skill.csv')))

  // Skill Main
  console.log('Skill Main...')
  const skillMainCsv = readCsv('skill_main.csv')
  writeJson('skill_main.json', convertSkillMain(skillMainCsv))
  const skillMainEnCsv = readCsv('skill_main_lang_en.csv')
  if (skillMainEnCsv.length) writeJson('skill_main.en.json', convertSkillMainLocale(skillMainCsv, skillMainEnCsv))
  const skillMainJaCsv = readCsv('skill_main_lang_ja.csv')
  if (skillMainJaCsv.length) writeJson('skill_main.ja.json', convertSkillMainLocale(skillMainCsv, skillMainJaCsv))
  const skillMainZhCnCsv = readCsv('skill_main_lang_zh_cn.csv')
  if (skillMainZhCnCsv.length) writeJson('skill_main.zh_cn.json', convertSkillMainLocale(skillMainCsv, skillMainZhCnCsv))

  console.log('\n=== Done ===\n')
}

run()
