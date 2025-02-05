import { type CommonId, CommonIdGenerator } from './CommonId'

export type InstanceId = CommonId<'InstanceId'>

export class InstanceIdGenerator extends CommonIdGenerator<InstanceId> {}

export interface InstanceWithId {
  readonly instanceId: InstanceId
}

export function instanceEquals<Element extends InstanceWithId | null>(
  item1: Element,
  item2: Element
) {
  if (item1 === null || item2 === null) {
    return item1 === item2
  }

  return item1.instanceId === item2.instanceId
}
