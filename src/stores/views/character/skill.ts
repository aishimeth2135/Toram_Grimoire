import Papa from 'papaparse'
import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { Ref } from 'vue'

import { LevelSkillTree, SkillRoot, SkillTree, SkillTreeCategory } from '@/lib/Skill/Skill'

const enum CsvSkillElementTypes {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  SkillRoot = 'skillRoot',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  SkillTreeCategory = 'skillTreeCategory',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  SkillTree = 'skillTree',
  LevelSkill = 'levelSkill',
}

const SAVE_CSV_CONFIG = {
  type: {
    [CsvSkillElementTypes.SkillRoot]: 0,
    [CsvSkillElementTypes.SkillTreeCategory]: 1,
    [CsvSkillElementTypes.SkillTree]: 2,
    [CsvSkillElementTypes.LevelSkill]: 3,
  },
  index: {
    type: 0,
    [CsvSkillElementTypes.SkillRoot]: {
      name: 1,
    },
    [CsvSkillElementTypes.SkillTreeCategory]: {
      id: 1,
    },
    [CsvSkillElementTypes.SkillTree]: {
      id: 1,
    },
    [CsvSkillElementTypes.LevelSkill]: {
      id: 1,
      level: 2,
      starGemLevel: 3,
    },
  },
}

interface SkillBuildState {
  stateId: number;
  name: string;
  origin: SkillRoot;
  skillTreeCategoryStates: SkillTreeCategoryState[];
}

interface SkillTreeCategoryState {
  origin: SkillTreeCategory;
  visible: boolean;
  skillTreeStates: SkillTreeState[];
}

interface SkillTreeState {
  origin: SkillTree;
  levelSkillTree: LevelSkillTree;
  visible: boolean;
}

export const useCharacterSkillStore = defineStore('view-character-skill', () => {
  const skillRoot: Ref<SkillRoot | null> = ref(null)
  const skillBuilds: Ref<SkillBuildState[]> = ref([])
  const currentSkillBuildIndex = ref(-1)

  const currentSkillBuild = computed(() => skillBuilds.value[currentSkillBuildIndex.value] ?? null)

  const initSkillRoot = (sr: SkillRoot) => {
    skillRoot.value = sr
  }

  const createSkillBuild = ({ name, skillBuild }: { name?: string; skillBuild?: SkillBuildState }) => {
    const root = skillRoot.value
    if (!root) {
      return
    }
    const newBuild: SkillBuildState = skillBuild ?? {
      stateId: skillBuilds.value.length,
      name: name ?? '',
      origin: root,
      skillTreeCategoryStates: root.skillTreeCategorys.map(stc => {
        return {
          origin: stc,
          visible: false,
          skillTreeStates: stc.skillTrees
            .filter(st => !st.attrs.simulatorFlag)
            .map(st => {
              const lst = new LevelSkillTree(st)
              st.skills.forEach(skill => lst.appendLevelSkill(skill))
              return {
                origin: st,
                levelSkillTree: lst,
                visible: false,
              }
            }),
        }
      }),
    }
    skillBuilds.value.push(newBuild)
    currentSkillBuildIndex.value = skillBuilds.value.length - 1
    return newBuild
  }

  const resetSkillBuilds = () => {
    skillBuilds.value = []
  }

  const saveSkillBuildsCsv = () => {
    const { type, index } = SAVE_CSV_CONFIG
    const datas: (number | string)[][] = []

    function createRow() {
      const row: (string| number)[] = []
      datas.push(row)
      return row
    }
    skillBuilds.value.forEach(sr => {
      const p1 = createRow(),
        n1 = 'skillRoot'
      p1[index['type']] = type[n1]
      p1[index[n1]['name']] = sr.name
      sr.skillTreeCategoryStates.forEach(stc => {
        if (!stc.visible) {
          return
        }
        const p2 = createRow(),
          n2 = 'skillTreeCategory'
        p2[index['type']] = type[n2]
        p2[index[n2]['id']] = stc.origin.id
        stc.skillTreeStates.forEach(st => {
          if (!st.visible) {
            return
          }
          const p3 = createRow(),
            n3 = 'skillTree'
          p3[index['type']] = type[n3]
          p3[index[n3]['id']] = st.origin.id
          st.levelSkillTree.levelSkills.forEach(skill => {
            const lv = skill.level(),
              sglv = skill.starGemLevel()
            if (lv === 0 && sglv === 0) {
              return
            }
            const p4 = createRow(),
              n4 = 'levelSkill'
            p4[index['type']] = type[n4]
            p4[index[n4]['id']] = skill.base.id
            p4[index[n4]['level']] = lv
            p4[index[n4]['starGemLevel']] = sglv
          })
        })
      })
    })

    return Papa.unparse(datas)
  }

  const loadSkillBuildsCsv = ({ csvString }: { csvString: string }) => {
    const { type, index } = SAVE_CSV_CONFIG

    const createBuild = () => {
      return createSkillBuild({ name: 'potum' })!
    }

    let hasInit = false
    let cur: SkillBuildState
    let cur_stc: SkillTreeCategoryState
    let cur_st: SkillTreeState;

    (Papa.parse(csvString).data as string[][]).forEach((row) => {
      let currentType: CsvSkillElementTypes | '' = '';

      (Object.keys(type) as CsvSkillElementTypes[]).find(key => {
        if (type[key] === parseInt(row[index['type']], 10)) {
          currentType = key
          return true
        }
      })

      if (!currentType) {
        return
      }

      if (currentType === CsvSkillElementTypes.SkillRoot) {
        if (!hasInit) {
          resetSkillBuilds()
          cur = createBuild()
          hasInit = true
        } else {
          cur = createBuild()
        }
        cur.name = row[index[currentType]['name']]
      } else if (currentType === CsvSkillElementTypes.SkillTreeCategory) {
        const id = parseInt(row[index[currentType]['id']], 10)
        cur_stc = cur.skillTreeCategoryStates.find(item => item.origin.id === id)!
        cur_stc.visible = true
      } else if (currentType === CsvSkillElementTypes.SkillTree) {
        const id = parseInt(row[index[currentType]['id']], 10)
        cur_st = cur_stc.skillTreeStates.find(item => item.origin.id === id)!
        cur_st.visible = true
      } else if (currentType === CsvSkillElementTypes.LevelSkill) {
        const id = parseInt(row[index[currentType]['id']], 10)
        const skill = cur_st.levelSkillTree.levelSkills.find(item => item.base.id === id)!
        skill.level(parseInt(row[index[currentType]['level']], 10))
        skill.starGemLevel(parseInt(row[index[currentType]['starGemLevel']], 10))
      }
    })
  }

  return {
    skillBuilds: readonly(skillBuilds) as Ref<readonly SkillBuildState[]>,
    currentSkillBuild,
    currentSkillBuildIndex: readonly(currentSkillBuildIndex),

    initSkillRoot,
    createSkillBuild,
    resetSkillBuilds,
    saveSkillBuildsCsv,
    loadSkillBuildsCsv,
  }
})

export type { SkillBuildState }
