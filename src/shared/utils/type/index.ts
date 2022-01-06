type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type ComponentPropsType<T extends abstract new (...args: any) => any> = Writeable<InstanceType<T>['$props']>;

type UnionToIntersection<T> = (T extends any ? (k: T) => void : never) extends (k: infer I) => void ? I : never;

export type {
  ComponentPropsType,
  UnionToIntersection,
};
