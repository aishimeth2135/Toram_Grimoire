import { ShallowReactive } from 'vue'

// Prevent the class type be upwrap
export type RawInstance<T> = ShallowReactive<T>
