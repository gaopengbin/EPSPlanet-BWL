<template>
  <div class="epsplanet-statusBar">
    <span v-show="showCamera">{{ cameraString }}</span>
    <span v-show="showHeight">{{ heightString }}</span>
    <span v-show="showFPS">{{ fpsString }}</span>
    <span v-show="showHeading">{{ headingString }}</span>
    <span v-show="showPitch">{{ pitchString }}</span>
    <span v-show="showRoll">{{ rollString }}</span>
    <span v-show="showVelocity">{{ velocityString }}</span>
    <span v-show="showMouse">{{ mouseString }}</span>
    {{ data.velocity }}{{ data.velocityRatio }}
  </div>
</template>

<script setup="context" lang="ts">
import './style/index.scss';
import { statusbarProps } from './statusbar';
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, toRef, watch } from 'vue';
import { useEarthAsync } from '../../utils';
// import { $ref } from 'unplugin-vue-macros/macros'
defineOptions({ name: 'EpsplanetStatusbar' });

const { proxy } = getCurrentInstance() as any;



const aa = ref(0)

const test = reactive({
  a: 1,
  b: 2
});
proxy.test = test
proxy.aa = aa

const props = defineProps(statusbarProps);
const {
  showCamera,
  showHeight,
  showFPS,
  showHeading,
  showPitch,
  showRoll,
  showVelocity,
  showMouse
} = props;

const cameraString = ref('');
const heightString = ref('');
const fpsString = ref('');
const headingString = ref('');
const pitchString = ref('');
const rollString = ref('');
const mouseString = ref('');

const data = reactive({
  baseVelocity: 0,
  velocity: 0,
  velocityRatio: 1
});
Object.assign(proxy, data);

console.log('proxy:', proxy, mouseString, data);
// const velocity = toRef(proxy, 'velocity');
// const baseVelocity = ref(0);
// const velocityRatio = ref(1);

watch(
  () => proxy.velocity,
  (v: any) => {
    console.log('proxy.velocity:', v);
    data.velocity = v;
  }
);

const mousePos = ref({
  lng: 0,
  lat: 0,
  height: 0
});
const latitudeString = ref('');
const longitudeString = ref('');
const lang = {
  longitude: '经度',
  latitude: '纬度',
  height: '高度',
  fps: '帧率',
  heading: '偏航角',
  pitch: '俯仰角',
  roll: '翻滚角',
  meter: '米',
  velocity: '键盘运动速度'
};

let disposer: any = [];
let earth: any;
onMounted(async () => {
  earth = await useEarthAsync();
  init();
});
onBeforeUnmount(() => {
  del();
});
const velocityString = computed(() => {
  return ` ${lang.velocity}: ${proxy.velocity.toFixed(
    1
  )} km/h (${data.baseVelocity.toFixed(1)} × ${data.velocityRatio.toFixed(
    1
  )})`;
});
// const velocityString = computed(() => {
//   return ` ${lang.velocity}: ${velocity.value.toFixed(
//     1
//   )} km/h (${baseVelocity.value.toFixed(1)} × ${velocityRatio.value.toFixed(
//     1
//   )})`;
// });
function init() {
  let _scene = earth.czm.scene;
  const scratchCartograghic = [0, 0, 0];
  earth.czm.viewer.canvas.addEventListener('mousemove', (mouseEvent: any) => {
    const carto = earth.pickPosition(
      {
        x: mouseEvent.offsetX,
        y: mouseEvent.offsetY
      },
      scratchCartograghic
    );
    if (carto) {
      mousePos.value.lng = (carto[0] * 180) / Math.PI;
      mousePos.value.lat = (carto[1] * 180) / Math.PI;
      mousePos.value.height = carto[2];
      mouseString.value =
        '鼠标位置:' +
        mousePos.value.lng.toFixed(6) +
        '° ' +
        mousePos.value.lat.toFixed(6) +
        '° ' +
        mousePos.value.height.toFixed(2) +
        'm';
    } else {
      mouseString.value = '暂时无法获取鼠标位置...';
    }
  });
  let _camera = earth.czm.camera;

  const td = Cesium.Math.toDegrees;

  const updateCameraString = () => {
    const camera = _camera;

    var l = td(camera.positionCartographic.longitude).toFixed(5);
    var b = td(camera.positionCartographic.latitude).toFixed(5);
    var h = camera.positionCartographic.height.toFixed(2);
    var y = td(camera.heading).toFixed(2);
    var p = td(camera.pitch).toFixed(2);
    var r = td(camera.roll).toFixed(2);

    cameraString.value = `${lang.longitude}: ${l}° ${lang.latitude}: ${b}°`;
    longitudeString.value = `${lang.longitude}: ${l}°`;
    latitudeString.value = `${lang.latitude}: ${b}°`;
    heightString.value = `${lang.height}: ${h}${lang.meter}`;
    headingString.value = `${lang.heading}: ${y}°`;
    pitchString.value = `${lang.pitch}: ${p}°`;
    rollString.value = `${lang.roll}: ${r}°`;

    // this.cameraString = `${lang.longitude}: ${l}° ${lang.latitude}: ${b}° ${lang.height}: ${h}${lang.meter} ${lang.heading}: ${y}° ${lang.pitch}: ${p}° ${lang.roll}: ${r}°`;
  };

  disposer = [];
  disposer.push(_camera.changed.addEventListener(updateCameraString));
  updateCameraString();

  // 帧率的计算借助了Cesium中的东西，需要开启debugShowFramesPerSecond
  _scene.debugShowFramesPerSecond = true;
  const tempDisposer = _scene._postRender.addEventListener(() => {
    tempDisposer();
    _scene._performanceContainer.style.visibility = 'hidden'; // 隐藏默认的帧率显示窗口
  });

  disposer.push(
    _scene._postRender.addEventListener(() => {
      if (_scene._performanceDisplay) {
        fpsString.value = `${lang.fps}: ${_scene._performanceDisplay._fpsText.nodeValue} `;
      } else {
        fpsString.value = '';
      }
    })
  );

  disposer.push(
    XE.MVVM.track(
      proxy, 'baseVelocity', earth.camera.immersion, 'baseVelocity'
    ),
    XE.MVVM.track(
      proxy, 'velocity', earth.camera.immersion, 'velocity'
    ),
    XE.MVVM.track(
      proxy, 'velocityRatio', earth.camera.immersion, 'velocityRatio'
    ),
    // XE.MVVM.watch(
    //   () => earth.camera.immersion.baseVelocity,
    //   (v: any) => {
    //     baseVelocity.value = v;
    //   }
    // ),
    // XE.MVVM.watch(
    //   () => earth.camera.immersion.velocity,
    //   (v: any) => {
    //     velocity.value = v;
    //   }
    // ),
    // XE.MVVM.watch(
    //   () => earth.camera.immersion.velocityRatio,
    //   (v: any) => {
    //     velocityRatio.value = v;
    //   }
    // )
  );
}

function del() {
  if (disposer) {
    disposer.forEach((d: any) => d());
    disposer.length = 0;
  }
}
</script>

<style scoped></style>
