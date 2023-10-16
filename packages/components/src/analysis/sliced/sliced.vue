<template>
  <div class="epsplanet-panel-base sliced" style="width: 310px">
    <!-- <el-scrollbar height="202px"> -->
    <el-form ref="form" label-width="78px" :inline="true">
      <el-form-item label="图层">
        <el-select v-model="selectScene" placeholder="请选择场景数据" class="selectcla" @change="changeTileset"
          @visible-change="readScenetree">
          <el-option v-for="tile in tilesetOptions" :key="tile.value" :label="tile.label" :value="tile.value" />
        </el-select>
        <!-- <span>请先绘制剖切线</span> -->
      </el-form-item>
      <el-form-item label="辅助面">
        <el-switch v-model="ifShow" active-color="#13ce66" inactive-color="#dcdfe6"></el-switch>
      </el-form-item>
      <el-form-item label="剖切方式">
        <el-switch class="switch" v-model="section" inline-prompt active-color="#13ce66" inactive-color="#dcdfe6"
          active-text="纵" inactive-text="横" @change="SectionMethod"></el-switch>
      </el-form-item>
      <el-form-item label="">
        <el-collapse>
          <el-collapse-item title="高级属性">
            <span class="demonstration">姿态</span>
            <div class="slider-demo-block">
              <!-- <span class="demonstration">X</span> -->
              <el-slider v-model="rotation[0]" :min="-180" :max="180" :step="1" style="width: 185px" show-input
                :show-input-controls="false"></el-slider>
            </div>
            <div class="slider-demo-block">
              <!-- <span class="demonstration">Y</span> -->
              <el-slider v-model="rotation[1]" :min="-180" :max="180" :step="1" style="width: 185px" show-input
                :show-input-controls="false"></el-slider>
            </div>
            <div class="slider-demo-block">
              <!-- <span class="demonstration">Z</span> -->
              <el-slider v-model="rotation[2]" :min="-180" :max="180" :step="1" style="width: 185px" show-input
                :show-input-controls="false"></el-slider>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button">
      <el-button size="small" @click="positionEditing = !positionEditing">平移</el-button>
      <el-button size="small" @click="rotationEditing = !rotationEditing">旋转</el-button>
      <!-- <el-button size="small" @click="save">保存</el-button> -->
    </div>
    <!-- </el-scrollbar> -->
  </div>
</template>
<script lang='ts'>
/* eslint-disable */
import "./style/index.scss";
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
} from "vue";
import { useEarth } from '../../utils';

