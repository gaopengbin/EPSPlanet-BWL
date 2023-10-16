<template>
  <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick" type="border-card" stretch="true">
    <el-tab-pane label="地址搜索" name="address" v-if="model == 'address' || model == 'both'">
      <el-select v-model="selectAProvince" class="m-2" placeholder="Select" style="width: 120px">
        <el-option v-for="item in cityCode" :key="item.adcode" :label="item.name" :value="item.name" />
      </el-select>
      <!-- <el-input
        placeholder="请输入要查找的地名"
        @keyup.enter="submit()"
        :suffix-icon="Search"
        v-model="searchValue"
      /> -->
      <el-select v-model="searchValue" placeholder="请输入要查找的地名" @keyup.enter="submit()" @clear="selectClear"
        @change="selectChange" :loading="loading" filterable ref="selectOne">
        <el-option v-for="item in searchResultArr" :key="item.uid" :label="item.name" :value="item.name" />
      </el-select>
    </el-tab-pane>
    <el-tab-pane label="经纬搜索" name="point" v-if="model == 'point' || model == 'both'">
      <div class="main">
        <strong style="flex-shrink: 1; flex-basis: 50px; line-height: 33px">坐标</strong>
        <el-input class="loc-input" v-model="locLongitude" placeholder="经度" />
        <el-input class="loc-input" v-model="locLatitude" placeholder="纬度" />
        <el-input class="loc-input" v-model="locHeight" placeholder="高度" />
      </div>
      <br />
      <el-button :icon="Search" style="width:80%;text-align: center" @click="searchLoc">
        搜索
      </el-button>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
import "./style/index.scss";
import axios from 'axios';
import {
  reactive,
  ref,
  toRefs,
  defineComponent,
  onMounted,
  onBeforeUnmount
} from 'vue';
import { useEarth, label } from '../../utils';
export default defineComponent({
  name: 'EpsplanetquickPosition',
  setup() {
    let earth: any;
    const selectOne = ref();
    const data = reactive({
      locLongitude: 0,
      locLatitude: 0,
      locHeight: 1000,
      dropSwitch: false,
      activeName: '',
      options: [],
      //输入框绑定值
      searchValue: '',
      selectAProvince: '全国',
      searchResultArr: [],
      loading: false,
      destroyArray: [''],
      pin1: {},
      //取配置文件
      model: '',
      //百度apiactiveKey
      bdapiAK: ''
    });
    //用来销毁label
    let pinDestroy;
    const cityCode = ref([
      { adcode: 100000, name: '全国' },
      { adcode: 110000, name: '北京市' },
      { adcode: 120000, name: '天津市' },
      { adcode: 130000, name: '河北省' },
      { adcode: 140000, name: '⼭西省' },
      { adcode: 150000, name: '内蒙古⾃治区' },
      { adcode: 210000, name: '辽宁省' },
      { adcode: 220000, name: '吉林省' },
      { adcode: 230000, name: '⿊龙江省' },
      { adcode: 310000, name: '上海市' },
      { adcode: 320000, name: '江苏省' },
      { adcode: 330000, name: '浙江省' },
      { adcode: 340000, name: '安徽省' },
      { adcode: 350000, name: '福建省' },
      { adcode: 360000, name: '江西省' },
      { adcode: 370000, name: '⼭东省' },
      { adcode: 410000, name: '河南省' },
      { adcode: 420000, name: '湖北省' },
      { adcode: 430000, name: '湖南省' },
      { adcode: 440000, name: '⼴东省' },
      { adcode: 450000, name: '⼴西壮族⾃治区' },
      { adcode: 460000, name: '海南省' },
      { adcode: 500000, name: '重庆市' },
      { adcode: 510000, name: '四川省' },
      { adcode: 520000, name: '贵州省' },
      { adcode: 530000, name: '云南省' },
      { adcode: 540000, name: '西藏⾃治区' },
      { adcode: 610000, name: '陕西省' },
      { adcode: 620000, name: '⽢肃省' },
      { adcode: 630000, name: '青海省' },
      { adcode: 640000, name: '宁夏回族⾃治区' },
      { adcode: 650000, name: '新疆维吾尔⾃治区' },
      { adcode: 810000, name: '⾹港特别⾏政区' },
      { adcode: 820000, name: '澳门特别⾏政区' }
    ]);
    let pin1;
    const method = {
      //处理一些初始化配置
      init() { },
      //搜索经纬度
      searchLoc() {
        pinDestroy?.destroy();
        if (data.locLongitude && data.locLatitude && data.locHeight) {
          earth.camera.flyTo([
            (data.locLongitude / 180) * Math.PI,
            (data.locLatitude / 180) * Math.PI,
            data.locHeight
          ]);
          // pin1.pinBuilder.extText = `经度:${data.locLongitude}°\n纬度:${data.locLatitude}°`;
          // earth.sceneTree.$refs.pin1.czmObject.position = [
          //   (data.locLongitude / 180) * Math.PI,
          //   (data.locLatitude / 180) * Math.PI,
          //   0
          // ];
          // pin1.enabled = true;
          let position = [
            (data.locLongitude / 180) * Math.PI,
            (data.locLatitude / 180) * Math.PI,
            data.locHeight
          ];
          pinDestroy = label.createLabel(
            earth,
            position,
            `经度:${data.locLongitude}°\n纬度:${data.locLatitude}°`
          );
        }
      },
      selectChange(val) {
        pinDestroy?.destroy();
        let pos: any = data.searchResultArr.find(
          (item: any) => item.name == val
        );
        let position = [
          (pos.location.lng / 180) * Math.PI,
          (pos.location.lat / 180) * Math.PI,
          100
        ];
        pinDestroy = label.createLabel(earth, position, data.searchValue);
        if (pos) {
          earth.camera.flyTo(position, 200);
        }
      },
      submit() {
        data.loading = true;
        //需要去获取select框里面输入的搜索内容
        let value = selectOne.value.query;
        //百度api
        let bdapi =
          '/bdapi?query=' +
          value +
          '&region=' +
          data.selectAProvince +
          '&output=json&ak=' +
          data.bdapiAK;
        fetch(bdapi)
          .then((res) => res.json())
          .then((json) => {
            let result = json.result;
            data.searchResultArr = result;
            data.loading = false;
          });
      }
    };

    onMounted(async () => {
      earth = useEarth();
      await axios
        .get('Epsplanet_Assets/widgets/camera/quickPosition/config.json')
        .then((res) => {
          data.model = res.data.model;
          data.bdapiAK = res.data.bdapiAK;
        })
        .catch((err) => {
          data.model = 'both';
        })
        .finally(() => {
          data.activeName = data.model == 'both' ? 'address' : data.model;
        });
      earth.sceneTree.root.children.push({
        ref: 'pin1',
        czmObject: {
          name: 'Pin1',
          xbsjType: 'Pin',
          near: 100
        }
      });
      pin1 = earth.sceneTree.$refs.pin1.czmObject;
      method.init();
    });
    onBeforeUnmount(function () {
      pinDestroy?.destroy();
    });
    return { ...toRefs(data), ...method, cityCode, selectOne };
  }
});
</script>

