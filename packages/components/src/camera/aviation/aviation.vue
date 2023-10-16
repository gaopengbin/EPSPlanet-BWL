<template>
  <div class="epsplanet-panel-base aviation">
    <el-row :gutter="10">
      <el-col :span="12">
        <el-form ref="form" label-width="90px">
          <el-form-item label="路径名称">
            <el-input class="name-input" v-model="name" placeholder="请输入10个以内字符" size="small" maxlength="10"
              show-word-limit></el-input>
          </el-form-item>
          <el-form-item label="路径操作">
            <el-row>
              <el-col :span="8">
                <el-button size="small" class="tool" @click="init">创建</el-button></el-col>
              <el-col :span="8">
                <el-button size="small" class="tool" @click="editing = !editing" :disabled="length === 0">编辑</el-button>
              </el-col>
              <el-col :span="8"><el-button size="small" class="tool" @click="save" :disabled="length === 0">保存</el-button>
              </el-col>
            </el-row>
            <!-- <shp2Geojson
              class="import"
              :size="buttonSize"
              :toolTip="toolTip"
              @importDone="importDone"
            /> -->
          </el-form-item>
          <el-form-item>
            <PathManager @handle-edit="handleEdit" />
          </el-form-item>
          <!-- <el-form-item label="首尾相连">
        <el-switch v-model="loop"></el-switch>
      </el-form-item> -->
          <el-divider />
          <el-form-item label="模型绑定">
            <el-select placeholder="选择需要绑定的模型" v-model="modelUrl" @change="bindModel(modelUrl)" style="width: 80%">
              <el-option v-for="item in modelList" :key="item.czmObject.url" :label="item.czmObject.name"
                :value="item.czmObject.url"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="缩放">
            <el-slider v-model="scale" :min="0.01" :max="2" :step="0.01" show-input :show-input-controls="false" />
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <el-form label-width="90px">
          <el-form-item label="播放和录制">
            <template #default="scope">
              <el-icon :class="playing ? 'activated' : ''" @click.prevent="playing = true" title="播放">
                <VideoPlay />
              </el-icon>
              <el-icon @click.prevent="playing = false" title="暂停">
                <VideoPause />
              </el-icon>
              <el-icon :class="recording ? 'activated' : ''" @click="recording = !recording" title="录制">
                <VideoCamera />
              </el-icon>
              <el-icon :class="loopPlay ? 'activated' : ''" @click="loopPlay = !loopPlay" title="循环播放">
                <Refresh />
              </el-icon>
              <el-slider class="currentD" v-model.number="currentD" :disabled="length === 0" :min="0" :max="length"
                :step="0.01" :format-tooltip="formatSlider"></el-slider>
            </template>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="显示路径">
                <el-switch v-model="show" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示当前点">
                <el-switch v-model="currentShow" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="显示节点">
                <el-switch v-model="showDirection" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="沿切线方向">
                <el-switch v-model="alwaysAlongThePath" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="首尾相连">
                <el-switch v-model="loop" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模型显隐" v-if="hasModel">
                <el-switch v-model="showModel" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="运动速度">
            <el-slider v-model="currentSpeed" show-input :show-input-controls="false" :min="0" :max="100"
              :step="1"></el-slider>
          </el-form-item>
          <el-form-item label="漫游视角">
            <el-select v-model="currentView" @change="viewTypeChange" style="width: 50%" placeholder="请选择视角">
              <el-option v-for="item in viewOptions" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="视角距离">
            <el-slider
              v-model="viewD"
              @change="viewDChange"
              :disabled="isSliderDisabled"
              show-input
              :show-input-controls="false"
              :min="0"
              :max="1000"
              :step="1"
            ></el-slider>
          </el-form-item> -->
          <el-form-item label="视角高度">
            <el-slider v-model="viewHeight" @change="viewHeightChange" :disabled="isSliderDisabled || length === 0"
              show-input :show-input-controls="false" :min="0" :max="1000" :step="1"></el-slider>
          </el-form-item>
          <el-form-item> </el-form-item>
        </el-form>
        <el-collapse>
          <el-collapse-item title="高级">
            <el-form label-width="90px">
              <!-- <el-form-item label="高度偏移">
                  <el-slider
                    v-model="zOffset"
                    @change="calculateOffset(xOffset, yOffset, zOffset)"
                    show-input
                    :show-input-controls="false"
                    :min="0"
                    :max="100"
                    :step="1"
                  ></el-slider>
                </el-form-item> -->
              <el-form-item label="横向偏移">
                <el-slider v-model="xOffset" @change="calculateOffset(xOffset, yOffset, zOffset)"
                  :disabled="isSliderDisabled || length === 0" show-input :show-input-controls="false" :min="0" :max="100"
                  :step="1"></el-slider>
              </el-form-item>
              <el-form-item label="纵向偏移">
                <el-slider v-model="yOffset" @change="calculateOffset(xOffset, yOffset, zOffset)"
                  :disabled="isSliderDisabled || length === 0" show-input :show-input-controls="false" :min="0" :max="100"
                  :step="1"></el-slider>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import "./style/index.scss";
