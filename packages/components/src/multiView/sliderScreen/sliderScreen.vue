<template>
  <div class="epsplanet-panel-base sliderScreen">
    <!-- 后期添加 -->
    <div style="text-align: center; margin: 20px">
      <el-radio-group v-model="radio1" @change="changeSilder()">
        <el-radio label="1" size="large">左右卷帘</el-radio>
        <el-radio label="2" size="large">上下卷帘</el-radio>
      </el-radio-group>
    </div>
    <el-row :gutter="8" class="row">
      <el-col :span="4">
        <div class="title">图层</div>
      </el-col>
      <el-col :span="20">
        <el-row :gutter="8">
          <el-col :span="2">
            <div class="point"></div>
          </el-col>
          <el-col :span="22">
            <el-select v-model="layerID" placeholder="选择图层" @change="chooseLayerOne()" class="select">
              <el-option v-for="(item, i) in layerOption" :key="i" :label="item.title" :value="item.czmObject.xbsjGuid" />
            </el-select>
          </el-col>
        </el-row>
        <el-row :gutter="8">
          <el-col :span="2">
            <div class="point1"></div>
          </el-col>
          <el-col :span="22">
            <el-select v-model="layerID2" placeholder="选择图层" @change="chooseLayerTwo()" class="select">
              <el-option v-for="(item, i) in layerOption" :key="i" :label="item.title" :value="item.czmObject.xbsjGuid" />
            </el-select>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import './style/index.scss';
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent
} from 'vue';
import { useEarth } from '../../utils';
import { ElNotification } from 'element-plus';
/* eslint-disable */
export default defineComponent({
  name: 'EpsplanetSliderScreen',
  setup() {
    const { proxy } = getCurrentInstance() as any;
    let earth: any;
    const thisVue = proxy;
    const data = reactive({
      radio1: '1',
      radio2: '1',
      splitX: 1.0,
      splitY: 1.0,
      viewport: '0',
      xbsjLeftTopView: true,
      xbsjLeftBottomView: true,
      xbsjRightTopView: true,
      xbsjRightBottomView: true,
      destroyArray: [''],
      _czmObj: undefined,
      layerID: undefined,
      layerID2: undefined,
      layerOption: [] as []
    });
    let _leftczmObj;
    let _rightczmObj;
    let _topczmObj;
    let _bottomczmObj;
    // watch(earth.sceneTree.root.children, (val) => {
    //   console.log(val);

    // });
    const methods = {
      changeSilder() {
        data.layerID = undefined;
        data.layerID2 = undefined;
        if (_leftczmObj?.splitDirection) {
          _leftczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        if (_rightczmObj?.splitDirection) {
          _rightczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        if (_topczmObj?.splitDirection) {
          _topczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        if (_bottomczmObj?.splitDirection) {
          _bottomczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        data.xbsjLeftTopView = true;
        data.xbsjLeftBottomView = true;
        data.xbsjRightTopView = true;
        data.xbsjRightBottomView = true;

        if (data.radio1 == '1') {
          // _leftczmObj.splitDirection = "ImagerySplitDirection.LEFT";
          // _rightczmObj.splitDirection = "ImagerySplitDirection.RIGHT";
          methods.setViewportX();
        } else {
          // _topczmObj.splitDirection = "ImagerySplitDirection.TOP";
          // _bottomczmObj.splitDirection = "ImagerySplitDirection.BOTTOM";
          // methods.setViewportY();
          methods.setViewportY();
        }
      },
      chooseLayer() {

        /*问题 by jojo
       首先获取左右分屏对比的对象
      */
        earth.sceneTree.root.children.forEach((element) => {
          if (element.czmObject.xbsjGuid == data.layerID) {
            _leftczmObj = element.czmObject;
          }
        });
        //设置分割显示位置[很重要]
        //_leftczmObj.splitDirection = "ImagerySplitDirection.LEFT";
        _leftczmObj.flyTo();

        _rightczmObj =
          earth.sceneTree.root.children[
          earth.sceneTree.root.children.length - 1
          ];

        _leftczmObj.splitDirection = 'ImagerySplitDirection.RIGHT';

        data.destroyArray.push(
          XE.MVVM.bind(
            thisVue,
            'splitX',
            earth.camera.viewport,
            'splitX'
          ),
          XE.MVVM.bind(thisVue, 'splitY', earth.camera.viewport, 'splitY')

        );
      },
      chooseLayerOne() {
        data.layerOption = earth.sceneTree.root.children.filter(
          (element) => {
            return element.enabled;
          }
        );
        data.xbsjRightBottomView = true;
        data.xbsjRightTopView = true;
        let czmType: any = '';
        if (data.radio1 == '1') {
          earth.sceneTree.root.children.forEach((element) => {
            if (element.czmObject.xbsjGuid == data.layerID) {
              _leftczmObj = element.czmObject;
              czmType = element.czmObject.xbsjType;
            }
          });
          if (czmType == 'Imagery') {
            _leftczmObj.splitDirection = 'ImagerySplitDirection.LEFT';
          } else {
            data.destroyArray.push(
              XE.MVVM.bind(
                thisVue,
                'xbsjRightTopView',
                _leftczmObj,
                'xbsjRightTopView'
              ),
              XE.MVVM.bind(
                thisVue,
                'xbsjRightBottomView',
                _leftczmObj,
                'xbsjRightBottomView'
              )
            );
            data.xbsjRightBottomView = false;
            data.xbsjRightTopView = false;
          }

          _leftczmObj.flyTo();
        } else {
          earth.sceneTree.root.children.forEach((element) => {
            if (element.czmObject.xbsjGuid == data.layerID) {
              _topczmObj = element.czmObject;
              czmType = element.czmObject.xbsjType;
            }
          });
          if (czmType == 'Imagery') {
            ElNotification({
              title: '提示',
              message: '上下卷帘不支持影像数据!'
            });
            return;
            _topczmObj.splitDirection = 'ImagerySplitDirection.TOP';
          } else {
            data.destroyArray.push(
              XE.MVVM.bind(
                thisVue,
                'xbsjLeftBottomView',
                _topczmObj,
                'xbsjLeftBottomView'
              ),
              XE.MVVM.bind(
                thisVue,
                'xbsjRightBottomView',
                _topczmObj,
                'xbsjRightBottomView'
              )
            );
            data.xbsjRightBottomView = false;
            data.xbsjLeftBottomView = false;
          }
          _topczmObj.flyTo();
        }
      },
      chooseLayerTwo() {
        data.layerOption = earth.sceneTree.root.children.filter(
          (element) => {
            return element.enabled;
          }
        );
        data.xbsjLeftTopView = true;
        data.xbsjLeftBottomView = true;
        let czmType: any = '';
        if (data.radio1 == '1') {
          earth.sceneTree.root.children.forEach((element) => {
            if (element.czmObject.xbsjGuid == data.layerID2) {
              _rightczmObj = element.czmObject;
              czmType = element.czmObject.xbsjType;
            }
          });
          if (czmType == 'Imagery') {
            _rightczmObj.splitDirection = 'ImagerySplitDirection.RIGHT';
          } else {
            data.destroyArray.push(
              XE.MVVM.bind(
                thisVue,
                'xbsjLeftTopView',
                _rightczmObj,
                'xbsjLeftTopView'
              ),
              XE.MVVM.bind(
                thisVue,
                'xbsjLeftBottomView',
                _rightczmObj,
                'xbsjLeftBottomView'
              )
            );
            data.xbsjLeftTopView = false;
            data.xbsjLeftBottomView = false;
          }
        } else {
          earth.sceneTree.root.children.forEach((element) => {
            if (element.czmObject.xbsjGuid == data.layerID2) {
              _bottomczmObj = element.czmObject;
              czmType = element.czmObject.xbsjType;
            }
          });
          if (czmType == 'Imagery') {
            ElNotification({
              title: '提示',
              message: '上下卷帘不支持影像数据!'
            });
            return;
            _bottomczmObj.splitDirection = 'ImagerySplitDirection.BOTTOM';
          } else {
            data.destroyArray.push(
              XE.MVVM.bind(
                thisVue,
                'xbsjLeftTopView',
                _bottomczmObj,
                'xbsjLeftTopView'
              ),
              XE.MVVM.bind(
                thisVue,
                'xbsjRightTopView',
                _bottomczmObj,
                'xbsjRightTopView'
              )
            );
            data.xbsjLeftTopView = false;
            data.xbsjRightTopView = false;
          }
        }
      },
      setViewportX() {
        data.splitY = 1.0;
        data.splitX = data.splitX == 1 ? 0.5 : 1;
      },
      setViewportY() {
        data.splitX = 1.0;
        //data.reset();
        data.splitY = data.splitY == 1 ? 0.5 : 1;
      },
      init() {
        //methods.setViewportX();
        data.layerOption = earth.sceneTree.root.children.filter(
          (element) => {
            return element.enabled;
          }
        );
        data.destroyArray.push(
          XE.MVVM.bind(
            thisVue,
            'splitX',
            earth.camera.viewport,
            'splitX'
          ),
          XE.MVVM.bind(thisVue, 'splitY', earth.camera.viewport, 'splitY')
        );
        methods.setViewportX();
      },
      del() {
        if (_leftczmObj?.splitDirection) {
          _leftczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        if (_rightczmObj?.splitDirection) {
          _rightczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        if (_topczmObj?.splitDirection) {
          _topczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        if (_bottomczmObj?.splitDirection) {
          _bottomczmObj.splitDirection = 'ImagerySplitDirection.NONE';
        }
        earth.camera.viewport.splitX = 1.0;
        earth.camera.viewport.splitY = 1.0;

        if (data.destroyArray) {
          data.destroyArray.forEach((d: any) => {
            d = '';
          });
          data.destroyArray.length = 0;
        }
      }
    };
    onBeforeUnmount(() => {
      methods.del();
    }),
      onMounted(async () => {
        earth = useEarth();
        methods.init();
      });
    return { ...toRefs(data), ...methods };
  }

});
</script>

