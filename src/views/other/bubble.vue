<template>
  <div>
    <div ref="icon-defs" style="position: absolute;" />
    <div class="main--bubble" :class="{ 'display-bg': displayBg }">
      <svg
        v-for="data in icons"
        :key="data.id"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="up"
        preserveAspectRatio="xMidYMid meet"
        :width="iconWidth + 'px'"
        :height="iconWidth + 'px'"
        :style="{ 'offset-path': data.path, 'color': data.color }"
        :viewBox="viewBox"
      >
        <use xlink:href="#bubble--icon-group" />
      </svg>
    </div>
    <div class="toggle-bg-area" @click="toggleBackground" />
  </div>
</template>

<script>
import { loadIconifyData } from '@/shared/services/SvgIcons';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

const customIconDatas = {
  'potum': {
    iconData: '<g transform="translate(0,1250) scale(0.1,-0.1)" fill="currentcolor" stroke="none"><path d="M1468 11473 c-29 -34 -57 -98 -75 -173 -15 -62 -18 -111 -16 -277 l2 -201 -102 34 c-112 38 -148 42 -168 18 -15 -18 -20 -114 -8 -164 4 -19 15 -100 24 -180 56 -495 128 -757 306 -1113 76 -153 214 -396 234 -412 7 -6 78 -141 158 -300 364 -728 566 -1026 995 -1466 l163 -168 -50 -203 c-137 -556 -160 -746 -168 -1370 l-5 -428 -55 -82 c-70 -108 -155 -259 -203 -361 -96 -210 -132 -392 -146 -743 l-7 -159 27 -32 c67 -80 199 -105 317 -59 37 14 69 22 73 19 3 -3 8 2 12 11 3 9 15 16 25 16 10 0 62 11 115 25 102 27 198 71 252 118 l34 28 62 -133 c35 -73 79 -160 99 -193 l35 -60 -221 -6 c-231 -6 -245 -8 -492 -40 -169 -23 -172 -23 -310 -44 -354 -53 -385 -59 -435 -85 -45 -23 -42 -7 -42 -205 0 -139 -13 -216 -66 -397 -33 -112 -30 -132 28 -159 33 -16 55 -15 368 12 389 32 865 65 1177 79 264 13 1155 6 1345 -9 74 -6 218 -18 320 -26 221 -19 532 -53 920 -101 157 -19 292 -36 300 -36 8 0 107 9 220 21 113 11 230 23 260 26 30 3 150 14 265 24 950 88 1527 101 2285 51 204 -14 768 -65 993 -91 150 -17 181 -18 205 -7 30 15 28 -14 15 253 -5 103 -2 140 21 264 24 132 25 146 11 167 -8 13 -24 24 -34 24 -10 0 -72 13 -137 29 -467 115 -798 166 -1299 201 -88 7 -183 15 -211 18 l-52 7 80 95 c111 131 206 278 295 455 42 82 77 152 79 154 2 2 31 -19 66 -46 152 -120 255 -176 398 -218 52 -15 163 -61 245 -100 173 -84 230 -105 286 -105 73 0 119 41 148 130 10 32 6 47 -43 175 -168 435 -316 713 -586 1103 -127 183 -128 184 -134 332 -2 63 -7 122 -9 130 -3 8 -11 94 -17 190 -10 158 -18 263 -36 445 -3 33 -12 112 -20 175 -9 63 -18 144 -21 180 -3 36 -9 70 -13 75 -4 6 -13 39 -20 75 -16 81 -73 261 -114 360 -30 72 -31 76 -16 107 8 18 50 68 93 111 42 43 77 86 77 94 0 9 25 41 55 72 30 30 55 59 55 63 1 15 196 243 397 465 155 171 503 524 658 669 154 143 526 469 739 649 293 248 381 320 387 320 10 0 119 180 119 197 0 8 5 23 10 34 23 42 -16 69 -124 89 -33 5 -61 12 -63 13 -2 2 17 22 43 43 72 61 142 134 147 154 7 27 -18 56 -51 63 -52 10 -661 67 -822 76 -219 13 -695 5 -870 -14 -571 -62 -1039 -208 -1763 -551 -295 -140 -1053 -539 -1090 -573 -16 -16 -24 -16 -80 -5 -399 82 -658 113 -957 114 -287 2 -542 -22 -1110 -104 l-235 -34 -110 70 c-194 125 -241 156 -658 427 -423 275 -994 659 -1350 908 -230 161 -773 557 -1107 808 -118 89 -225 167 -237 173 -31 17 -68 15 -85 -5z"/></g>',
    width: 1250,
    height: 1250,
  },
};

