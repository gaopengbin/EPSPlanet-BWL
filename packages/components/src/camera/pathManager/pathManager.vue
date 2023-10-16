<template>
  <div class="epsplanet-panel-base pathManager">
    <div class="pointTable">
      <!-- <div class="typeSelect" v-show="showTypeSelect">
        <button @click="tableData = pointData">点</button>
        <button @click="tableData = polylineData">线</button>
      </div> -->

      <el-table
        :data="tableData"
        :border="true"
        size="small"
        table-layout="auto"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column
          prop="name"
          label="路径名称"
          min-width="50"
        />
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-icon @click.prevent="locate(scope.row)" title="定位">
              <Location />
            </el-icon>
            <el-icon
              @click.prevent="showItem(scope.row)"
              v-show="getShow(scope.row)"
              title="显隐"
            >
              <View />
            </el-icon>
            <el-icon @click.prevent="edit(scope.row)" title="编辑"
              ><Edit
            /></el-icon>

            <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="确定删除该图形?"
              @confirm="deleteItem(scope.row)"
            >
              <template #reference>
                <el-icon title="删除">
                  <Delete />
                </el-icon>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- <el-button @click="exportJson" size="small" class="exportBtn"
        >导出<el-icon><Download /></el-icon
      ></el-button> -->
    </div>
  </div>
</template>

<script lang="ts">
import {
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
} from "vue";
import { useEarth } from '../../utils';

import {
  Download,
  Location,
  View,
  Hide,
  Delete,
} from "@element-plus/icons-vue";
import {
  ElTable,
  ElTableColumn,
  ElIcon,
  ElButton,
  ElPopconfirm,
} from "element-plus";

export default defineComponent({
  name: "EpsplanetPathManager",
  props: [],
  components: {
    Download,
    Location,
    View,
    Hide,
    Delete,
    ElTable,
    ElTableColumn,
    ElIcon,
    ElButton,
    ElPopconfirm,
  },
  setup(props, context) {
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    const data = reactive({
      tableData: [],
      disposer: [] as any,
      selectedItem: [] as any,
    });
    let earth;
    onBeforeMount(() => {});
    onMounted(async () => {
      earth = useEarth();
      data.disposer.push(
        XE.MVVM.watch(
          () => earth.sceneTree.root.children.length,
          () => {
            // console.log("监听到变化");
            getPathList();
          }
        )
      );
    });

    function getPathList() {
      let list: any = [];
      earth.pathCollection.forEach((path) => {
        let json = path.toJSON()
        json.name = path.name
        list.push(json);
      });
      data.tableData = list;
      // console.log(data.tableData);
      
    }

    //多选
    function handleSelectionChange(val) {
      // console.log(val);
      data.selectedItem = val;
    }

    function saveContentToFile(content, filename) {
      var link = document.createElement("a");
      var blob = new Blob([content]);
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
    function exportJson() {
      data.selectedItem.forEach((e) => {
        saveContentToFile(JSON.stringify(e), e.name + ".json");
      });
    }
    function locate(e) {
      // console.log(e);
      earth.getObject(e.xbsjGuid).flyTo();
    }
    function showItem(e) {
      earth.getObject(e.xbsjGuid).show = !earth.getObject(e.xbsjGuid).show;
    }
    function getShow(e) {
      // console.log(e);
      return earth.getObject(e.xbsjGuid).show;
    }
    function deleteItem(e) {
      let item = earth.getObject(e.xbsjGuid);
      // console.log(item);
      // removeLayersByCzmobject(item, earth);
      // item = item && item.destroy();
      earth.sceneTree.root.children.forEach(element => {
        if (element.title === item.name) {
          earth.sceneTree.root.children.remove(element)
        }
      })
    }
    function edit(current) {
      console.log(current);
      context.emit("handleEdit", current);
    }
    function del() {
      data.disposer.forEach((d) => d());
      data.disposer = [];
    }
    onBeforeUnmount(() => {
      del();
    });
    return {
      ...toRefs(data),
      edit,
      exportJson,
      deleteItem,
      getShow,
      handleSelectionChange,
      locate,
      showItem,
    };
  },
});
</script>
<style lang="scss">
.plotManager {
  .el-icon {
    font-size: medium;
    margin-left: 5px;

    &:hover {
      cursor: pointer;
      color: aqua;
    }
  }
  .exportBtn {
    float: right;
    margin: 10px 0;
  }
}
</style>
