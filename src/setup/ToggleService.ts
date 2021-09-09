import { ref, readonly } from 'vue';
import type { Ref } from 'vue';

type ToggleItemDetail = {
  readonly name: string;
  readonly default?: boolean;
};
type ToggleItem = ToggleItemDetail | string;

type ToggleServiceOptions = {
  readonly [key: string]: Array<ToggleItem>;
};

type ToggleContentsGroup = {
  [key: string]: {
    readonly [key: string]: boolean;
  } | ToggleHandler;
};

type ToggleServiceResult = ToggleContentsGroup & { toggle: ToggleHandler };
type ToggleHandler = (id: string, force?: boolean, groupForce?: boolean) => void;

export default function(options: ToggleServiceOptions): ToggleServiceResult {
  const dataMap: {
    [key: string]: {
      [key: string]: Ref<boolean>;
    };
  } = {};
  Object.entries(options).forEach(([groupKey, subs]) => {
    const group: { [key: string]: Ref<boolean> } = {};
    subs.forEach(subItem => {
      if (typeof subItem === 'string') {
        group[subItem] = ref(false);
      } else if (typeof subItem === 'object') {
        const { name, default: defaultValue = false } = subItem;
        group[name] = ref(defaultValue);
      }
    });
    dataMap[groupKey] = group;
  });

  const toggle: ToggleHandler = (id, force, groupForce) => {
    const [group, sub] = id.split('/');
    if (sub) {
      force = typeof force === 'boolean' ? force : !dataMap[group][sub].value;
      dataMap[group][sub].value = force;
      if (groupForce !== undefined) {
        Object.entries(dataMap[group]).forEach(([key, item]) => {
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
      Object.values(dataMap[group]).forEach(item => item.value = force as boolean);
    }
  };

  const data: ToggleServiceResult = {
    toggle,
  };
  Object.keys(dataMap).forEach(k => data[k] = readonly(dataMap[k]));

  return data;
}
