<template>
  <div class="epsplanet-panel-base layerlist" style="width: 296px">
    <el-tree ref="treeRef" :data="treeData" show-checkbox node-key="id" :props="defaultProps"
      :default-checked-keys="defaultChecked" :default-expanded-keys="defaultExpanded" @check-change="handleCheck"
      @node-expand="handleExpand" @node-collapse="handleCollapse">
      <template #default="{ node, data }">
        {{ node.label }}
        <span class="nodeBtn">
          <a class="iconfont icon-shu-4" @click="locate(data, node)" v-if="node.isLeaf" title="定位"></a>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import './style/index.scss';
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { useEarth } from '../../utils';
import _ from 'lodash';
import { ElTree } from 'element-plus';
defineOptions({ name: 'EpsplanetLayerList' });
const { proxy } = getCurrentInstance() as any;
const treeData = ref<any>([]);
const defaultProps = {
  children: 'children',
  label: 'label'
};
const defaultChecked = ref<Array<string>>([]);
const defaultExpanded = ref<Array<string>>([]);
const expandKeys = ref<Array<string>>([]);
const disposer: any = [];
let earth: any;

onMounted(async () => {
  earth = useEarth();
  if (!earth) {
    earth = await useEarth();
  }
  init();
});

onBeforeUnmount(() => {
  del();
});
function getChildList(node: any) {
  let childList: any = [];
  node.forEach((n: any) => {
    if (n.children) {
      let child = getChildList(n.children);
      childList.push({
        label: n.title,
        children: child,
        id: n.xbsjID
      });
      if (n.expand) {
        expandKeys.value.push(n.xbsjID);
      }
    } else {
      childList.push({
        label: n.title,
        guid: n.czmObject.xbsjGuid,
        isLeaf: true,
        id: n.xbsjID
      });
      if (n.czmObject.show) {
        defaultChecked.value.push(n.xbsjID);
      }
    }
  });
  return childList;
}
function init() {
  treeData.value = getChildList(earth.sceneTree.root.children);
  disposer.push(
    XE.MVVM.watch(
      () => {
        if (earth.sceneTree) {
          return earth.sceneTree.root.toJSONStr();
        }
      },
      () => {
        // refresh();
        _.debounce(() => {
          refresh();
        }, 100)();
      }
    )
  );
}
function refresh() {
  if (earth.sceneTree) {
    defaultChecked.value = [];
    expandKeys.value = [];
    treeData.value = getChildList(earth.sceneTree.root.children);
    // setTimeout(() => {
    // proxy.$refs.treeRef.setCheckedKeys(defaultChecked.value);
    proxy.$refs.treeRef.store.setDefaultCheckedKey(defaultChecked.value);
    proxy.$refs.treeRef.store.setDefaultExpandedKeys(expandKeys.value);
    // }, 10);
  }
}
// window["refresh"] = refresh;
function handleCheck(data: any, checked: Boolean, childChecked: Boolean) {
  if (data.children && !childChecked) {
    getByID(data.id).then((f: any) => {
      // f.enabled = checked;
      f.setAllChildrenEnabled(checked);
      console.log(f);
    });
  }
  if (data.guid) {
    let czmObject = earth.getObject(data.guid);
    // console.log(czmObject);
    czmObject.show = checked;
  }
}
//展开节点
function handleExpand(data: any) {
  getByID(data.id).then((f: any) => {
    f.expand = true;
  });
}
//收起节点
function handleCollapse(data: any) {
  getByID(data.id).then((f: any) => {
    f.expand = false;
  });
}
function getByID(id: String) {
  return new Promise((resolve) => {
    let arr = earth.sceneTree.root.children;
    findObj(arr);
    function findObj(arr: any) {
      arr.forEach((e: any) => {
        if (e.xbsjID == id) {
          // console.log("get it", e);
          resolve(e);
        }
        // if (e.czmObject?.xbsjID == id) {
        //   console.log("get it", e.czmObject);
        // }
        if (e.children) {
          findObj(e.children);
        }
      });
    }
  });
}
// window["getByID"] = getByID;
function locate(data: any, node: any) {
  earth.getObject(data.guid).flyTo();
}
function del() {
  disposer.forEach((d: any) => d());
}
</script>

<style scoped></style>
