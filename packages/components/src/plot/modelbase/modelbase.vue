<template>
  <el-scrollbar height="550px">
    <div class="epsplanet-panel-base modelbase" style="width: 296px">
      <div>
        <el-select
          v-model="selectVal"
          placeholder="请选择"
          popper-class="tool-panel-popper"
        >
          <el-option
            v-for="item in classificationName"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
      <div class="ImgDivFather">
        <el-scrollbar height="312px">
          <div
            class="imgDiv"
            v-for="data in datas[selectVal]"
            :key="data"
            @click="getModel(data)"
          >
            <img :src="data.image" :alt="data.name" :title="data.name" />
            <p>{{ data.name }}</p>
          </div>
        </el-scrollbar>
      </div>
      <div style="margin-bottom: 10px; position: relative">
        <span class="spanSlider">名称:</span>
        <el-input v-model="modelName" placeholder="请输入名称"></el-input><br />
        <span class="spanSlider">缩放:</span>
        <el-slider
          v-model="scale"
          :min="0.1"
          :max="50"
          :step="0.1"
          show-input
          :show-input-controls="false"
        ></el-slider>
        <span class="spanSlider">旋转:</span>
        <el-slider
          v-model="rotation"
          :min="-3.14"
          :max="3.14"
          :step="0.01"
          show-input
          :show-input-controls="false"
        ></el-slider>
        <span class="spanSwitch">动画:</span>
        <el-switch
          @change="changeAnimation($event)"
          v-model="isAnimation"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :disabled="!modelAnimation"
        >
        </el-switch>
        <span class="spanSwitch">贴地:</span>
        <el-switch
          @change="changeHeightReference($event)"
          v-model="isGround"
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
      </div>
      <div class="tool-panel-button">
        <el-button size="small" @click="creating = true">变更位置</el-button>
        <el-button size="small" @click="positionEditing = true">平移</el-button>
        <el-button size="small" @click="del">取消</el-button>
        <el-button size="small" @click="save">保存</el-button>
      </div>
    </div>
  </el-scrollbar>
