<script lang="ts">
import { ConcreteComponent, FunctionalComponent, Transition, TransitionProps } from 'vue'
import { h, mergeProps } from 'vue'

import Fade from './transition/cy-transition-fade.vue'

interface Props extends TransitionProps {
  name?: string;
}

const CyTransition = (function (props, context) {
  const getComponent = (): ConcreteComponent<TransitionProps> => {
    const name = props.name || 'fade'
    const main = name.split('-')[0]
    if (main === 'fade') {
      return Fade
    }
    return Transition
  }

  const attrs = mergeProps({
    name: props.type,
  }, context.attrs) as TransitionProps

  return h(
    getComponent(),
    attrs,
    context.slots as any,
  )
}) as FunctionalComponent<Props>

export default CyTransition
</script>