import axios from "axios";
import { useEarth } from '../../utils';
import { ElMessage, ElIcon, ElMessageBox } from "element-plus";
import PathManager from "../pathManager/pathManager.vue";
import ysFixWebmDuration from "fix-webm-duration";
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  watch,
} from "vue";

export default defineComponent({
  name: "EpsplanetAviation",
  components: { PathManager, ElIcon },
  setup() {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      hasModel: false,
      showModel: false,
      // _pathCzm: undefined, // 当前路径
      // _modelCzm: undefined, // 飞行器模型
      _disposer: [] as any, // 用于解除双向绑定的数组
      _viewDisposer: [] as any, //视角绑定数组
      alwaysAlongThePath: false, // 节点是否沿切线方向
      buttonSize: "small", // 上传面板的按钮大小
      cameraPosition: [], // 当前相机位置
      creating: false, // 是否处于创建模式
      currentD: 0, // 当前播放进度
      currentPosition: [], // 当前位置
      currentShow: false, // 是否显示当前点
      currentSpeed: 50, // 当前播放速度，单位为米/秒
      currentView: "", // 当前视角
      ellipsoid: undefined, // 椭球体
      editable: false, // 是否可编辑
      editing: false, // 是否处于编辑模式
      isEditing: false, // 当前是否在编辑（用于弹出提示信息）
      isSaved: false, // 是否已经保存
      isSliderDisabled: false, // 是否禁用滑块
      last: undefined as any, // 用于记录上一个编辑的对象
      length: 0, // 路径长度
      loop: false, // 是否首尾相连
      loopPlay: false, // 是否循环播放
      modelDisposer: [] as any, // 解除模型绑定数组
      modelUrl: "", // 模型数据
      modelList: [] as any, // 模型列表
      name: "未命名路径", // 路径名称
      offsetPosition: [], // 相机偏移位置
      playing: false, // 当前是否播放
      recorder: undefined, // 录制器
      recording: false, // 是否正在录制
      scale: 1, // 模型缩放比例
      showDirection: false, // 显示节点
      show: true, // 是否显示路径
      showOffset: true, // 是否显示偏移面板
      toolTip: "支持json格式路径文件", // 上传面板的提示
      viewD: 1000, // 视角距离：默认值200、最小值0、最大值1000.
      viewHeight: 1000, // 视角高度：当前相机高度、默认值50、最小值0、最大值1000.
      viewOptions: [
        {
          label: "第一视角",
          value: "firstPersonView",
        },
        {
          label: "跟随视角",
          value: "attachedView",
        },
      ],
      xOffset: 0, // 前后偏移：默认值0、最小值0、最大值1000.
      yOffset: 0, // 横向偏移：默认值0、最小值0、最大值1000.
      zOffset: 0, // 高度偏移：默认值0、最小值0、最大值1000.
    });
    let _pathCzm: any, _modelCzm: any;
    onMounted(async () => {
      earth = useEarth();
      thisVue.ellipsoid = earth.czm.scene.globe.ellipsoid;
      axios
        .get("Epsplanet_Assets/widgets/path/aviation/modelList.json")
        .then((res) => {
          data.modelList = res.data.modelList;
        })
        .catch((err) => {
          ElMessage.error("加载配置文件失败");
          del();
        });
    });
    onBeforeUnmount(() => {
      del();
    });
    watch(
      () => data.playing,
      (val) => {
        console.log("监听", val);
        if (!val && thisVue.cameraAttached) {
          _modelCzm.cameraAttached = false;
        }
      }
    );
    watch(
      () => data.recording,
      (val) => {
        console.log("监听", val);
        if (val) {
          recordScreen();
        } else {
          thisVue.recorder.stop();
          data.recording = false;
        }
      }
    );
    function init() {
      // data._disposer = [];
      // data.modelDisposer = [];
      // data.modelList = [];
      let path = new XE.Obj.Path(earth);
      console.log(path);
      _pathCzm = path;
      bindAttr();
      thisVue.creating = true;
    }

    function bindAttr() {
      thisVue._disposer = [];
      const bindProps = [
        "alwaysAlongThePath",
        "creating",
        "currentD",
        "currentPosition",
        "currentShow",
        "currentSpeed",
        "editing",
        "length",
        "loop",
        "loopPlay",
        "name",
        "playing",
        "show",
        "showDirection",
      ];
      // 双向绑定的属性
      bindProps.forEach((attr) => {
        thisVue._disposer.push(XE.MVVM.bind(thisVue, attr, _pathCzm, attr));
      });
    }

    // 获取模型
    // function getModelList() {
    //   if (earth.modelCollection && data.modelList.length === 0) {
    //     earth.modelCollection.forEach((m: any) => {
    //       let obj: any = {
    //         label: m.czmObject.name,
    //         value: m.czmObject.xbsjGuid,
    //       };
    //       data.modelList.push(obj);
    //     });
    //   }
    // }

    // 改变视角高度
    function viewHeightChange() {
      earth.camera.position[2] =
        thisVue.currentPosition[2] + thisVue.viewHeight;
    }

    // 改变视角距离
    function viewDChange() {
      const currentPosition = _pathCzm.currentPosition;
      const cameraPosition = earth.camera.position;
      let currentCartesian = Cesium.Cartesian3.fromRadians(
        currentPosition[0],
        currentPosition[1],
        currentPosition[2],
        thisVue.ellipsoid
      );
      let cameraCartesian = Cesium.Cartesian3.fromRadians(
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2],
        thisVue.ellipsoid
      );
      let direction = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(
          cameraCartesian,
          currentCartesian,
          new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
      );
      let scalar = Cesium.Cartesian3.multiplyByScalar(
        direction,
        thisVue.viewD,
        new Cesium.Cartesian3()
      );
      let newCameraPos = Cesium.Cartographic.fromCartesian(
        Cesium.Cartesian3.add(currentCartesian, scalar, new Cesium.Cartesian3())
      );
      earth.camera.position = [
        newCameraPos.longitude,
        newCameraPos.latitude,
        newCameraPos.height,
      ];
    }

    // 更改视角
    function viewTypeChange() {
      // _modelCzm.cameraAttached = true;
      if (thisVue.currentView === "firstPersonView") {
        // thisVue.showOffset = true;
        thisVue.isSliderDisabled = true;
      } else if (thisVue.currentView === "attachedView") {
        // thisVue.showOffset = false;
        thisVue.isSliderDisabled = false;
        earth.camera.rotation = [
          _modelCzm.xbsjRotation[0] + Math.PI * 0.5,
          _modelCzm.xbsjRotation[1] - Math.PI * 0.5,
          _modelCzm.xbsjRotation[2],
        ];
      }
      // thisVue.viewD = 50;
      // thisVue.viewHeight = 200;
      // thisVue.xOffset = 0;
      // thisVue.yOffset = 0;
      // thisVue.zOffset = 0;
    }

    // 计算偏移位置
    function calculateOffset(xVal: any, yVal: any, zVal: any) {
      // // 首先将当前位置转换为笛卡尔坐标
      // let ellipsoid = earth.czm.scene.globe.ellipsoid
      // let curCartesian = new Cesium.Cartesian3.fromRadians(
      //   thisVue.currentPosition[0], thisVue.currentPosition[1], thisVue.currentPosition[2], ellipsoid
      // )
      // console.log("cur: ", curCartesian)
      // // 转换后的坐标加上偏移量，得到偏移后坐标
      // let newPos = new Cesium.Cartesian3(curCartesian.x + xVal, curCartesian.y + yVal, curCartesian.z + zVal)
      // let newRad = ellipsoid.cartesianToCartographic(newPos);
      // console.log("newRad: ", newRad)
      _modelCzm.cameraAttachedOffsetPosition = [
        xVal / 6371004,
        yVal / 6371004,
        zVal,
      ];
    }

    // 将模型与路径绑定
    function bindModel(modelUrl) {
      clearModel();
      _modelCzm = new XE.Obj.Model(earth);
      _modelCzm.url = modelUrl;
      data.hasModel = true;
      data.showModel = true;
      // console.log(_modelCzm, _modelCzm.nativeModel());
      _modelCzm.xbsjPosition = _pathCzm.currentPosition;
      getBoundingRadius(_modelCzm).then((boundingRadius) => {
        if (typeof boundingRadius !== "number") {
          boundingRadius = 0;
        }
        boundingRadius *= thisVue.scale;
        data.modelDisposer.push(
          XE.MVVM.bind(thisVue, "scale", _modelCzm, "scale"),
          XE.MVVM.bind(thisVue, "showModel", _modelCzm, "show"),
          XE.MVVM.watch(_pathCzm, "currentPosition", (position: any) => {
            let pos = [...position];
            _modelCzm.xbsjPosition = [pos[0], pos[1], pos[2] + 0.1];

            if (thisVue.currentView === "firstPersonView") {
              earth.camera.rotation = _pathCzm.currentRotation;
              earth.camera.position = [
                _modelCzm.xbsjPosition[0],
                _modelCzm.xbsjPosition[1],
                _modelCzm.xbsjPosition[2] + 30 * thisVue.scale,
              ];
            } else if (thisVue.currentView === "attachedView") {
              thisVue.cameraAttached = true;
              earth.camera.position = [
                _modelCzm.xbsjPosition[0] + thisVue.xOffset / 6371004,
                _modelCzm.xbsjPosition[1] + thisVue.yOffset / 6371004,
                thisVue.viewHeight + boundingRadius + 200,
              ];
            }
          }),
          XE.MVVM.watch(_pathCzm, "currentRotation", (rotation: any) => {
            let cp = [...rotation];
            _modelCzm.xbsjRotation = [cp[0] - Math.PI * 0.5, cp[1], cp[2]];
          })
        );
      });
    }
    // 获取模型的包围面半径，以确定合适的观察高度
    async function getBoundingRadius(model) {
      let primitive = model.nativeModel();
      // 因为nativeModel可能返回undefined，故这里加一个判断
      if (primitive) {
        // 必须调用readyPromise，否则无法获取包围面
        let res = await primitive.readyPromise;
        return res.boundingSphere.radius;
      }
    }
    // 导入json路径文件
    function importDone(json) {
      // console.log(json);
      _pathCzm = new XE.Obj.Path(earth);
      const props = ["name", "positions", "rotations"];
      props.forEach((prop) => {
        _pathCzm[prop] = json.czmObject[prop];
      });
      bindAttr();
      _pathCzm.flyTo();
    }
    // 录制屏幕
    async function recordScreen() {
      let recordData: any = [];
      let startTime: any;
      // TODO: 这里用canvas串流录制出来是空文件，原因未知，目前改用DisplayMedia方式
      // const stream = earth.czm.viewer.canvas.captureStream();
      // @ts-ignore
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      // console.log(stream);
      const recorder = new MediaRecorder(stream, {
        MimeType: "video/mp4",
      } as any);
      thisVue.recorder = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size) {
          recordData.push(event.data);
        }
      };
      recorder.onstop = () => {
        console.log("stop");
        const duration = Date.now() - startTime;
        const buggyBlob = new Blob(recordData, { type: "video/mp4" });
        // 使用ysFixWebmDuration库修复视频文件进度条不能拖动的问题
        ysFixWebmDuration(buggyBlob, duration, function (fixedBlob) {
          const url = URL.createObjectURL(fixedBlob);
          // console.log(recordData, url);
          downloadFile(url);
          // 停止屏幕捕捉
          stream.getTracks().forEach((track) => track.stop());
        });
      };
      recorder.start();
      console.log("start");
      startTime = Date.now();
      // setTimeout(() => {
      //   recorder.stop();
      // }, 10000);
    }
    // 下载视频文件
    function downloadFile(url) {
      let link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "");
      link.click();
    }
    // 滑块数值格式
    function formatSlider(val) {
      return String(((val / thisVue.length) * 100).toFixed(2)) + "%";
    }
    // 清除路径
    function clearPath() {
      if (_pathCzm && !data.isSaved && !data.isEditing) {
        _pathCzm = _pathCzm && _pathCzm.destroy();
      }
    }
    // 清除模型绑定
    function clearModel() {
      if (data.modelDisposer.length) {
        data.modelDisposer.forEach((d: any) => d());
        data.modelDisposer.length = 0;
      }
      _modelCzm = _modelCzm && _modelCzm.destroy();
    }
    // 清除双向绑定
    function clearBind() {
      if (data._disposer) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
    }
    // 保存路径
    function save() {
      if (data.isEditing) {
        ElMessage.success("修改成功");
        data.isEditing = false;
      } else {
        const sceneObject = new XE.SceneTree.Leaf(_pathCzm);
        // console.log(earth.sceneTree);
        earth.sceneTree.root.children.push(sceneObject);
        // console.log(earth.sceneTree.root.children);
        data.editable = false;
        ElMessage.success("保存成功");
      }
      data.isSaved = true;
      data.editable = false;
      clearBind();
      clearModel();
    }
    // 编辑
    function handleEdit(current) {
      if (data.last && data.last.xbsjGuid === current.xbsjGuid) return;

      if (data.isEditing) {
        ElMessageBox.confirm("上个修改未保存，是否保存？", "Warning", {
          confirmButtonText: "保存",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            ElMessage.success("保存成功");
            data.last = current;
          })
          .catch(() => {
            ElMessage.info("取消保存");
            cancelEdit(data.last);
            data.last = current;
          });
      } else {
        data.last = current;
      }

      reBind(current);
    }
    function cancelEdit(obj) {
      earth.getObject(obj.xbsjGuid).xbsjFromJSON(obj);
    }
    function reBind(obj) {
      data.isEditing = true;
      clearBind();
      _pathCzm = earth.getObject(obj.xbsjGuid);
      data.editable = true;
      bindAttr();
    }
    function del() {
      if (data.isEditing) {
        ElMessageBox.confirm("上个修改未保存，是否保存？", "Warning", {
          confirmButtonText: "保存",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            ElMessage.success("保存成功");
          })
          .catch(() => {
            ElMessage.info("取消保存");
            cancelEdit(data.last);
          });
      }
      clearBind();
      clearModel();
      clearPath();
      data.isSaved = false;
    }
    return {
      ...toRefs(data),
      bindModel,
      calculateOffset,
      clearPath,
      formatSlider,
      handleEdit,
      importDone,
      init,
      recordScreen,
      save,
      viewHeightChange,
      viewDChange,
      viewTypeChange,
      _modelCzm,
    };
  },
});
</script>
<style scoped></style>
