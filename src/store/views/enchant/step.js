import { EnchantStep } from '@/lib/Enchant/Enchant';

const mutations = {
  toggleStepType(state, step) {
    step.type = step.type === EnchantStep.TYPE_NORMAL ? EnchantStep.TYPE_EACH : EnchantStep.TYPE_NORMAL;
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
