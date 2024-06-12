import { CommonId, CommonIdGenerator } from './CommonId'

export type InstanceId = CommonId<'InstanceId'>

export class InstanceIdGenerator extends CommonIdGenerator<InstanceId> {}
