<script>
import IconSet from '../base/icon-set';

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
    inline: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  computed: {
    baseClass(){
      return {
        'selected': this.selected,
        'disabled': this.disabled,
        'inline': this.inline,
      };
    },
  },
  methods: {
    click(e) {
      if (this.disabled) {
        return;
      }
      this.$emit('click', e);
    },
  },
};
</script>
