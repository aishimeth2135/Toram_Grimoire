import { type CommonId, CommonIdGenerator } from '../services/CommonId'

type ComponentContext = Record<string, any>
export type ContextId = CommonId<'ContextId'>

export const useContext = <Context extends ComponentContext>() => {
  const contexts = new Map<ContextId, Context>()

  const idGenerator = new CommonIdGenerator<ContextId>()

  const allocContext = (
    context: Context
  ): { id: ContextId; context: Context } => {
    const id = idGenerator.generate()
    contexts.set(id, context)
    return { id, context }
  }

  const getContext = (id: ContextId) => {
    return contexts.get(id) ?? null
  }

  const deallocContext = (id: ContextId) => {
    return contexts.delete(id)
  }

  return {
    allocContext,
    deallocContext,
    getContext,
  }
}

/**
 * @param el - The element that has the attribute of the given attribute name
 * @param attrName - The element attribute name of the context ID
 */
export function getContextIdFromElement(
  el: Element,
  attrName: string
): ContextId {
  return parseInt(el.getAttribute(attrName)!, 10) as ContextId
}
