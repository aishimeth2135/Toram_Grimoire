import { InjectionKey } from 'vue';

interface ComputingContainerInjection {
  setStackValue: (stackId: number, value: number) => void;
}

const ComputingContainerInjectionKey: InjectionKey<ComputingContainerInjection> = Symbol('skill-computing-container');

export { ComputingContainerInjectionKey };
export type { ComputingContainerInjection };

