import type { Ref, ShallowRef } from 'vue'

/**
 * Prevent the type of the class instance be unwrap in the pinia store definition.
 * Make the type be unchanged after the store definition.
 *
 * Only use if you are sure the target will be unwrap.
 *
 * ex:
 * ```
 * // in the pinia store definition
 * return {
 *   data1: protectType(ref(someInstance)),
 * }
 * ```
 *
 * @param target
 * @returns The original input value with fake type
 */
export function protectType<T>(target: Ref<T>) {
  /**
   * If the store defintion is
   * ```
   * return {
   *   data1: ref(someInstance)
   * }
   * ```
   * The final type can be simplified to
   * ```
   * UnwrapRef<UnwrapRef<{
   *   data1: Ref<SomeInstance>
   * }>>
   * ```
   * If want `SomeInstance` not be unwrap:
   * ```
   * type Result: {
   *   data1: SomeInstance // <- do not be unwrap
   * }: = UnwrapRef<UnwrapRef<{
   *   data1: ShallowRef<ShallowRef<SomeInstance>>
   * }>>
   * ```
   */
  return target as ShallowRef<ShallowRef<T>>
}
