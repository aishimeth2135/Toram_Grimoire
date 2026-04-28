import LZString from 'lz-string'

import type { SkillBuildSaveData } from './SkillBuild'
import { SkillBuild } from './SkillBuild'

export function encodeSkillBuild(build: SkillBuild): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(build.save()))
}

export function decodeSkillBuild(encoded: string): SkillBuildSaveData | null {
  try {
    // Try lz-string first; fall back to legacy plain base64 for old shared URLs
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded)
    const json = decompressed ?? decodeURIComponent(escape(atob(encoded)))
    const data = JSON.parse(json)
    if (
      typeof data.name === 'string' &&
      Array.isArray(data.skillStates) &&
      Array.isArray(data.selectedSkillTrees)
    ) {
      return data as SkillBuildSaveData
    }
    return null
  } catch {
    return null
  }
}
