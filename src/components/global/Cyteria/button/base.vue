<script>
import IconSet from "@/components/mixin/icon-set";

export default {
  mixins: [IconSet],
  emits: ['click'],
  props: {
    selected: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    baseClass(){
      return {
        'selected': this.selected,
        'disabled': this.disabled
      };
    }
  },
  methods: {
    click(e) {
      if (this.disabled) {
        return;
      }
      this.$emit('click', e);
    }
  }
};
</script>