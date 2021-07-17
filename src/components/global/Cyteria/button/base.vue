<script>
import IconSet from "../base/icon-set";

export default {
  mixins: [IconSet],
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    toggle: {
      default: undefined,
    },
    toggleList: {
      type: Array,
      default() {
        return [true, false];
      },
    },
  },
  emits: ['click', 'update:toggle'],
  computed: {
    baseClass(){
      return {
        'selected': this.selected,
        'disabled': this.disabled,
      };
    },
  },
  methods: {
    click(e) {
      if (this.disabled) {
        return;
      }
      if (this.toggle !== undefined) {
        let idx = this.toggleList.indexOf(this.toggle);
        idx = idx === this.toggleList.length - 1 ? 0 : idx + 1;
        this.$emit('update:toggle', this.toggleList[idx]);
      }
      this.$emit('click', e);
    },
  },
};
</script>
