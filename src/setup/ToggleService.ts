import { ref, reactive } from 'vue';
import type { Ref, UnwrapNestedRefs } from 'vue';

import type { UnionToIntersection } from '@/shared/utils/type';
interface ToggleItemDetail {
  readonly name: string;
  readonly default?: boolean;
}

type ToggleHandlerGroupsIdsTmp<Groups extends ToggleServiceOptions> = {
  [GroupId in keyof Groups]: {
    [Id in `${GroupId & string}/${ContentKeys<Groups[GroupId]>}`]: never;
  };
}[keyof Groups];
type ToggleHandlerGroupsIds<Groups extends ToggleServiceOptions> = keyof UnionToIntersection<ToggleHandlerGroupsIdsTmp<Groups>>;
interface ToggleHandler<Groups extends ToggleServiceOptions> {
  (id: ToggleHandlerGroupsIds<Groups>, force?: boolean | null, groupForce?: boolean): void;
}

type ToggleItem = ToggleItemDetail | string;

type ContentKey<Content> = Content extends { name: infer Name } ? Name : Content;
type ContentKeys<Contents extends ToggleServiceOptionGroup> = ContentKey<Contents[number]>;

type ToggleServiceOptionGroup = readonly ToggleItem[];
type ToggleServiceOptions = Record<string, ToggleServiceOptionGroup>;
type ToggleServiceGroups<Groups extends ToggleServiceOptions> = {
  [GroupId in keyof Groups]: ToggleServiceGroupContents<Groups[GroupId]>;
};
type ToggleServiceGroupContents<Group extends ToggleServiceOptionGroup> = {
  [ContentId in ContentKeys<Group>]: Ref<boolean>;
};

type ToggleServiceResult<Groups extends ToggleServiceOptions> = ToggleServiceGroups<Groups> & { toggle: ToggleHandler<Groups> };


export default function ToggleService<GroupMap extends ToggleServiceOptions>(options: GroupMap): UnwrapNestedRefs<ToggleServiceResult<GroupMap>> {
  const dataMap = {} as ToggleServiceGroups<GroupMap>;
  Object.entries(options).forEach(([groupKey, subs]) => {
    const group = {} as ToggleServiceGroupContents<GroupMap[typeof groupKey]>;
    subs.forEach((subItem) => {
      if (typeof subItem === 'string') {
        group[subItem as (keyof typeof group)] = ref(false);
      } else if (typeof subItem === 'object') {
        const { name, default: defaultValue = false } = subItem;
        group[name as (keyof typeof group)] = ref(defaultValue);
      }
    });
    dataMap[groupKey as keyof GroupMap] = group;
  });

  const toggle: ToggleHandler<GroupMap> = (id, force, groupForce) => {
    const [group, sub] = (id as string).split('/');
    const targetGroup = dataMap[group] as Record<string, Ref<boolean>>;
    if (sub) {
      force = force ?? !targetGroup[sub].value;
      if (!targetGroup[sub]) {
        console.warn(`[ToggleService] key "${id}" not found.`);
        return;
      }
      targetGroup[sub].value = force;
      if (groupForce !== undefined) {
        Object.entries(targetGroup).forEach(([key, item]) => {
          if (key !== sub) {
            item.value = groupForce;
          }
        });
      }
    } else {
      if (force === undefined) {
        console.warn('[toggle service] Toggle the group must pass param: force');
        return;
      }
      Object.values(targetGroup).forEach(item => item.value = force as boolean);
    }
  };

  const resultGroups = {} as ToggleServiceGroups<GroupMap>;
  Object.keys(dataMap).forEach((key: keyof typeof resultGroups) => {
    resultGroups[key] = dataMap[key];
  });

  return reactive({
    toggle,
    ...resultGroups,
  });
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const { contents1, contents2 } = ToggleService({
//   contents1: ['aaa', 'bbb'] as const,
//   contents2: ['ccc', 'ddd'],
// });
// const abc = {
//   content: ['p1', 'p2', '3'],
// };

// type Group<T> = {
//   [Id in keyof T]: {
//     [Cid in Content<T[Id]> & string]: boolean;
//   };
// };

// type Content<T> = (T extends any ? (k: [T]) => void : never) extends (k: [(infer I)[]]) => void ? I : never;

// type Type = Group<typeof abc>;
