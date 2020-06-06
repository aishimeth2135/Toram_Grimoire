<script>
import Iconify from '@iconify/iconify';

/**
 * List of component properties to map to data- attributes
 *
 * @type {Array}
 */
const dataAttributes = ['inline', 'width', 'height', 'rotate', 'flip', 'align'];

/**
 * Array of components to update when icon has been loaded
 *
 * @type {Array}
 */
let listeners = [];

/**
 * Listen to IconifyAddedIcons that is fired whenever new icons are loaded from API
 */
document.addEventListener('IconifyAddedIcons', function() {
  listeners = listeners.filter(item => {
    if (Iconify.iconExists(item.icon)) {
      item.instance.iconLoaded();
      return false;
    }
    return true;
  });
});

/**
 * Export component
 */
export default {
  name: 'iconify-icon',
  render: function(createElement) {
    // Check if icon exists, render span if not
    if (!Iconify.iconExists(this.name)) {
      return createElement('span', {
        attrs: {
          style: 'display: inline-block; width: 1em;'
        }
      });
    }

    // Convert component properties to Iconify properties
    let props = {};
    if (this.color !== void 0) {
      props.style = 'color: ' + this.color + ';';
    }

    // All optional properties
    dataAttributes.forEach(key => {
      if (this[key] !== void 0) {
        props['data-' + key] = this[key];
      }
    });

    // Get SVG attributes and body
    let icon = Iconify.getSVGObject(this.name, props);
    return createElement('svg', {
      attrs: icon.attributes,
      domProps: {
        innerHTML: icon.body
      }
    });
  },
  props: {
    name: {
      type: String,
      required: true
    },
    // If one dimension is missing, it will be generated using width/height ratio of icon.
    // By default height is '1em', width is calculated from icon's width/height ratio.
    width: String,
    height: String,

    // If true, icon will have vertical alignment, so it renders similar to glyph font.
    // If false, icon will not have vertical alignment, so it renders as image above text baseline.
    // Use false for decorations, true when converting from legacy font code.
    // Default value is true
    inline: Boolean,

    // Color string, optional. If missing, currentColor is used
    color: String,

    // Rotation. Values are '90deg', '180deg', '270deg'. Rotation is done by rotating SVG content, not CSS rotation.
    rotate: String,

    // Flip. Values are 'horizontal', 'vertical' or 'horizontal,vertical' (last one is identical to 180deg rotation)
    flip: String,

    // Alignment. Used only if setting custom width and height that do not match icon's width/height ratio.
    // Value is comma separated list of alignments:
    // Horizontal: left, center, right
    // Vertical: top, middle, bottom
    // Crop: slice, meet
    align: String
  },
  beforeMount: function() {
    // Status of icon loading. false = not loading, string = icon name
    this._loadingIcon = false;
    this.loadIcon();
  },
  beforeUpdate: function() {
    // Try to load different icon if name property was changed
    this.loadIcon();
  },
  methods: {
    /**
     * Load icon from API
     */
    loadIcon: function() {
      if (this._loadingIcon !== this.name && !Iconify.iconExists(this.name)) {
        if (this._loadingIcon !== false) {
          // Already loading with different icon name - remove component with old icon name from listeners list
          this.removeListener();
        }

        // Add to queue
        this._loadingIcon = this.name;
        listeners.push({
          instance: this,
          icon: this._loadingIcon
        });

        // Add to Iconify loading queue
        // Iconify will execute queue on next tick, so its safe to add icons one by one
        Iconify.preloadImages([this.name]);
      }
    },

    /**
     * Remove component from Iconify event listener
     */
    removeListener: function() {
      listeners = listeners.filter(item => item.instance !== this);
    },

    /**
     * Icon has loaded. Force component update
     */
    iconLoaded: function() {
      this._loadingIcon = false;
      this.$forceUpdate();
    }
  },
  beforeDestroy: function() {
    if (this._loadingIcon !== false) {
      this.removeListener();
    }
  }
}
</script>