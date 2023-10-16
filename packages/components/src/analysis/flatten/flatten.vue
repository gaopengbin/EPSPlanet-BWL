<template>
  <div class="epsplanet-panel-base" style="width: 480px">
    <el-form ref="form" label-width="80px" style="margin-bottom: 4px">
      <el-form-item label="名称">
        <el-input v-model="name" placeholder="未命名压平组" size="small" maxlength="15" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="压平瓦片">
        <el-select size="small" v-model="selectTileset" placeholder="请选择" @change="changeTileset"
          @visible-change="getTilesets" value-key="xbsjGuid" popper-class="tool-panel-popper">
          <el-option v-for="item in tilesetList" :key="item.xbsjGuid" :label="item.name" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="多边形">
        <el-table :data="polygonList" border>
          <el-table-column type="index" width="55" label="序号">
          </el-table-column>
          <el-table-column prop="height" label="高度" width="125">
            <template v-slot="scope">
              <el-input-number v-model="scope.row.height" placeholder="请输入内容" :step="0.1"
                @change="changeHeight(scope.row)" controls-position="right" style="width: 100px"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="showHelper" label="显示" width="70">
            <template v-slot="scope">
              <el-switch v-model="scope.row.showHelper" active-color="#13ce66" inactive-color="#dcdfe6"
                @change="showHelper(scope.row, scope.row.showHelper)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="province" label="定位" width="50">
            <template v-slot="scope">
              <el-icon :size="20" :color="'#281f1d'" @click="locate(scope.row)">
                <Location />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="province" label="编辑" width="50">
            <template v-slot="scope">
              <el-icon :size="20" :color="'#281f1d'" @click="edit(scope.row)">
                <Edit />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column align="left" width="50">
            <template v-slot:header="scope">
              <el-icon :size="20" :color="'#281f1d'" @click="add">
                <plus />
              </el-icon>
              <!-- <i class="el-icon-plus" @click="add"></i> -->
            </template>
            <template v-slot="scope">
              <el-icon :size="20" :color="'#281f1d'" @click="del(scope.$index)">
                <delete />
              </el-icon>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>

    <div class="tool-panel-button">
      <el-button size="small" @click="init">创建</el-button>
      <!-- <el-button size="small" @click="del">清除</el-button> -->
      <el-button size="small" @click="save">保存</el-button>
    </div>
    <PlotManager type="flatten" @handle-edit="handleEdit" />
  </div>
</template>
<script lang='ts'>
/* eslint-disable */
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
} from "vue";
import { useEarth } from '../../utils';
import PlotManager from "../../plot/plotmanager/plotmanager.vue";
import { ElMessage, ElMessageBox, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElTable, ElTableColumn, ElInputNumber, ElSwitch, ElIcon } from "element-plus";

