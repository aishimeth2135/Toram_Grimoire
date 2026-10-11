export const CharacterSimulatorRouteNames = {
  Basic: 'CharacterSimulator.Basic',
  Equipment: 'CharacterSimulator.Equipment',
  Food: 'CharacterSimulator.Food',
  Potion: 'CharacterSimulator.Potion',
  Registlet: 'CharacterSimulator.Registlet',
  Save: 'CharacterSimulator.Save',
  Skill: 'CharacterSimulator.Skill',
  Dashboard: 'CharacterSimulator.Dashboard',
} as const
export type CharacterSimulatorRouteNames =
  (typeof CharacterSimulatorRouteNames)[keyof typeof CharacterSimulatorRouteNames]
