import type { UnwrapNestedRefs } from '@vue/reactivity';
import { ref, reactive } from 'vue';
import type { Ref } from 'vue';
interface ToggleItemDetail {
  readonly name: string;
  readonly default?: boolean;
}

type ToggleItem = ToggleItemDetail | string;
type ToggleHandler = (id: string, force?: boolean, groupForce?: boolean) => void;

type ContentKey<Content> = Content extends { name: infer Name } ? Name : Content;
type ContentKeys<Contents extends ToggleServiceOptionGroup> = ContentKey<Contents[number]>;

type ToggleServiceOptions = Record<string, ToggleServiceOptionGroup>;
type ToggleServiceGroups<Groups extends ToggleServiceOptions> = Record<keyof Groups, ToggleServiceGroupContents<Groups[keyof Groups]>>;
type ToggleServiceResult<Groups extends ToggleServiceOptions> = ToggleServiceGroups<Groups> & { toggle: ToggleHandler };
type ToggleServiceOptionGroup = readonly ToggleItem[];
type ToggleServiceGroupContents<Group extends ToggleServiceOptionGroup> = Record<ContentKeys<Group>, Ref<boolean>>;

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

  const toggle: ToggleHandler = (id, force, groupForce) => {
    const [group, sub] = id.split('/');
    const targetGroup = dataMap[group] as Record<string, Ref<boolean>>;
    if (sub) {
      force = typeof force === 'boolean' ? force : !targetGroup[sub].value;
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

// const { window, test,  toggle } = ToggleService({
//   window: ['selectType'],
// });

// const t = window.ttt;
// const t2 = window.selectType;
