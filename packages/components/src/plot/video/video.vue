<template>
  <div class="epsplanet-panel-base videoDelivery">
    <EpsplanetButton
      btnName="添加链接"
      title="添加链接"
      :panel="panel"
      ref="add"
    >
      <div class="addVideo">
        <el-input v-model="videoName" placeholder="请输入名称"></el-input>
        <el-input v-model="videoUrl" placeholder="请输入视频地址"></el-input>
        <el-button class="longBtn" @click="createVideo()">确定</el-button>
      </div>
    </EpsplanetButton>
    <el-select filterable v-model="demoData" placeholder="请选择样例地址">
      <el-option
        v-for="item in cameraVideoJson"
        :key="item.czmObject.name"
        :label="item.czmObject.name"
        :value="item.czmObject.name"
      >
        <span style="float: left">{{ item.czmObject.name }}</span>
        <span
          @click="clickCreatVideo(item)"
          style="float: right; color: #8492a6; font-size: 13px"
          >定位</span
        >
      </el-option>
    </el-select>
    <div v-show="setting">
      <div class="btnDiv">
        <el-button @click="positionEditing = !positionEditing">移动</el-button>
        <el-button @click="rotationEditing = !rotationEditing">旋转</el-button>
        <el-button>透明度</el-button>
        <el-button @click="show = !show">
          <span v-show="!show">显示</span>
          <span v-show="show">隐藏</span>
        </el-button>
      </div>
      <div>
        <el-switch
          v-model="assistLine"
          active-color="#409EFF"
          active-text="辅助线"
          inactive-text="辅助线"
        ></el-switch>
        <el-button class="save" @click="save">保存</el-button>
      </div>
      <el-collapse v-model="activeName" @change="collapseChange">
        <el-collapse-item title="高级设置" name="2">
          <div class="heightSet">
            <span>近裁：</span>
            <el-input v-model="nearClip" placeholder=""></el-input>
            <span>远裁：</span>
            <el-input v-model="farClip" placeholder=""></el-input>
            <span>水平广角：</span>
            <el-slider v-model="fovH" :min="1" :max="179" step="1"></el-slider>
            <span>垂直广角：</span>
            <el-slider v-model="fovV" :min="1" :max="179" step="1"></el-slider>
          </div>
          <div class="dataExplain">
            <span>经度：{{ position[0].toFixed(5) }}°</span>
            <span>偏航角：{{ rotation[0].toFixed(5) }}°</span>
            <br />
            <span>纬度：{{ position[1].toFixed(5) }}°</span>
            <span>俯仰角：{{ rotation[1].toFixed(5) }}°</span>
            <br />
            <span>高度：{{ position[2].toFixed(2) }}m</span>
            <span>翻滚角：{{ rotation[2].toFixed(5) }}°</span>
            <br />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script lang='ts'>
