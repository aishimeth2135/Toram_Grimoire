<template>
  <div>
    <div ref="icon-defs" style="position: absolute;"></div>
    <div class="main--bubble" ref="icons">
      <!-- <svg v-for="data in icons" :key="data.id"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="up"
        preserveAspectRatio="xMidYMid meet"
        :width="iconWidth + 'px'" :height="iconWidth + 'px'"
        :style="{ 'offset-path': data.path, 'color': data.color }"
        viewBox="0 0 24 24">
        <use xlink:href="#bubble--icon-group" />
      </svg> -->
    </div>
  </div>
</template>
<script>
import { loadIconifyData } from "@global-modules/SvgIcons.js";
import CY from "@global-modules/cyteria.js";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

export default {
  data() {
    return {
      icons: [],
      viewWidth: document.body.clientWidth,
      viewHeight: document.body.clientHeight,
      generationInterval: 3000,
      iconMaximum: 55,
      count: 0
    }
  },
  created() {
    loadIconifyData(this.$route.params.iconName)
      .then(data => {
        console.log(data);
        this.$refs['icon-defs'].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><defs><g id="bubble--icon-group">${data.body}</g></defs></svg>`;
        setInterval(() => {
          this.createIcon();
          if (this.icons.length > this.iconMaximum)
            this.$refs['icons'].remove(this.icons.shift());
        }, this.generationInterval);
      });

    const lis = () => {
      this.viewWidth = document.body.clientWidth;
      this.viewHeight = document.body.clientHeight;
    };

    window.addEventListener('resize', lis);
    this.$once('hook:beforeDestroy', function () {
      window.removeEventListener('resize', lis);
    });
  },
  computed: {
    iconWidth() {
      return Math.max(Math.floor(this.viewWidth * 5 / 100), 48);
    }
  },
  methods: {
    createRandowPathDefinition() {
      const vw = this.viewWidth,
        vh = this.viewHeight;
      const ox = Math.floor(getRandomInt(10, 90) * vw / 100);

      const yf = l => Math.floor((l * vh / 1000)) * 10,
        xf = l => ox + Math.floor((l * vw / 10000)) * 10,
        yStep = (add = 0) => yf(getRandomInt(8 + add, 12 + add));

      const start_x = xf(getRandomInt(-20, -5)),
        start_y = yf(105) - yStep();
      let cur = start_y - yStep(2);
      let d = `M${ox},${yf(100)}C${start_x},${start_y} ${start_x},${start_y-yf(2)} ${ox},${cur}`;
      let flip = true;
      while (cur > 0) {
        cur -= yStep();
        d += `S${xf(flip ? getRandomInt(5, 20) : getRandomInt(-20, -5))},${cur} ${ox},`;
        cur -= yStep();
        d += cur;
        flip = !flip;
      }

      return d;
    },
    randowHexColor() {
      return Array(3).fill()
        .map(a => getRandomInt(0, 255).toString(16))
        .reduce((c, a) => c + (a.length == 1 ? '0' + a : a), '#');
    },
    createIcon() {
      ++this.count;

      const color = this.randowHexColor();
      const path = this.createRandowPathDefinition();

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="up" width="${this.iconWidth}px" height="${this.iconWidth}px" style="offset-path: path('${path}');color: ${color}" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">`
        + '<use xlink:href="#bubble--icon-group" />'
        + '</svg>';

      const svg_element = CY.element.createByCode(svg);

      this.$refs['icons'].append(svg_element);

      this.icons.push(svg_element);

      // this.icons.push({
      //   id: this.count,
      //   color,
      //   path: `path('${path}')`
      // });
    }
  }
};
</script>
<style lang="less">

.main--bubble {
  width: 100%;
  height: 100vh;
  display: flex;
  margin: 0 auto;
  position: relative;
  overflow-y: hidden;
  // background-color: #fff;

  // @media (prefers-color-scheme: dark) {
  //   background-color: #fff;
  // }

  svg.up {
    animation: icon-up 20s;
    animation-fill-mode: forwards;
    position: absolute;
    offset-rotate: 90deg auto;
    offset-anchor: center;
  }
}

@keyframes icon-up {
  100% {
    offset-distance: 100%;
  }
}
</style>