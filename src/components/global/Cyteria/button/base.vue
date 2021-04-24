<script>
export default {
  emits: ['click'],
  props: {
    icon: {
      type: String
    },
    iconSrc: {
      type: String
    },
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
      this.$emit('click', e);
    }
  }
};
</script>