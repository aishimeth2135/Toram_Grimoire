<script>
export default {
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
        'disable': this.disable
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