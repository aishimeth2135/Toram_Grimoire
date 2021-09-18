import { EnchantStep } from '@/lib/Enchant/Enchant';
import { EnchantStepTypes } from '@/lib/Enchant/Enchant/enums';

const mutations = {
  toggleStepType(state, step) {
    step.type = step.type === EnchantStepTypes.Normal ? EnchantStepTypes.Each : EnchantStepTypes.Normal;
  },
  toggleStepHidden(state, step) {
    step.hidden = !step.hidden;
  },
  swapStep(state, { step, offset }) {
    step.belongEquipment.swapStep(step.index, step.index + offset);
  },
  insertStepBefore(state, step) {
    step.belongEquipment.insertStepBefore(step);
  },
  removeStep(state, step) {
    step.remove();
  },
  setStepStepValue(state, { step, value }) {
    step.step = value;
  },
  stepAutoFill(state, step) {
    step.autoFill();
  },
};

export default {
  namespaced: true,
  mutations,
};
