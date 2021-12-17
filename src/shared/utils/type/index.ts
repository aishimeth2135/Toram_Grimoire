type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type ComponentPropsType<T extends abstract new (...args: any) => any> = Writeable<InstanceType<T>['$props']>;

export type {
  ComponentPropsType,
};
