export type UnionToIntersection<T> = (T extends any ? (k: T) => void : never) extends (k: infer I) => void ? I : never