</template>
<script lang="ts">
/* eslint-disable */
import './style/index.scss';
import axios from 'axios';
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  watch
} from 'vue';
import { useEarth } from '../../utils';
import { modelbaseProps } from './modelbase';
export default defineComponent({
  name: 'EpsplanetModelBase',
  props: modelbaseProps,
  setup(props) {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    let _modelCzm: any; //模型对象
    let allowModelAnimation: boolean;
    // let _disposers: []; //储存绑定事件
    let saveAnimationCzm: any; //已经保存的模型对象
    const data = reactive({
      datas: {}, //储存模型
      // url: "http://jojo1986.cn:8888/data/models/modellist.json", //模型服务地址
      classificationName: [] as any[], //模型分类名
      selectVal: '', //下拉框选择分类
      creating: false, //变更位置
      positionEditing: false, //位置编辑
      rotation: 0, //水平旋转
      rotations: [0, 0, 0], //旋转
      scale: 1, //缩放
      _disposers: [] as any[], //储存绑定事件
      isAnimation: true, //是否开启动画
      modelAnimation: false, //动画按钮是否禁用
      isGround: false, //是否贴地
      heightReference: 'HeightReference.RELATIVE_TO_GROUND', //贴地默认值
      modelName: undefined, //模型名称
      _modelCzm, //模型对象
      saveAnimationCzm //已经保存的模型对象
    });
    const { url, config } = props;
    watch(
      () => data.rotation,
      (newValue, oldValue) => {
        data.rotations[0] = newValue;
      }
    );
    onMounted(() => {
      earth = useEarth();
      init();
    });
    onBeforeUnmount(() => {
      earth.interaction.picking.enabled = false; // 开启拾取操作
      del();
    });
    function init() {
      earth.interaction.picking.enabled = true; // 开启拾取操作

      if (config.length > 0) {
        data.datas = config;
        // 获取分类名
        data.classificationName = Object.keys(config);
        data.selectVal = data.classificationName[0];
      } else {
        // 通过服务获取数据
        axios
          .get(url)
          .then((response) => {
            if (response.status == 200 && response.statusText == 'OK') {
              data.datas = response.data;
              // 获取分类名
              data.classificationName = Object.keys(response.data);
              data.selectVal = data.classificationName[0];
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (earth.modelCollection) {
        // 遍历服务，绑定点击事件
        earth.modelCollection.forEach((m: any) => {
          m.czmObject.onclick = () => {
            del();
            bindEvent(m.czmObject);
          };
        });
      }
    }
    function getModel(datas: any) {
      del();
      allowModelAnimation = false;
      data._modelCzm = new XE.Obj.Model(earth);
      console.log(data._modelCzm);
      data._modelCzm.distanceDisplayCondition = [0, 7050454];
      data._modelCzm.heightReference = data.isGround
        ? 'HeightReference.CLAMP_TO_GROUND'
        : 'HeightReference.RELATIVE_TO_GROUND';
      data._modelCzm.url = datas.style.url;
      if (datas.hasOwnProperty('animation')) {
        data.modelAnimation = true;
        data._modelCzm.animation = { play: false };
        if (data._modelCzm && datas.animation.play) {
          data._modelCzm.animation.play = true;
          data.isAnimation = true;
          let time = setTimeout(() => {
            data._modelCzm.playAnimation();
            clearTimeout(time);
          }, 100);
        } else {
          data.isAnimation = false;
        }
      } else {
        data.modelAnimation = false;
        data.isAnimation = false;
      }
      data._disposers.push(
        XE.MVVM.bind(thisVue, 'creating', data._modelCzm, 'creating'),
        XE.MVVM.bind(
          thisVue,
          'positionEditing',
          data._modelCzm,
          'positionEditing'
        ),
        XE.MVVM.bind(thisVue, 'rotations', data._modelCzm, 'xbsjRotation'),
        XE.MVVM.bind(
          thisVue,
          'heightReference',
          data._modelCzm,
          'heightReference'
        ),
        XE.MVVM.bind(thisVue, 'scale', data._modelCzm, 'scale'),
        XE.MVVM.watch(() => {
          data.creating = data._modelCzm.creating;
          data.positionEditing = data._modelCzm.positionEditing;
          data.scale = data._modelCzm.scale;
        })
      );
      data._modelCzm.creating = true;
    }
    // 改变高度类型
    function changeHeightReference(e: any) {
      data.heightReference = e
        ? 'HeightReference.CLAMP_TO_GROUND'
        : 'HeightReference.RELATIVE_TO_GROUND';
    }
    // 控制动画开启关闭
    function changeAnimation(e: any) {
      if (e) {
        if (data._modelCzm) {
          data._modelCzm.playAnimation();
          data._modelCzm.animation.play = true;
        }
        if (data.saveAnimationCzm && allowModelAnimation) {
          data.saveAnimationCzm.playAnimation();
          data.saveAnimationCzm.animation.play = true;
        }
      } else {
        if (data._modelCzm) {
          data._modelCzm.stopAnimation();
          data._modelCzm.animation.play = false;
        }
        if (data.saveAnimationCzm && allowModelAnimation) {
          data.saveAnimationCzm.stopAnimation();
          data.saveAnimationCzm.animation.play = false;
        }
      }
    }
    // 销毁数据
    function del() {
      if (data._disposers) {
        data._disposers.forEach((d: any) => d());
        data._disposers.length = 0;
      }
      if (data._modelCzm) {
        data._modelCzm.destroy();
        data._modelCzm = undefined;
      }
    }
    // 绑定事件
    function bindEvent(modelCzm: any) {
      allowModelAnimation = true;
      data.saveAnimationCzm = modelCzm;
      if (data.saveAnimationCzm.hasOwnProperty('animation')) {
        data.modelAnimation = true;
        if (data.saveAnimationCzm && data.saveAnimationCzm.animation.play) {
          let time = setTimeout(() => {
            data.saveAnimationCzm.playAnimation();
            clearTimeout(time);
          }, 10);
          data.isAnimation = true;
        } else {
          data.isAnimation = false;
        }
      } else {
        data.modelAnimation = false;
        data.isAnimation = false;
      }
      data.scale = data.saveAnimationCzm.scale;
      data.rotation = data.saveAnimationCzm.xbsjRotation[0];
      data._disposers.push(
        XE.MVVM.bind(thisVue, 'creating', data.saveAnimationCzm, 'creating'),
        XE.MVVM.bind(
          thisVue,
          'positionEditing',
          data.saveAnimationCzm,
          'positionEditing'
        ),
        XE.MVVM.bind(
          thisVue,
          'rotations',
          data.saveAnimationCzm,
          'xbsjRotation'
        ),
        XE.MVVM.bind(
          thisVue,
          'heightReference',
          data.saveAnimationCzm,
          'heightReference'
        ),
        XE.MVVM.bind(thisVue, 'scale', data.saveAnimationCzm, 'scale'),
        XE.MVVM.watch(() => {
          data.creating = data.saveAnimationCzm.creating;
          data.positionEditing = data.saveAnimationCzm.positionEditing;
          data.scale = data.saveAnimationCzm.scale;
        })
      );
    }
    // 保存
    function save() {
      data._modelCzm.name = data.modelName;
      data.modelName = undefined;
      let json = data._modelCzm.toAllJSON();
      let modelCzm = new XE.Obj.Model(earth);
      modelCzm.xbsjFromJSON(json);
      data.saveAnimationCzm = modelCzm;
      modelCzm.onclick = () => {
        del();
        bindEvent(modelCzm);
      };
      const sceneObject = new XE.SceneTree.Leaf(data.saveAnimationCzm);
      earth.sceneTree.root.children.push(sceneObject);
      confirmModel(sceneObject);
      let timeOut = setTimeout(() => {
        del();
        if (
          data.isAnimation &&
          data.saveAnimationCzm.hasOwnProperty('animation') &&
          data.saveAnimationCzm.animation.play
        ) {
          data.saveAnimationCzm.playAnimation();
        }
        clearTimeout(timeOut);
      }, 10);
    }
    function confirmModel(czmObject: any) {
      if (!earth.modelCollection) {
        earth.modelCollection = [];
      }
      earth.modelCollection.push(czmObject);
      // context.emit('commitPanel');
      // this.$emit('closeToolPanel')
    }
    const refData = toRefs(data);
    return {
      ...refData,
      init,
      getModel,
      changeHeightReference,
      changeAnimation,
      save,
      del
    };
  }
});
</script>
