<!-- 改平分析 -->
<template>
  <div class="epsplanet-panel-base leveling">
    <el-form label-width="120px">
      <el-form-item label="改平区域">
        <el-button class="tool" @click="createArea" style="margin-right: 10px">绘制</el-button>
        <!-- <shp2Geojson @importDone="importDone" /> -->
      </el-form-item>
      <el-form-item label="采样间距(m)">
        <el-input-number v-model="gridWidth" />
      </el-form-item>
      <el-form-item label="基准面高程(m)">
        <el-input-number v-model="height" />
      </el-form-item>
      <el-form-item>
        <el-button size="small" v-if="computing" @click="stopCompute">停止计算</el-button>
        <el-button size="small" v-else @click="startCompute">开始计算</el-button>
        <!-- <el-button size="small" @click="showDialog">保存图形结果</el-button> -->
      </el-form-item>
      <el-form-item>
        <el-progress v-show="computing" type="circle" width="70" :percentage="(progress * 100).toFixed(1)"></el-progress>
      </el-form-item>
      <el-form-item>
        <textarea id="leveling-text" readonly cols="30" rows="10" :value="value"></textarea>
      </el-form-item>
    </el-form>
    <!-- <el-dialog title="保存" v-model="dialogVisible">
      <el-form>
        <el-form-item label="对象名称">
          <el-input
            v-model="name"
            placeholder="请输入10个以内字符"
            size="small"
            maxlength="10"
            show-word-limit
          ></el-input>
        </el-form-item>
        <PlotManager type="polygon" />
        <el-form-item>
          <el-button size="small" @click="save">保存</el-button>
          <el-button size="small" @click="dialogVisible = false"
            >关闭</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog> -->
  </div>
</template>