/* eslint-disable */
import "./style/index.scss";
import EpsplanetButton from "../../base/button/button.vue";
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  watch,
} from "vue";
import { useEarth } from '../../utils';
export default defineComponent({
  name: "EpsplanetVideo",
  props: [],
  components: {
    EpsplanetButton,
  },
  setup(context) {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    let _video: any;
    const data = reactive({
      activeName: ["1"], //高级面板
      nearClip: 1, //近裁
      farClip: 1000, //远裁
      fovH: 10, //水平广角
      fovV: 10, //垂直广角
      position: [0, 0, 0], //经纬度
      rotation: [0, 0, 0], //偏转角
      videoUrl: "", //视频地址
      cameraVideoJson: [] as any[], //预设的video地址
      _video, //储存视频模型
      _disposers: [] as any[], //储存绑定事件
      positionEditing: false, //是否开启平移
      rotationEditing: false, //是否开启旋转
      videoName: "",
      panel: {
        position: { top: 0, left: 330 },
      },
      demoData: {},
      assistLine: true,
      setting: false,
      show: true,
    });
    watch(
      () => data.fovH,
      (value) => {
        data.fovH = Number(value.toFixed(0));
      }
    );
    watch(
      () => data.fovV,
      (value) => {
        data.fovV = Number(value.toFixed(0));
      }
    );
    watch(
      () => data.farClip,
      (value) => {
        data.farClip = Number(value);
      }
    );
    watch(
      () => data.nearClip,
      (value) => {
        data.nearClip = Number(value);
      }
    );
    onMounted(async () => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      del();
    });
    function init() {
      data.cameraVideoJson.push(
        {
          ref: "cameravideo",
          czmObject: {
            xbsjType: "CameraVideo",
            name: "玍海西桥监控1",
            videoUrl:
              "http://60.16.5.231:1280/gb28181/21010100001320001005.flv",
            position: [
              2.1240572232916772, 0.7335811944476671, 175.24124844676504,
            ],
            rotation: [2.151347155078313, 0, 0],
            far: 5000,
            near: 1,
          },
        },
        {
          ref: "cameravideo",
          czmObject: {
            xbsjType: "CameraVideo",
            name: "视频融合",
            videoUrl: "//www.earthsdk.com/v/last/XbsjEarthUI/assets/demo.mp4",
            position: [
              1.9017043698837766, 0.5972379094016695, 446.2499351617626,
            ],
            rotation: [
              0.07413323656963833, -0.933639537288121, 0.0003900191769634631,
            ],
            far: 5000,
            near: 1,
          },
        }
      );
    }
    // 点击预设好的对象，即可根据数据创建dui
    function clickCreatVideo(item: any) {
      data.videoUrl = item.czmObject.videoUrl;
      data.videoName = item.czmObject.name;
      createVideo(item.czmObject.position, item.czmObject.rotation);
      data._video.twoPostionsEditing = false;
      data.farClip = Number(item.czmObject.far);
      data.nearClip = Number(item.czmObject.near);
      data._video.flyTo(0);
    }
    function createVideo(pos = [0, 0, 0], rot = [0, 0, 0]) {
      del();
      data.setting = true;
      let cameraVideo = new XE.Obj.CameraVideo(earth);
      data._video = cameraVideo;
      cameraVideo.twoPostionsEditing = true;
      cameraVideo.videoUrl = data.videoUrl;
      cameraVideo.position = pos;
      cameraVideo.rotation = rot;
      data._disposers.push(
        XE.MVVM.bind(
          thisVue,
          "positionEditing",
          cameraVideo,
          "positionEditing"
        ),
        XE.MVVM.bind(
          thisVue,
          "rotationEditing",
          cameraVideo,
          "rotationEditing"
        ),
        XE.MVVM.bindPosition(thisVue, "position", cameraVideo, "position"),
        XE.MVVM.bindRotation(thisVue, "rotation", cameraVideo, "rotation"),
        XE.MVVM.bind(thisVue, "nearClip", cameraVideo, "near"),
        XE.MVVM.bind(thisVue, "farClip", cameraVideo, "far"),
        XE.MVVM.bind(thisVue, "videoUrl", cameraVideo, "videoUrl"),
        XE.MVVM.bindDegreeRadian(thisVue, "fovH", cameraVideo, "fovH"),
        XE.MVVM.bindDegreeRadian(thisVue, "fovV", cameraVideo, "fovV"),
        XE.MVVM.bind(thisVue, "show", cameraVideo, "show"),
        XE.MVVM.bind(thisVue, "assistLine", cameraVideo, "showHelper"),
        XE.MVVM.watch(() => {
          data.positionEditing = data._video.positionEditing;
          data.rotationEditing = data._video.rotationEditing;
        })
      );
    }
    // 保存
    function save() {
      data._video.name = data.videoName;
      data.videoName = "";
      let json = data._video.toAllJSON();
      let modelCzm = new XE.Obj.CameraVideo(earth);
      modelCzm.xbsjFromJSON(json);
      const sceneObject = new XE.SceneTree.Leaf(modelCzm);
      earth.sceneTree.root.children.push(sceneObject);
      confirmVideoDelivery(sceneObject);
      let time = setTimeout(() => {
        del();
        clearTimeout(time);
      }, 1000);
    }
    function confirmVideoDelivery(czmObject: any) {
      if (!earth.videoDelivery) {
        earth.videoDelivery = [];
      }
      earth.videoDelivery.push(czmObject);
      // this.$emit('commitPanel');
    }
    function del() {
      if (data._disposers) {
        data._disposers.forEach((d) => d());
        data._disposers.length = 0;
      }
      if (data._video) {
        data._video.destroy();
        data._video = undefined;
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      clickCreatVideo,
      createVideo,
      save,
      del,
    };
  },
});
</script>