export default {
  name: 'DollBubble',
  data() {
    return {
      icons: [],
      colors: null,
      viewWidth: window.innerWidth,
      viewHeight: window.innerHeight,
      generationInterval: 250,
      iconMaximum: 55,
      counter: 0,
      idCounter: 0,
      viewBox: '0 0 24 24',
      displayBg: false,
      resizeListener: null,
    };
  },
  computed: {
    iconWidth() {
      return Math.max(Math.floor(this.viewWidth * 5 / 100), 48);
    },
  },
  mounted() {
    const colors = this.$route.params.color;
    if (colors && colors != 'random') {
      this.colors = colors.split('+');
    }

    const iconNumber = this.$route.params.number;
    if (iconNumber) {
      const [max, interval = this.generationInterval] = iconNumber.split('+');
      this.iconMaximum = max;
      this.generationInterval = interval;
    }

    const iconName = this.$route.params.iconName;

    const setIcon = data => {
      this.$refs['icon-defs'].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><defs><g id="bubble--icon-group">${data.iconData}</g></defs></svg>`;
      this.viewBox = `0 0 ${data.width} ${data.height}`;
      setInterval(this.createIcon, this.generationInterval);
    };

    const customIconList = Object.keys(customIconDatas);
    const customIcon = customIconList.find(p => p == iconName);

    if (customIcon) {
      setIcon(customIconDatas[customIcon]);
    }
    else {
      loadIconifyData(iconName)
        .then(({ body, width, height }) => setIcon({ iconData: body, width, height }));
    }

    const lis = () => {
      this.viewWidth = window.innerWidth;
      this.viewHeight = window.innerHeight;
    };

    window.addEventListener('resize', lis);
    this.resizeListener = lis;
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  },
  methods: {
    toggleBackground() {
      this.displayBg = !this.displayBg;
    },
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
      let d = `M${ox},${yf(100)}C${start_x},${start_y} ${start_x},${start_y - yf(2)} ${ox},${cur}`;
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
    generateColor() {
      if (this.colors) {
        const l = this.colors.length;
        if (this.colors.length == 1)
          return this.colors[0];
        return '#' + this.colors[getRandomInt(0, l - 1)];
      }
      return this.randowHexColor();
    },
    randowHexColor() {
      return Array(3).fill()
        .map(() => getRandomInt(0, 255).toString(16))
        .reduce((c, a) => c + (a.length == 1 ? '0' + a : a), '#');
    },
    createIcon() {
      const color = this.generateColor();
      const path = this.createRandowPathDefinition();

      this.icons[this.counter] = {
        id: this.idCounter,
        color,
        path: `path('${path}')`,
      };

      this.idCounter += 1;
      this.counter += 1;
      if (this.counter == this.iconMaximum)
        this.counter = 0;
    },
  },
};
</script>

<style lang="less" scoped>
.main--bubble {
  width: 99vw;
  height: 100vh;
  margin: 0 0.5vw;
  position: absolute;
  z-index: -1;
  overflow-y: hidden;
  left: 0;
  top: 0;
  // background-color: #fff;

  // @media (prefers-color-scheme: dark) {
  //   background-color: #fff;
  // }
  &.display-bg {
    background-color: var(--white);
    z-index: 99;
  }

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

.toggle-bg-area {
  z-index: 100;
  height: 100%;
  width: 3rem;
  position: absolute;
  right: 0;
  top: 0;
  &:hover {
    background-color: rgba(var(--rgb-black), 0.3);
  }
}
</style>
