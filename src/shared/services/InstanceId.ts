import { CommonId, CommonIdGenerator } from './CommonId'

export type InstanceId = CommonId<'InstanceId'>

export class InstanceIdGenerator extends CommonIdGenerator<InstanceId> {}

export interface InstanceWithId {
  readonly instanceId: InstanceId
}

export function instanceEquals<Element extends InstanceWithId>(
  item1: Element,
  item2: Element
) {
  return item1.instanceId === item2.instanceId
}