<script lang="ts">
import "./style/index.scss";
import {
  reactive,
  toRefs,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { ElMessage } from "element-plus";
import { useEarth } from '../../utils';
// import shp2Geojson from "~/components/others/shp2Geojson.vue";
// import PlotManager from "~/components/base/plotManager/src/plotManager.vue";
// import { Service } from "~/utils/service";
export default defineComponent({
  name: "EpsplanetLeveling",
  // components: {
  //   shp2Geojson,
  //   PlotManager,
  // },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      _cutFillComputing: undefined as any,
      _disposers: [] as any,
      computing: false,
      dialogVisible: false,
      height: 0.0,
      isSaved: false,
      levelingHeight: 0.0,
      levelPolygon: undefined as any,
      name: "未命名对象",
      polygonCreating: false,
      progress: 0,
      gridWidth: 3.0,
      results: {
        area: 0.0,
        total: 0.0,
      } as any,
      value: "",
    });
    let sunwayEarth: any;
    onMounted(() => {
      sunwayEarth = useEarth();
      if (!thisVue._cutFillComputing) init()
    });
    onBeforeUnmount(() => {
      del();
    });
    function init() {
      thisVue._cutFillComputing = sunwayEarth.analyzation.cutFillComputing;
      thisVue._cutFillComputing._polygon.color = [0, 255, 0, 0.01]
      // console.log(thisVue._cutFillComputing);
      thisVue.value = "请绘制区域，鼠标左键添加点，右键+shift结束绘制。或导入一个区域。\n";
      const bindProps = [
        "polygonCreating",
        "progress",
        "computing",
        "height",
        "gridWidth",
        "results.area",
        "results.total",
      ];
      bindProps.forEach((p) => {
        thisVue._disposers.push(
          XE.MVVM.bind(thisVue, p, thisVue._cutFillComputing, p)
        );
      });
      thisVue._disposers.push(
        XE.MVVM.watch(
          () => thisVue._cutFillComputing.computing,
          () => {
            if (
              !thisVue._cutFillComputing.computing &&
              thisVue._cutFillComputing.progress === 1 &&
              thisVue._cutFillComputing.positions.length > 2
            ) {
              thisVue.value += `计算完毕，区域面积为：${thisVue.results.area.toFixed(
                2
              )}㎡\n`;
              getLeveling();
              thisVue.value += `蓝色区域为改平平面。最终改平高程为${thisVue.levelingHeight.toFixed(
                2
              )}m\n`;
            }
          }
        )
      );
    }
    // 导入区域
    function importDone(geojson) {
      let type = turf.getType(geojson);
      let flatten = turf.flatten(geojson);
      let union = turf.union(...flatten.features);
      let coordinates = turf.coordAll(union);
      let positions: any = [];
      coordinates.forEach((p) => {
        positions.push(
          turf.degreesToRadians(p[0]),
          turf.degreesToRadians(p[1])
        );
      });
      thisVue._cutFillComputing.positions = positions;
      thisVue._cutFillComputing._polygon.flyTo();
    }
    // 创建区域
    function createArea() {
      del()
      nextTick(() => {
        init()
        thisVue._cutFillComputing.polygonCreating = true;
      });
    }
    // 开始计算
    function startCompute() {
      // console.log(thisVue._cutFillComputing.positions);
      thisVue.value = "";
      if (thisVue._cutFillComputing.positions.length > 2) {
        if (thisVue.gridWidth < 3) {
          thisVue.value += `提示：采样间隔较小，计算时间可能较长。\n`;
        }
        thisVue.value += `采样间距：${thisVue.gridWidth.toFixed(2)}m\n`;
        thisVue.value += `基准面高程：${thisVue.height.toFixed(2)}m\n`;
        thisVue.value += `改平分析计算中...\n`;
        try {
          thisVue._cutFillComputing.compute();
        } catch (error) {
          thisVue.computing = false;
          thisVue.value += `计算出错，请重试！\n`;
        }
      } else {
        thisVue.value += `未找到有效区域, 请先导入或绘制区域。\n`;
      }
    }
    // 停止计算
    function stopCompute() {
      if (thisVue.computing) {
        thisVue.computing = false;
        thisVue.value += `已终止计算，请重新开始。\n`;
      }
    }
    // 绘制改平平面
    function getLeveling() {
      const heightDiff = thisVue.results.total / thisVue.results.area;
      // 如果净挖填量total为正（需要填入），则减去高度差；如果净挖填量为负（需要挖出），则加上高度差（减去负值）。
      thisVue.levelingHeight = thisVue.height - heightDiff;
      thisVue.levelPolygon = new XE.Obj.Plots.GeoPolygon(sunwayEarth);
      thisVue.levelPolygon.ground = false;
      thisVue.levelPolygon.outlineColor = [0, 0, 255, 1];
      thisVue.levelPolygon.color = [0, 0, 255, 0.1]
      // 根据原区域，确定改平面的坐标
      for (
        let i = 0;
        i < thisVue._cutFillComputing.positions.length - 1;
        i += 2
      ) {
        const x = thisVue._cutFillComputing.positions[i];
        const y = thisVue._cutFillComputing.positions[i + 1];
        thisVue.levelPolygon.positions.push([x, y, thisVue.levelingHeight]);
      }
    }
    // 显示弹框
    function showDialog() {
      if (thisVue.levelPolygon) {
        thisVue.dialogVisible = true;
      } else {
        ElMessage.warning("请先进行计算！");
      }
    }
    // 保存结果
    function save() {
      thisVue.levelPolygon.name = thisVue.name;
      const sceneObject = new XE.SceneTree.Leaf(thisVue.levelPolygon);
      sunwayEarth.sceneTree.plots.polygon.children.push(sceneObject);
      ElMessage.success("保存成功");
      thisVue.isSaved = true;
    }
    // 清空挖填面
    function clearCutFill() {
      thisVue._cutFillComputing.clearResults();
      thisVue._cutFillComputing.polygonCreating = false;
      thisVue._cutFillComputing.positions = [];
      // thisVue._cutFillComputing._polygon = new XE.Obj.Plots.GeoPolygon(sunwayEarth)
    }
    function del() {
      clearCutFill();
      if (thisVue.levelPolygon && !thisVue.isSaved) {
        thisVue.levelPolygon.destroy();
        thisVue.levelPolygon = undefined;
      }
      thisVue._disposers.forEach((d: any) => d());
      thisVue._disposers.length = 0;
    }
    return {
      ...toRefs(data),
      importDone,
      createArea,
      startCompute,
      stopCompute,
      showDialog,
      save,
    };
  },
});
</script>
