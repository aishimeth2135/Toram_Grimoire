export const enum DataPathIds {
  Skill = 0,
  SkillMain = 1,
  Stats = 2,
  CharacterStats = 3,
  Glossary = 4,
  Equipment = 5,
  Crystal = 6,
  Enchant = 7,
  Registlet = 8,
  Potion = 9,
}

function DataPath(id: DataPathIds): string {
  switch (id) {
    case DataPathIds.Skill:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=A:Q'
    case DataPathIds.SkillMain:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=A:D'
    case DataPathIds.Stats:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=616452461&single=true&output=csv&range=A:F'
    case DataPathIds.CharacterStats:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHrEp60Q4BFKM2yI09FyJWZFKnxif0oZfTkWiXXL-7am6BWoAtN___hxKtFDkbofflHQgrON74qOdk/pub?gid=0&single=true&output=csv&range=A:I'
    case DataPathIds.Glossary:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=A:C'
    case DataPathIds.Equipment:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=0&single=true&output=csv&range=A:I'
    case DataPathIds.Crystal:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=1665548440&single=true&output=csv&range=A:E'
    case DataPathIds.Enchant:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4beI9I-sFoTgbTaKeMHRVo3xNm3gc5nQ-MWb9u7dlzRk0QmnMoJwcaR0815IqP0t-9-htpS8mUdQ1/pub?gid=0&single=true&output=csv&range=A:M'
    case DataPathIds.Registlet:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1113738876&single=true&output=csv&range=A:I'
    case DataPathIds.Potion:
      return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=1555730463&single=true&output=csv&range=A:E'
  }
}

function DataPathLang(id: DataPathIds): (string | null)[] {
  /**
   * order of language: [en, zh_tw, ja, zh_cn]
   */
  switch (id) {
    case DataPathIds.Skill:
      return [
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=R:R',
        null,
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=S:S',
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=T:T',
      ]
    case DataPathIds.SkillMain:
      return [
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=F:F',
        null,
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=G:G',
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=H:H',
      ]
    case DataPathIds.Stats:
      return [
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1353062937&single=true&output=csv&range=B:C',
        null,
        null,
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1353062937&single=true&output=csv&range=F:G',
      ]
    case DataPathIds.CharacterStats:
      return [null, null, null, null]
    case DataPathIds.Glossary:
      return [
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=D:E',
        null,
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=F:G',
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=H:I',
      ]
  }
  return []
}

export { DataPath, DataPathLang }
