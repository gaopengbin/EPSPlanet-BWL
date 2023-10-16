<template>
  <div class="basemap" style="" @mouseover="overStyle" @mouseleave="leaveStyle">
    <ul class="baseul">
      <li v-for="(item, index) in basemapList" :key="index" id="transition-box" :style="{
        transform: isHover ? 'translateX(' + -86 * index + 'px)' : 'none',
        border: isHover
          ? item.show
            ? '3px solid rgba(113, 184, 246, 1)'
            : '3px solid rgba(35, 145, 242, 0.8)'
          : '3px solid rgba(44, 47, 56, 0.5)',
        'z-index': item.show ? 2 : 1
      }">
        <div class="img-div" @click="selectBasemap(item)">
          <!-- <span :style="{background: item.show? 'rgba(7, 175, 248, 0.5);': 'rgba(7, 175, 248, 0);'}"> -->
          <span class="hoverbgcolor" :style="item.show ? 'background:rgba(7, 175, 248, 0.5);' : ''">
            {{ item.name }}</span>
          <img :src="item.imgUrl" :alt="item.name" class="image" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import './style/index.scss';
import { basemapProps } from './basemap';
import { onBeforeMount, onMounted, ref } from 'vue';
import axios from 'axios';
import { useEarth } from '../../utils';
defineOptions({ name: 'EpsplanetBasemap' });

const props = defineProps(basemapProps);

const isHover = ref(false);
const basemapList = ref<any>([]);

let earth: any;
onBeforeMount(async () => {
  await loadconfig();
});
onMounted(async () => {
  earth = await useEarth();
  initfirstmap();
});

// 加载配置文件
const loadconfig = async () => {
  const { config } = props;
  console.log('basemapConfigUrl:', config);

  if (typeof config == 'object') {
    basemapList.value = config;
  } else {
    await axios
      .get(config)
      .then((res) => {
        basemapList.value = res.data.basemapList;
      })
      .catch((err) => {
        console.log('加载配置文件失败');
      });
  }


};
const overStyle = () => {
  isHover.value = true;
};
const leaveStyle = () => {
  isHover.value = false;
};
const initfirstmap = () => {
  let result = basemapList.value.filter((basemap: any) => {
    return basemap?.show == true;
  });
  let deepmap: any;
  let map: any;
  //如果配置信息里没有指定的显示图层，则默认选第一个
  if (result.length == 0) {
    deepmap = JSON.parse(JSON.stringify(basemapList[0]));
    map = basemapList[0];
  }
  //如果配置信息里有多个指定的显示图层，则默认选其中的第一个显示图层
  else {
    deepmap = JSON.parse(JSON.stringify(result[0]));
    map = result[0];
  }
  // xbsjImageryProvider为null表示使用离线地图
  if (!map.xbsjImageryProvider) {
    deepmap.xbsjImageryProvider = XE.Obj.Imagery.defaultImageryProviderConfig;
  }
  delete deepmap.show;
  if (earth.sceneTree.basemap.imagery.children.length == 0) {
    let czmObject = {
      czmObject: deepmap
    };

    earth.sceneTree.basemap.imagery.children.push(czmObject);
  } else {
    selectBasemap(map);
  }
};

const selectBasemap = (item: any) => {
  let curmap = earth.sceneTree.basemap.imagery.children[0]?.czmObject;
  if (item.xbsjGuid == curmap?.xbsjGuid) {
    // earth.sceneTree.basemap.imagery.children[0].czmObject = {};
    earth.sceneTree.basemap.imagery.children.splice(0, 1);
    item.show = false;
  } else {
    basemapList.value.forEach((basemap: any) => {
      basemap.show = false;
    });
    item.show = true;
    isHover.value = false;
    let map = JSON.parse(JSON.stringify(item));
    if (map.show) delete map.show;
    if (!map.xbsjImageryProvider) {
      map.xbsjImageryProvider = XE.Obj.Imagery.defaultImageryProviderConfig;
    }
    let amap = { czmObject: map };
    // earth.sceneTree.basemap.imagery.children[0].czmObject = {};
    // earth.sceneTree.basemap.imagery.children[0].czmObject = map;
    earth.sceneTree.basemap.imagery.children.splice(0, 1);
    earth.sceneTree.basemap.imagery.children.push(amap);
  }
};
</script>

<style scoped></style>
