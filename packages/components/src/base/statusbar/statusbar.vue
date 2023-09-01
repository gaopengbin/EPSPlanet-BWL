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
  </div>
</template>
<script lang='ts'>
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  computed,
} from "vue";
import { useEarthAsync } from '../../utils';
import './style/index.scss';
import { statusbarProps } from './statusbar';
export default defineComponent({
  name: "EpsplanetStatusbar",
  props: statusbarProps,
  setup(props) {
    console.log(props);
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
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

    const data = reactive({
      showLon: true,
      showLat: true,
      longitudeString: "",
      latitudeString: "",
      heightString: "",
      headingString: "",
      pitchString: "",
      rollString: "",
      cameraString: "",
      fpsString: "",
      baseVelocity: 0.0,
      velocity: 0.0,
      velocityRatio: 1.0,
      lang: {
        longitude: "经度",
        latitude: "纬度",
        height: "高度",
        fps: "帧率",
        heading: "偏航角",
        pitch: "俯仰角",
        roll: "翻滚角",
        meter: "米",
        velocity: "键盘运动速度",
      },
      mousePos: {
        lng: 0,
        lat: 0,
        height: 0,
      },
      mouseString: "",
    });
    let disposer: any = [];
    onMounted(async () => {
      earth = await useEarthAsync();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    const velocityString = computed(() => {
      return ` ${data.lang.velocity}: ${data.velocity.toFixed(
        1
      )} km/h (${data.baseVelocity.toFixed(1)} × ${data.velocityRatio.toFixed(
        1
      )})`;
    });
    function init() {
      let _scene = earth.czm.scene;
      const scratchCartograghic = [0, 0, 0];
      earth.czm.viewer.canvas.addEventListener(
        "mousemove",
        (mouseEvent: any) => {
          const carto = earth.pickPosition(
            {
              x: mouseEvent.offsetX,
              y: mouseEvent.offsetY,
            },
            scratchCartograghic
          );
          if (carto) {
            data.mousePos.lng = (carto[0] * 180) / Math.PI;
            data.mousePos.lat = (carto[1] * 180) / Math.PI;
            data.mousePos.height = carto[2];
            data.mouseString =
              "鼠标位置:" +
              data.mousePos.lng.toFixed(6) +
              "° " +
              data.mousePos.lat.toFixed(6) +
              "° " +
              data.mousePos.height.toFixed(2) +
              "m";
          } else {
            data.mouseString = "暂时无法获取鼠标位置...";
          }
        }
      );
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

        data.cameraString = `${data.lang.longitude}: ${l}° ${data.lang.latitude}: ${b}°`;
        data.longitudeString = `${data.lang.longitude}: ${l}°`;
        data.latitudeString = `${data.lang.latitude}: ${b}°`;
        data.heightString = `${data.lang.height}: ${h}${data.lang.meter}`;
        data.headingString = `${data.lang.heading}: ${y}°`;
        data.pitchString = `${data.lang.pitch}: ${p}°`;
        data.rollString = `${data.lang.roll}: ${r}°`;

        // this.cameraString = `${data.lang.longitude}: ${l}° ${data.lang.latitude}: ${b}° ${data.lang.height}: ${h}${data.lang.meter} ${data.lang.heading}: ${y}° ${data.lang.pitch}: ${p}° ${data.lang.roll}: ${r}°`;
      };

      disposer = [];
      disposer.push(_camera.changed.addEventListener(updateCameraString));
      updateCameraString();

      // 帧率的计算借助了Cesium中的东西，需要开启debugShowFramesPerSecond
      _scene.debugShowFramesPerSecond = true;
      const tempDisposer = _scene._postRender.addEventListener(() => {
        tempDisposer();
        _scene._performanceContainer.style.visibility = "hidden"; // 隐藏默认的帧率显示窗口
      });

      disposer.push(
        _scene._postRender.addEventListener(() => {
          if (_scene._performanceDisplay) {
            data.fpsString = `${data.lang.fps}: ${_scene._performanceDisplay._fpsText.nodeValue} `;
          } else {
            data.fpsString = "";
          }
        })
      );

      disposer.push(
        XE.MVVM.track(
          proxy,
          "baseVelocity",
          earth.camera.immersion,
          "baseVelocity"
        )
      );
      disposer.push(
        XE.MVVM.track(
          proxy,
          "velocity",
          earth.camera.immersion,
          "velocity"
        )
      );
      disposer.push(
        XE.MVVM.bind(
          proxy,
          "velocityRatio",
          earth.camera.immersion,
          "velocityRatio"
        )
      );
    }

    function del() {
      if (disposer) {
        disposer.forEach((d: any) => d());
        disposer.length = 0;
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      velocityString,
      showCamera,
      showHeight,
      showFPS,
      showHeading,
      showPitch,
      showRoll,
      showVelocity,
      showMouse,
      init,
      del,
    };
  },
});
</script>