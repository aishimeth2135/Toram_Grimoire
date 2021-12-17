import { InjectionKey } from 'vue';

interface ComputingContainerInjection {
  setStackValue: (stackId: number, value: number) => void;
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> = Symbol('skill-computing-container');

interface SkillTagInjection {
  handleTagButtonContent: (el: HTMLElement) => void;
}

const SkillTagInjectionKey: InjectionKey<SkillTagInjection> = Symbol('skill-tag');

export { SkillTagInjectionKey, ComputingContainerInjectionKey };
export type { ComputingContainerInjection, SkillTagInjection };

