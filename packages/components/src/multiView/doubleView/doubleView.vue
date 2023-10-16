<template>
  <div class="tool-panel-base" style="width: 350px;text-align: left;">
    <el-switch style="margin-left:18px" v-model="bind" inactive-color="#dcdfe6" active-text="视角绑定"></el-switch>
    <br>
    <el-tabs tab-position="left" v-model="activeName">
      <el-tab-pane label="左侧" name="1">
        <el-tree ref="treeLeft" :props="treeProps" :data="treeDataLeft" node-key="id" @checkChange="handleCheckLeft"
          show-checkbox empty-text="暂无数据" />
      </el-tab-pane>
      <el-tab-pane label="右侧" name="2">
        <el-tree ref="treeRight" :props="treeProps" :data="treeDataRight" node-key="id" @checkChange="handleCheckRight"
          show-checkbox empty-text="暂无数据" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  onMounted,
  onBeforeUnmount,
  defineComponent,
  getCurrentInstance,
  watch,
} from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { useEarth } from '../../utils';

export default defineComponent({
  name: "EpsplanetDoubleView",
  setup() {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const data = reactive({
      _disposer: [0],
      customLayers: [] as any, // 用户自定义图层，可以添加到右侧，可在配置文件中修改
      activeName: "1",
      defaultCheckedLeft: [] as any,
      defaultCheckedRight: [] as any,
      objList: [0],
      treeDataLeft: [] as any,
      treeDataRight: [] as any,
      bind: false,
      treeProps: {
        label: "label",
        // id: "xbsjGuid",
        children: "children",
      },
    });
    let _newEarth: any, leftContainer: any, watchUnbind: any;
    watch(() => data.bind, () => {
      if (data.bind) {
        bindView()
      } else {
        unbindView()
      }
    })
    onMounted(async () => {
      earth = useEarth();
      await axios
        .get("Epsplanet_Assets/widgets/multiView/doubleView/config.json")
        .then((res) => {
          data.customLayers = res.data.customLayers;
        })
        .catch((err) => {
          ElMessage.error("加载配置文件失败");
        });
      if (!_newEarth) {
        init();
      } else {
        del();
      }
    });
    onBeforeUnmount(() => {
      if (_newEarth) {
        del();
      }
    });
    const init = () => {
      data._disposer = [];
      data.objList = [];
      // 获取原始地球容器，尺寸缩小50%
      let cesiumViewer = document.getElementsByClassName("cesium-viewer")[0];
      leftContainer = cesiumViewer.parentElement;
      let parent = leftContainer.parentElement;
      leftContainer.style.width = "50%";
      leftContainer.style.display = "inline-block";

      // 设置新的容器样式，并添加地球
      let rightContainer = document.createElement("div");
      rightContainer.id = "rightContainer";
      rightContainer.style.width = "50%";
      rightContainer.style.height = leftContainer.style.height;
      rightContainer.style.display = "inline-block";
      parent.appendChild(rightContainer);

      let newEarth = new XE.Earth("rightContainer");
      // console.log(newEarth);
      _newEarth = newEarth;
      // _newContainer = rightContainer;
      // 复制场景树中的内容到右侧
      _newEarth.sceneTree.root.xbsjFromJSON(
        earth.sceneTree.root.toAllJSON()
      );
      _newEarth.sceneTree.root.children.push(...data.customLayers);
      data.treeDataLeft = getChildList(
        earth.sceneTree.root.children,
        data.defaultCheckedLeft
      );
      data.treeDataRight = getChildList(
        _newEarth.sceneTree.root.children,
        data.defaultCheckedRight
      );
      proxy.$refs.treeLeft.setCheckedKeys(data.defaultCheckedLeft);
      proxy.$refs.treeRight.setCheckedKeys(data.defaultCheckedRight);
      // watchUnbind = XE.MVVM.watch(
      //   () => earth.sceneTree.root.toJSONStr(),
      //   () => {
      //     refresh();
      //   }
      // )
    };

    // 获取当前场景树中的数据
    const getChildList = (node, defaultChecked) => {
      let childList: any = [];
      node.forEach((n) => {
        if (n.children) {
          let child = getChildList(n.children, defaultChecked);
          childList.push({
            label: n.title,
            children: child,
            id: n.xbsjID,
          });
          // if (n.expand) {
          //   data.expandKeys.push(n.xbsjID);
          // }
        } else {
          childList.push({
            label: n.title,
            guid: n.czmObject.xbsjGuid,
            isLeaf: true,
            id: n.xbsjID,
          });
          if (n.czmObject.show) {
            defaultChecked.push(n.xbsjID);
          }
        }
      });
      return childList;
    };


    const handleCheckLeft = (data, checked, childChecked) => {
      if (data.guid) {
        let czmObject = earth.getObject(data.guid);
        // console.log(czmObject, czmObject.show, checked);
        czmObject.show = checked;
      }
    };

    const handleCheckRight = (data, checked, childChecked) => {
      if (data.guid) {
        let czmObject = _newEarth.getObject(data.guid);
        // console.log(czmObject, czmObject.show, checked);
        czmObject.show = checked;
      }
    };

    // 视角同步
    const bindView = () => {
      data._disposer.push(
        XE.MVVM.bind(
          _newEarth.camera,
          "position",
          earth.camera,
          "position"
        ),
        XE.MVVM.bind(
          _newEarth.camera,
          "rotation",
          earth.camera,
          "rotation"
        )
      );
    };

    // 解除同步
    const unbindView = () => {
      if (data._disposer.length) {
        data._disposer.forEach((d: any) => d());
        data._disposer.length = 0;
      }
    };

    const del = () => {
      unbindView();
      watchUnbind = watchUnbind && watchUnbind();
      // 移除新地球容器，恢复原有地球尺寸，销毁新地球
      // let leftContainer: any = document.getElementById("earthContainer0");
      let rightContainer: any = document.getElementById("rightContainer");
      let parent: any = leftContainer.parentElement;
      parent.removeChild(rightContainer);
      leftContainer.style.width = "100%";
      _newEarth = _newEarth && _newEarth.destroy();
      // _newContainer = undefined;
    };
    return {
      ...toRefs(data),
      handleCheckLeft,
      handleCheckRight,
      bindView,
      unbindView,
    };
  },
});
</script>
