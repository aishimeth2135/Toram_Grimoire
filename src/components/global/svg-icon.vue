<script>
import Icons from "@Services/SvgIcons.js";

export default {
  props: ['iconId'],
  render(createElement) {
    const tmp = document.createElement('template');
    tmp.innerHTML = Icons(this.iconId);
    const svgEl = tmp.content.firstChild;
    const attrs = {};
    Array.from(svgEl.attributes).forEach(item => {
      attrs[item.name] = item.value;
    });
    return createElement('svg', {
      attrs,
      domProps: {
        innerHTML: svgEl.innerHTML
      }
    });
  }
}
</script>