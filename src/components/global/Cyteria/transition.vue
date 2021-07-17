<script>
import { Transition } from "vue";
import { h, mergeProps } from "vue";
import Fade from "./transition/fade.vue";

function CyTransition(props, context) {
  const getComponent = () => {
    const type = props.type;
    const main = type.split('-')[0];
    if (main === 'fade') {
      return Fade;
    } else {
      console.warn('[cy-transition] unknow type');
      return Transition;
    }
  }

  const attrs = mergeProps({
    name: props.type,
  }, context.attrs);

  return h(
    getComponent(),
    attrs,
    context.slots,
  )
}

CyTransition.props = {
  type: {
    type: String,
    required: true,
  },
};

export default CyTransition;
</script>
