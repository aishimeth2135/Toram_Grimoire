import { InjectionKey } from 'vue';

interface SkillTagInjection {
  handleTagButtonContent: (el: HTMLElement) => void;
}

const SkillTagInjectionKey: InjectionKey<SkillTagInjection> = Symbol('skill-tag');

export { SkillTagInjectionKey };
export type { SkillTagInjection };

