<script>
import { h } from "vue";
import Icons from "@Services/SvgIcons.js";

export default {
  props: {
    'iconId': {
      type: String,
      default: ''
    }
  },
  render() {
    const tmp = document.createElement('template');
    tmp.innerHTML = Icons(this.iconId);
    const svgEl = tmp.content.firstChild;
    const attrs = {};
    Array.from(svgEl.attributes).forEach(item => {
      attrs[item.name] = item.value;
    });
    return h('svg', {
      ...attrs,
      innerHTML: svgEl.innerHTML
    });
  }
}
</script>