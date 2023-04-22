import { CharacterBuildBindOnCharacter } from '../Character/CharacterBuild'
import type { FoodBase, FoodsBase } from '../Food'

interface FoodsBuildSaveData {
  id: number
  name: string
  foods: {
    statId: string
    level: number
    negative: boolean
    selected: boolean
  }[]
}

let _foodBuildAutoIncreasement = 0
class FoodsBuild implements CharacterBuildBindOnCharacter {
  loadedId: string | null
  instanceId: number
  name: string
  foods: Food[]
  selectedFoodIndexes: number[]
  base: FoodsBase

  constructor(base: FoodsBase, name: string = '') {
    this.loadedId = null
    this.instanceId = _foodBuildAutoIncreasement
    _foodBuildAutoIncreasement += 1

    this.base = base
    this.name = name
    this.foods = []

    base.foodBases.forEach(foodBase => this.appendFood(foodBase))

    this.selectedFoodIndexes = []
  }

  get selectedFoods() {
    return this.selectedFoodIndexes.map(idx => this.foods[idx])
  }

  appendFood(foodBase: FoodBase) {
    this.foods.push(new Food(foodBase))
  }
  foodSelected(idx: number) {
    return this.selectedFoodIndexes.includes(idx)
  }

  /**
   * @param idx - index of food
   * @returns true if append successfully
   */
  appendSelectedFood(idx: number): boolean {
    if (this.selectedFoodIndexes.length < 5 && !this.foodSelected(idx)) {
      this.selectedFoodIndexes.push(idx)
      return true
    }
    return false
  }

  removeSelectedFood(idx: number) {
    const foodIdx = this.selectedFoodIndexes.indexOf(idx)
    this.selectedFoodIndexes.splice(foodIdx, 1)
  }

  clone() {
    const newFood = new FoodsBuild(this.base, this.name + '*')
    newFood.foods = this.foods.map(food => food.clone())
    newFood.selectedFoodIndexes = this.selectedFoodIndexes.slice()
    return newFood
  }

  // save and load with json-data
  save(): FoodsBuildSaveData {
    const data = {} as FoodsBuildSaveData
    data.id = this.instanceId
    data.name = this.name

    data.foods = this.foods.map((food, idx) => ({
      statId: food.foodBase.base.baseId,
      level: food.level,
      negative: food.foodBase.negative,
      selected: this.foodSelected(idx),
    }))

    return data
  }
  load(
    loadCategory: string,
    data: FoodsBuildSaveData
  ): { success?: boolean; error?: boolean } {
    try {
      let success = true

      const { id, name, foods } = data
      this.name = name
      foods.forEach(food => {
        const findIdx = this.foods.findIndex(
          _food =>
            _food.foodBase.base.baseId === food.statId &&
            _food.foodBase.negative === food.negative
        )
        if (findIdx !== -1) {
          const find = this.foods[findIdx]
          find.level = food.level
          if (food.selected) {
            this.appendSelectedFood(findIdx)
          }
        } else {
          success = false
          console.warn(
            `[FoodBuild.load] Can not find Food which stat-base-name: ${food.statId}, negative: ${food.negative}`
          )
        }
      })

      if (typeof id === 'number') {
        this.loadedId = `${loadCategory}-${id}`
      }

      return {
        success,
      }
    } catch (error) {
      console.warn(error)
      return {
        error: true,
      }
    }
  }

  matchLoadedId(loadCategory: string, id: number | null): boolean {
    return (
      this.loadedId !== null &&
      id !== null &&
      `${loadCategory}-${id}` === this.loadedId
    )
  }
}

class Food {
  foodBase: FoodBase
  level: number

  constructor(foodBase: FoodBase) {
    this.foodBase = foodBase
    this.level = 0
  }

  stat() {
    return this.foodBase.getStat(this.level)
  }

  statTitle() {
    return this.foodBase.statTitle()
  }

  clone() {
    const newFood = new Food(this.foodBase)
    newFood.level = this.level
    return newFood
  }
}

export { FoodsBuild, Food }
export type { FoodsBuildSaveData }
