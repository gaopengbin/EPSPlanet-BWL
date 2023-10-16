<template>
  <div class="epsplanet-panel-base cameraViewManager">
    <el-scrollbar height="auto">
      <div class="item-div" v-loading="loading">
        <ul class="xbsj-foot-ul" :key="index" v-for="(item, index) in items" @mouseenter="mouseenter(index)"
          @mouseleave="mouseleave(index)">
          <li @click="clickItem(index)">
            <img :src="item.thumbnail" class="xbsj-cameraview-img" :title="item.name" />
          </li>
          <li>
            <span v-if="item.showName" style="
                width: 70px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                display: inline-block;
              ">{{ item.name }}</span>
            <span v-if="!item.showName">
              <el-icon @click="openEditer(index)">
                <Setting />
              </el-icon>
              <el-icon @click="del(index, item.id)">
                <Delete />
              </el-icon>
            </span>
          </li>
        </ul>
      </div>
    </el-scrollbar>
    <div class="tool-panel-button">
      <el-button size="small" @click="add">添加视角</el-button>
    </div>
    <tool-panel ref="toolpanel" title="编辑" :panel="{ position: { top: 300, left: 400 }, showTitle: false }"
      @close="dialogVisible = false" @minimize="dialogVisible = false">
      <div class="epsplanet-panel-base" style="width: 450px">
        <el-form label-width="70px">
          <el-form-item label="名称">
            <el-input v-model="editObj.name" size="small"></el-input>
          </el-form-item>
          <el-form-item label="飞行时间">
            <el-slider style="width: 165px" v-model="editObj.duration" :min="0.5" :max="10" :step="0.1" />
          </el-form-item>
          <el-form-item label="位置">
            <el-input v-model="editObj.position[0]" style="width: 100px; margin: 5px">
            </el-input>
            <el-input v-model="editObj.position[1]" style="width: 100px; margin: 5px"></el-input>
            <el-input v-model="editObj.position[2]" style="width: 100px; margin: 5px"></el-input>
          </el-form-item>
          <el-form-item label="朝向">
            <el-input v-model="editObj.rotation[0]" style="width: 100px; margin: 5px">
            </el-input>
            <el-input v-model="editObj.rotation[1]" style="width: 100px; margin: 5px"></el-input>
            <el-input v-model="editObj.rotation[2]" style="width: 100px; margin: 5px"></el-input>
          </el-form-item>
        </el-form>
        <div class="tool-panel-button">

          <el-button @click="currentCamera()" size="small">当前相机</el-button>
          <!-- <span class="dialog-footer"> -->
          <el-button size="small" @click="dialogVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="edit()">确定</el-button>
          <!-- </span> -->
        </div>
      </div>
    </tool-panel>
  </div>
</template>

<script lang="ts">
import "./style/index.scss";
import axios from "axios";
import {
  defineComponent,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  reactive,
  toRefs,
  watch,
} from "vue";
import { useEarth } from '../../utils';
import toolPanel from "../../base/panel/panel.vue";

export default defineComponent({
  name: "EpsplanetCameraViewManager",
  components: {
    toolPanel,
  },
  setup() {
    const { proxy } = getCurrentInstance() as any;

    // todo
    const methods = {
      add() {
        //直接增加
        data.cvm
          .newView()
          .then((view) => {
            view.name = "视角";
            data.cvm.views.push(view);
            methods.getData();
          })
          .catch((err) => {
            console.log(err);
          });
      },
      getData() {
        data.items = [];
        earth.cameraViewManager.views.map((view) => {
          data.items.push(methods.fromView(view));
        });
      },
      fromView(view) {
        return {
          name: view.name,
          duration: view.duration,
          thumbnail: view.thumbnail,
          status: view.toReadable,
          showName: true,
          id: view.id,
        };
      },
      clickItem(index) {
        try {
          let views = data.cvm.views;
          views[index].flyTo();
        } catch (ex) {
          console.log(ex);
        }
      },
      mouseenter(index) {
        data.items[index].showName = false;
      },
      mouseleave(index) {
        data.items[index].showName = true;
      },
      del(index, id) {

        data.cvm.views.splice(index, 1);
        methods.getData();
      },

      openEditer(index) {
        data.editIndex = index;
        data.dialogVisible = true;
        proxy.$refs["toolpanel"].opened = true;

        // data.editObj = cloneDeep(data.cvm.views[index]);
        data.editObj = data.cvm.views[index].toJSON();
      },
      edit() {
        data.dialogVisible = false;
        proxy.$refs["toolpanel"].opened = false;
        data.cvm.views[data.editIndex] = {
          ...data.editObj
        }

        methods.getData();
      },
      currentCamera() {
        data.cvm.newView().then((view) => {
          data.editObj.position = view.position;
          data.editObj.rotation = view.rotation;
          data.editObj.thumbnail = view.thumbnail;
        });
      },
      queryViewList() {
        data.loading = true;
        axios.get(data.baseUrl + data.baseApi).then((res) => {
          earth.cameraViewManager.views = res.data.data;
          data.loading = false;
          data.autorunDisposer = XE.MVVM.watch(() => {
            methods.getData();
            data.cvm = earth.cameraViewManager;
          });
        });
      },
    };
    const data = reactive({
      cvm: {} as any,
      autorunDisposer: {} as any,
      items: [] as any,
      dialogVisible: false,
      editObj: {} as any,
      editIndex: 0,
      loading: false,
      baseUrl: "",
      baseApi: "",
    });
    watch(
      () => data.dialogVisible,
      (val) => {
        proxy.$refs["toolpanel"].opened = val;
        proxy.$refs["toolpanel"].show = val;
      }
    );
    let earth: any;
    onMounted(async () => {
      earth = useEarth();
      data.cvm = earth.cameraViewManager;
      methods.getData();
    });

    return { ...methods, ...toRefs(data) };
  },
});
</script>