export default defineComponent({
  name: "EpsplanetFlatten",
  props: [],
  components: {
    PlotManager,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElTable,
    ElTableColumn,
    ElInputNumber,
    ElSwitch,
    ElIcon,
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      label: {
        flattnTileset: "压平瓦片",
        cutSurface: "挖坑",
        polygon: "多边形",
      },
      name: "未命名压平组",
      tilesetList: [] as any,
      cutSurface: false,
      polygonList: [] as any,
      _flattenObj: undefined,
      selectTileset: undefined as any,
      tips: "shift + 鼠标右键结束绘制；鼠标右键结束编辑",
      _disposers: [] as any,
      isSaved: false,
      isEditing: false,
      lastCzmobj: undefined as any,
    });
    let _flattenObj: any;
    onMounted(async () => {
      earth = useEarth();
      getTilesets();
    });
    onBeforeUnmount(() => {
      destroy();
    });

    function init() {
      getTilesets();
      let flatten = new XE.Obj.FlattenedPolygonCollection(earth);
      flatten.name = data.name;
      _flattenObj = flatten;
      if (data.selectTileset) {
        changeTileset(data.selectTileset);
      }
      data._disposers.push(XE.MVVM.bind(thisVue, "name", flatten, "name"));
      console.log(flatten);
    }
    function computePolyList() {
      data.polygonList = [];
      _flattenObj.polygons.forEach((polygon: any, index: any) => {
        data.polygonList.push({
          id: polygon.guid,
          height: Number(polygon.height).toFixed(2),
          edit: polygon.edit,
          showHelper: polygon.showHelper,
          index: index,
        });
      });
    }
    function locate(row: any) {
      console.log("loca", _flattenObj.polygons[row.index]);
      _flattenObj.polygons[row.index].flyTo();
    }
    function add() {
      if (!_flattenObj) {
        init();
      }
      _flattenObj.polygons.push({});
      _flattenObj.polygons[_flattenObj.polygons.length - 1].creating = true;
      // let disposer = [];
      data._disposers.push(
        XE.MVVM.watch(
          () => _flattenObj.polygons[_flattenObj.polygons.length - 1].creating,
          () => {
            if (
              !_flattenObj.polygons[_flattenObj.polygons.length - 1].creating
            ) {
              console.log(
                _flattenObj.polygons[_flattenObj.polygons.length - 1].height
              );
              computePolyList();
              data._disposers.forEach((e: () => any) => e());
              data._disposers.length = 0;
            }
          }
        )
      );

      console.log(data.polygonList);
    }
    function edit(row: any) {
      _flattenObj.polygons[row.index].editing = true;
      // let disposer = [];
      data._disposers.push(
        XE.MVVM.watch(
          () => _flattenObj.polygons[_flattenObj.polygons.length - 1].editing,
          () => {
            if (
              !_flattenObj.polygons[_flattenObj.polygons.length - 1].editing
            ) {
              console.log(
                _flattenObj.polygons[_flattenObj.polygons.length - 1].height
              );
              computePolyList();
              data._disposers.forEach((e: () => any) => e());
              data._disposers.length = 0;
            }
          }
        )
      );
    }
    function del(index: any) {
      ElMessageBox.confirm("确认删除？", "Warning", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          ElMessage.success("已删除");
          _flattenObj.polygons[index].destroy();
          _flattenObj.polygons.splice(index, 1);
          computePolyList();
        })
        .catch(() => {
          ElMessage.info("已取消");
        });
    }
    function getTilesets() {
      data.tilesetList = [];

      earth.tilesetCollection.forEach((t: any, index: any) => {
        data.tilesetList.push({
          name: t.name,
          index: index,
          xbsjGuid: t.xbsjGuid,
          xbsjFlattenGuid: t.xbsjFlattenGuid,
        });
      });
    }
    function changeTileset(t: any) {
      console.log(t, data.selectTileset);
      let tileset = earth.getObject(t.xbsjGuid);
      // earth.tilesetCollection.forEach(
      //   (t: any) => (tileset.xbsjFlattenGuid = "")
      // );
      if (_flattenObj) {
        tileset.xbsjFlattenGuid = _flattenObj.xbsjGuid;
      }
    }
    function showHelper(row: any, show: any) {
      _flattenObj.polygons[row.index].showHelper = show;
    }
    function changeHeight(row: any) {
      _flattenObj.polygons[row.index].height = row.height;
    }
    function save() {
      data.isSaved = true;
      if (data.isEditing) {
        ElMessage.success("修改成功");
        data.isEditing = false;
        data.lastCzmobj = undefined;
      } else {
        const sceneObject = new XE.SceneTree.Leaf(_flattenObj);
        earth.sceneTree.analysis.flatten.children.push(sceneObject);
        // data.editable = false;
        ElMessage.success("保存成功");
      }
      // data.editable = false;

      if (data._disposers) {
        data._disposers.forEach((d: () => any) => d());
        data._disposers.length = 0;
      }
      clearParam();
    }
    function clearParam() {
      _flattenObj = undefined
      data.name = "未命名压平组";
      data.polygonList = [];
      data.selectTileset = undefined;
    }
    function handleEdit(czmObj) {
      if (data.lastCzmobj && data.lastCzmobj.xbsjGuid == czmObj.xbsjGuid)
        return;

      if (data.isEditing) {
        ElMessageBox.confirm("上个修改未保存，是否保存？", "Warning", {
          confirmButtonText: "保存",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            ElMessage.success("保存成功！");
            data.lastCzmobj = czmObj;
          })
          .catch(() => {
            ElMessage.info("取消保存");
            cancelEdit(data.lastCzmobj);
            console.log(data.lastCzmobj, czmObj);
            data.lastCzmobj = czmObj;
          });
      } else {
        data.lastCzmobj = czmObj;
      }
      reBind(czmObj);
    }
    function cancelEdit(czmObject) {
      earth.getObject(czmObject.xbsjGuid).xbsjFromJSON(czmObject);
    }
    function getTilesetByFlattenGuid(flattenGuid) {
      data.tilesetList.forEach((t) => {
        if (t.xbsjFlattenGuid == flattenGuid) {
          data.selectTileset = t;
        }
      });
    }
    function reBind(czmObj) {
      data.isEditing = true;
      if (data._disposers) {
        data._disposers.forEach((d: () => any) => d());
        data._disposers.length = 0;
      }
      let flatten = earth.getObject(czmObj.xbsjGuid);
      _flattenObj = flatten;
      getTilesetByFlattenGuid(flatten.xbsjGuid);
      // data.selectTileset = { xbsjGuid: flatten.xbsjGuid };
      data._disposers.push(XE.MVVM.bind(thisVue, "name", flatten, "name"));
      computePolyList();
    }
    function destroy() {
      if (data.isEditing) {
        ElMessageBox.confirm("上个修改未保存，是否保存？", "Warning", {
          confirmButtonText: "保存",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            ElMessage.success("保存成功！");
          })
          .catch(() => {
            ElMessage.info("取消保存");
            cancelEdit(data.lastCzmobj);
          });
      }
      if (_flattenObj && !data.isSaved && !data.isEditing) {
        _flattenObj.polygons.forEach((p: { destroy: () => any }) =>
          p.destroy()
        );
        _flattenObj.destroy();
        _flattenObj = undefined;
        data.polygonList = [];
      }
      if (data._disposers) {
        data._disposers.forEach((d: () => any) => d());
        data._disposers.length = 0;
      }
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      computePolyList,
      locate,
      add,
      edit,
      showHelper,
      changeHeight,
      destroy,
      getTilesets,
      changeTileset,
      del,
      save,
      handleEdit,
    };
  },
});
</script>
<style scoped></style>