export default defineComponent({
  name: "EpsplanetSliced",
  props: [],
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    let earth: any;
    // interface tileset {
    //   label: string,
    //   value: string
    // };
    const data = reactive({
      name: "剖切面对象", //剖切面对象名称
      section: true, //纵剖:true 横剖:false
      rotation: [0, 0, 0], //姿态 [偏航角、俯仰角、翻转角]
      ifShow: true, //是否显示辅助面
      linked: true, //是否关联
      positionEditing: false,
      rotationEditing: false,
      tilesetOptions: [{}] as any, // 场景树种的tileset类型数据
      selectScene: undefined, //选中的场景
    });
    let clippingPlane: any;
    let polylineCzm: any;//剖切线
    let tiletest: any;
    let _disposer: any = [];
    let curtileset: any;
    onMounted(async () => {
      earth = useEarth();
      if (!clippingPlane) {
        //试验数据，大雁塔倾斜模型，tileset格式
        // methods.addtestdata();
      }
    });
    onBeforeUnmount(() => {
      methods.del();
    });
    const methods = {
      init(position: any, create: boolean = true, rotation: any = [0, 0, 0]) {
        if (create) {
          //创建剖切面对象
          clippingPlane = new XE.Obj.ClippingPlane(earth);
          clippingPlane.name = thisVue.name;
          clippingPlane.position = position;
          curtileset.xbsjClippingPlanes = { planes: [clippingPlane.xbsjGuid] };
          _disposer = [];
          _disposer.push(
            XE.MVVM.bind(
              thisVue,
              "positionEditing",
              clippingPlane,
              "positionEditing"
            ),
            XE.MVVM.bind(
              thisVue,
              "rotationEditing",
              clippingPlane,
              "rotationEditing"
            ),
            XE.MVVM.bind(thisVue, "ifShow", clippingPlane, "show"),
            XE.MVVM.bindRotation(thisVue, "rotation", clippingPlane, "rotation")
          );
        } else {
          clippingPlane.position = position;
          curtileset.xbsjClippingPlanes = { planes: [clippingPlane.xbsjGuid] };
        }

        thisVue.rotation = rotation;
      },
      addtestdata() {
        //试验数据，大雁塔倾斜模型，tileset格式
        let model = {
          ref: "tileset",
          czmObject: {
            xbsjType: "Tileset",
            xbsjGuid: "b4137394-d346-4434-a01e-5b2d3730ec9f",
            name: "大雁塔模型",
            url: "//lab.earthsdk.com/model/f15b9e90ac2d11e99dbd8fd044883638/tileset.json",
            xbsjPosition: [
              1.9016974701882112, 0.5972325152147303, 425.8641913624607,
            ],
            xbsjUseOriginTransform: false, //xbsjUseOriginTransform: false的情况下，xbsjPosition才有效
            // xbsjClippingPlanes: {
            //   planes: [clippingPlane.xbsjGuid],
            // },
          },
        };
        let model2 = {
          ref: "test2",
          czmObject: {
            name: "南石槽子桥",
            xbsjType: "Tileset",
            xbsjGuid: "b4137394-d346-4434-a01e-5b2d3730ec9a",
            url: "http://jojo1986.f3322.net:2020/data/3dtiles/%E5%8D%97%E7%9F%B3%E6%A7%BD%E5%AD%90%E6%A1%A5/tileset.json",
            xbsjUseOriginTransform: false, //xbsjUseOriginTransform: false的情况下，xbsjPosition才有效
            xbsjPosition: [
              (124.461089 / 180) * Math.PI,
              (40.444334 / 180) * Math.PI,
              0,
            ],
            // xbsjClippingPlanes: {
            //   planes: [clippingPlane.xbsjGuid],
            // },
          },
        };
        let model3 = {
          ref: "test3",
          czmObject: {
            name: "倾斜模型测试1",
            xbsjType: "Tileset",
            xbsjGuid: "b4137394-d346-4434-a01e-5b2d3730ec9a",
            url: "http://192.168.31.128:11215/epsplanet/redirect/440a7e9564ea46809d6c0471cf25b84f/文件1/18ccc169ee2d4c79997ec65005abb32d/tileset.json?token=BbNgktJDJkqE2Sj1Iivy0gjQwLIlZAfN",
            // xbsjUseOriginTransform: false, //xbsjUseOriginTransform: false的情况下，xbsjPosition才有效
            // xbsjPosition: [
            //   (124.461089 / 180) * Math.PI,
            //   (40.444334 / 180) * Math.PI,
            //   0,
            // ],
          },
        };
        // earth.sceneTree.root.children.push(model3);
        // tiletest = earth.sceneTree.$refs.test3.czmObject;
        // tiletest.flyTo();
      },
      DrwaClipLine() {
        earth.czm.viewer.scene.globe.depthTestAgainstTerrain = true; // 开启深度监测
        // 创建线段，设置参数
        polylineCzm = new XE.Obj.Plots.GeoPolyline(earth);
        polylineCzm.arcType = "NONE";
        polylineCzm.ground = false;
        polylineCzm.creating = true;
        polylineCzm.color = [1, 1, 0, 0.5];
        // 监听线段的点数，并计算线段的rotation和position
        _disposer.push(XE.MVVM.watch(() => polylineCzm.positions.length, () => {
          if (polylineCzm.positions.length > 2) {
            polylineCzm.creating = false;
            polylineCzm.show = false;
            let result = XE.Tool.Math.hpr(
              polylineCzm.positions[0],
              polylineCzm.positions[1]
            );
            let a = thisVue.section == true ? (Math.round((((result[0] * 180) / Math.PI + 90) % 360) * 100) / 100) : 0;
            let b = thisVue.section == false ? (Math.round((((result[1] * 180) / Math.PI + 90) % 360) * 100) / 100) : 0;
            let c = Math.round((((result[2] * 180) / Math.PI + 90) % 360) * 100) / 100 && 0;

            let x = (polylineCzm.positions[0][0] + polylineCzm.positions[1][0]) / 2;
            let y = (polylineCzm.positions[0][1] + polylineCzm.positions[1][1]) / 2;
            let z = (polylineCzm.positions[0][2] + polylineCzm.positions[1][2]) / 2;

            // 创建剖切面
            let position = [x, y, z];
            let rotation = [a, b, c];
            if (!clippingPlane) methods.init(position, true, rotation);
            else methods.init(position, false, rotation);
          }
        }))
      },
      changeTileset(val) {
        if (curtileset) curtileset.xbsjClippingPlanes = {};
        earth.tilesetCollection.forEach((node) => {
          if (node.xbsjGuid == val) {
            curtileset = node;
            let position: any[] = [];
            for (let i = 0; i < node.xbsjPosition.length; i++) {
              position.push(node.xbsjPosition[i]);
            }
            // node.flyTo();
            node.show = true;
            // node.xbsjClippingPlanes = {
            //   planes: [clippingPlane.xbsjGuid],
            // };
            // clippingPlane.position = position;
          }
        });
        if (!polylineCzm) {
          methods.DrwaClipLine();
        }
        else {
          polylineCzm.creating = true;
          polylineCzm.show = true;
        }

      },
      //下拉框出现时读取场景树
      readScenetree(val) {
        if (val) {
          data.tilesetOptions = [];
          earth.tilesetCollection.forEach((node) => {
            let json = {
              value: node.xbsjGuid,
              label: node.name,
            };
            data.tilesetOptions.push(json);

          });
        }
      },
      SectionMethod() {
        if (thisVue.section) {
          thisVue.rotation[1] = 0;
        } else {
          thisVue.rotation[1] = 90;
        }
      },
      del() {
        earth.czm.viewer.scene.globe.depthTestAgainstTerrain = false; // 关闭深度监测
        clippingPlane = clippingPlane && clippingPlane.destroy();
        polylineCzm = polylineCzm && polylineCzm.destroy();
        if (tiletest) {
          earth.sceneTree.root.children.forEach((node) => {
            if (node.czmObject.xbsjGuid == tiletest.xbsjGuid) {
              earth.sceneTree.root.children.remove(node);
            }
          });
        }
        if (_disposer) {
          _disposer.forEach((d: any) => d());
          _disposer.length = 0;
        }
      },
    };
    const refData = toRefs(data);
    return {
      ...refData,
      ...methods,
    };
  },
});
</script>