<script>
export default {
  emits: ['click'],
  props: {
    iconifyName: {
      type: String,
      default: ''
    },
    iconId: {
      type: String,
      default: ''
    },
    imagePath: {
      default: null
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
        'disable': this.disabled
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