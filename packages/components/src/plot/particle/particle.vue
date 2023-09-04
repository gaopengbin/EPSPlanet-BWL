<template>
  <div class="epsplanet-panel-base particle">
    <!-- <el-scrollbar height="202px"> -->
    <el-form ref="form" label-width="78px" :inline="true">
      <el-form-item label="名称" style="width: 282px">
        <el-input
          v-model="name"
          placeholder="请输入15个以内字符"
          size="small"
          maxlength="15"
          show-word-limit
          type="text"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="类型" style="width: 282px">
        <el-radio-group
          v-model="particleType"
          @change="particleTypeChange"
          size="small"
        >
          <el-radio :label="'toBeCometTail'">彗尾状</el-radio>
          <el-radio :label="'toBeRocketThruster'">火焰喷射状</el-radio>
          <el-radio :label="'toBeSmoke'">烟雾状</el-radio>
          <el-radio :label="'toBeFountain'">喷泉状</el-radio>
        </el-radio-group>
      </el-form-item>
      <div class="demo-collapse">
        <el-collapse>
          <el-collapse-item
            title="属性设置"
            style="padding-left: 12px"
            v-if="
              particleType == 'toBeCometTail' ||
              particleType == 'toBeRocketThruster'
            "
          >
            <el-scrollbar height="200px">
              <el-form-item label="发射速率">
                <el-slider
                  v-model="particleEjectionParam.emissionRate"
                  :min="10"
                  :max="200"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('emissionRate')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="尺寸(像素)">
                <el-slider
                  v-model="particleEjectionParam.particleSize"
                  :min="5"
                  :max="30"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('particleSize')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="粒子数量">
                <el-slider
                  v-model="particleEjectionParam.particleNumber"
                  :min="10"
                  :max="200"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('particleNumber')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="存在时间">
                <el-slider
                  v-model="particleEjectionParam.particleLife"
                  :step="0.1"
                  :min="0.1"
                  :max="20"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('particleLife')"
                >
                </el-slider>
              </el-form-item>
              <el-form-item label="半径(米)">
                <el-slider
                  v-model="particleEjectionParam.radius"
                  :min="1"
                  :max="200"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('radius')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="高度(米)">
                <el-slider
                  v-model="particleEjectionParam.height"
                  :min="1"
                  :max="200"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('height')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="弧度">
                <el-slider
                  v-model="particleEjectionParam.rotate"
                  :step="0.01"
                  :min="0.01"
                  :max="20"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('rotate')"
                >
                </el-slider>
              </el-form-item>
            </el-scrollbar>
          </el-collapse-item>
          <el-collapse-item
            title="属性设置"
            style="padding-left: 12px"
            v-if="particleType == 'toBeSmoke' || particleType == 'toBeFountain'"
          >
            <el-scrollbar height="200px">
              <el-form-item label="发射类型">
                <el-select
                  v-model="particleParam.emitterType"
                  @change="emitterTypeChange($event)"
                  style="width: 200px"
                >
                  <el-option
                    v-for="item in particleParam.emitterTypeObj"
                    :key="item.value"
                    :label="item.value"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="发射半径">
                <el-input-number
                  v-model="particleParam.emitterRadius"
                  :min="0"
                  :disabled="particleParam.radiusdisabled"
                  style="width: 200px"
                  @change="changeParam('emitterRadius')"
                />
              </el-form-item>
              <el-form-item label="发射弧度">
                <el-input-number
                  v-model="particleParam.emitterAngle"
                  :min="0"
                  :disabled="particleParam.angledisabled"
                  style="width: 200px"
                  @change="changeParam('emitterAngle')"
                />
              </el-form-item>
              <el-form-item label="发射速率">
                <el-slider
                  v-model="particleParam.emissionRate"
                  :min="1"
                  :max="100"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('emissionRate2')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="尺寸(像素)">
                <el-slider
                  v-model="particleParam.particleSize"
                  :min="5"
                  :max="30"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('particleSize2')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="最小存在时间">
                <el-slider
                  v-model="particleParam.minimumParticleLife"
                  :step="0.1"
                  :min="0.1"
                  :max="30"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('minimumParticleLife')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="最大存在时间">
                <el-slider
                  v-model="particleParam.maximumParticleLife"
                  :step="0.1"
                  :min="0.1"
                  :max="30"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('maximumParticleLife')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="最小初速度">
                <el-slider
                  v-model="particleParam.minimumSpeed"
                  :step="1"
                  :min="0"
                  :max="30"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('minimumSpeed')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="最大初速度">
                <el-slider
                  v-model="particleParam.maximumSpeed"
                  :step="1"
                  :min="0"
                  :max="30"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('maximumSpeed')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="初始比例">
                <el-slider
                  v-model="particleParam.startScale"
                  :step="1"
                  :min="0"
                  :max="10"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('startScale')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="结束比例">
                <el-slider
                  v-model="particleParam.endScale"
                  :step="1"
                  :min="0"
                  :max="10"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('endScale')"
                ></el-slider>
              </el-form-item>
              <el-form-item label="重力加速度">
                <el-slider
                  v-model="particleParam.gravity"
                  :step="1"
                  :min="-20"
                  :max="20"
                  style="width: 200px"
                  show-input
                  :show-input-controls="false"
                  @change="changeParam('gravity')"
                ></el-slider>
              </el-form-item>
              <!-- <el-form-item label="图像">
                <el-input v-model="particleParam.image" placeholder="Please input" />
              </el-form-item> -->
              <el-form-item label="图像">
                <el-select v-model="particleParam.image" style="width: 200px">
                  <el-option
                    v-for="item in particleParam.imageList"
                    :key="item.url"
                    :label="item.label"
                    :value="item.url"
                  />
                </el-select>
              </el-form-item>
            </el-scrollbar>
          </el-collapse-item>
        </el-collapse>
      </div>
      <el-form-item
        label="起始颜色"
        v-if="particleType == 'toBeSmoke' || particleType == 'toBeFountain'"
        style="margin-top: 8px"
      >
        <el-color-picker
          v-model="particleParam.startColor"
          show-alpha
          @change="changeColor2"
        />
      </el-form-item>
      <el-form-item
        label="结束颜色"
        v-if="particleType == 'toBeSmoke' || particleType == 'toBeFountain'"
        style="margin-top: 8px"
      >
        <el-color-picker
          v-model="particleParam.endColor"
          show-alpha
          @change="changeColor2"
        />
      </el-form-item>
      <el-form-item
        v-if="
          particleType == 'toBeCometTail' ||
          particleType == 'toBeRocketThruster'
        "
      >
        <el-table
          :data="particleEjectionParam.colorData"
          border
          style="width: 100%"
          size="'small'"
        >
          <el-table-column
            type="index"
            label="序号"
            width="100"
            align="center"
            header-align="center"
          />
          <el-table-column
            prop="color"
            label="颜色"
            width="100"
            align="center"
            header-align="center"
          >
            <template #default="{ row }">
              <el-color-picker
                v-model="row.color"
                show-alpha
                @change="changeColor"
              />
            </template>
          </el-table-column>
          <el-table-column width="100" align="center" header-align="center">
            <!-- 表头--增加颜色 -->
            <template #header>
              <div style="align-items: center">
                <el-button type="text" @click="addColor">
                  <el-icon :size="20" :color="'#281f1d'">
                    <plus />
                  </el-icon>
                </el-button>
              </div>
            </template>
            <!-- 删除每行数据 -->
            <template #default="scope">
              <el-button
                size="small"
                type="text"
                @click="deleteColor(scope.$index)"
              >
                <el-icon :size="20" :color="'#281f1d'">
                  <delete />
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
    <div class="tool-panel-button" style="padding-bottom: 12px">
      <el-button-group size="small">
        <el-button size="small" @click="createPin">创建</el-button>
        <!-- <el-button size="small" @click="rotationEditing = !rotationEditing"
          >编辑</el-button
        > -->
        <el-select
          v-model="value"
          placeholder="编辑"
          size="small"
          style="width: 70px; margin: 0px"
          @visible-change="edit($event)"
        >
          <el-option label="平移" value="positionEditing" />
          <el-option label="旋转" value="rotationEditing" />
        </el-select>
      </el-button-group>
      <el-button size="small" @click="save">保存</el-button>
    </div>
    <!-- </el-scrollbar> -->
  </div>
</template>

<script lang="ts">
/* eslint-disable */
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

export default defineComponent({
  name: 'EpsplanetParticle',
  props: [],
  setup() {
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    let isSaved: boolean = false; //是否挂载到sceneTree.root下
    let lefthandler: any; //鼠标左击事件
    let pin: any; //兴趣点
    let particleSystemTails: any; //粒子喷射系统
    let particleSystem: any; //粒子系统
    let _disposer: any = []; //双向绑定
    const data = reactive({
      //共用参数
      name: '粒子喷射对象', //粒子喷射名称
      particleType: 'toBeCometTail', //粒子对象类型-彗尾状、火焰喷射状、烟雾状、喷泉状
      positionEditing: false, //是否平移粒子喷射对象
      rotationEditing: false, //是否旋转粒子喷射对象
      value: '', //编辑选项

      //粒子喷射系统参数
      particleEjectionParam: {
        emissionRate: 30, //粒子发射速度(个/秒) 粒子系统默认5
        particleSize: 15, //粒子的尺寸(单位：pixel) 粒子系统默认25
        particleNumber: 100, //构成一圈的粒子数量(粒子发射器的总数)
        particleLife: 3.5, //粒子的存在时间
        radius: 30, //圆圈可能扩散到的最大半径(只有在自转ratate保持低速时才能看到最大半径)，单位m
        height: 50, //粒子发射器竖直方向上移动的总距离，单位m
        rotate: 0.01, //粒子存在时间过程中总共旋转经过的弧度
        colors: [], //粒子喷射颜色带
        colorData: [
          //表格颜色带
          { color: 'rgba(153, 153, 153, 1)' },
          { color: 'rgba(153, 153, 229, 0.9)' },
          { color: 'rgba(127, 127, 178, 0.5)' }
        ]
      },

      //粒子系统的参数
      particleParam: {
        emissionRate: 5, //粒子发射速度(个/秒)
        particleSize: 25, //粒子的尺寸(单位：pixel)
        startColor: 'rgba(40, 178, 170, 1)', //开始颜色
        endColor: 'rgba(255, 255, 255, 1)', //结束颜色
        emitterType: 'CircleEmitter', //发射器类型
        emitterTypeObj: [
          {
            key: 'BoxEmitter',
            value: 'BoxEmitter'
          },
          {
            key: 'CircleEmitter',
            value: 'CircleEmitter'
          },
          {
            key: 'ConeEmitter',
            value: 'ConeEmitter'
          },
          {
            key: 'SphereEmitter',
            value: 'SphereEmitter'
          }
        ],
        emitterRadius: 2, //发射器半径
        radiusdisabled: false,
        emitterAngle: 1, //发射器弧度
        angledisabled: true,
        gravity: 0, //重力加速度，设置为负则向上
        minimumParticleLife: 2, //粒子存在最小的时间,之前为什么设置成12？？？
        maximumParticleLife: 2, //粒子存在最大的时间
        minimumSpeed: 1, //粒子的最小初速度
        maximumSpeed: 4, //粒子的最大初速度
        startScale: 1, //粒子的初始比例(相对于粒子的像素)
        endScale: 5, //粒子的结束比例(相对于粒子的像素)
        image:
          '/EPSPlanet_SDK/XbsjEarth-Plugins/plottingSymbol2/assets/SampleData/smoke.png',
        // "EPSPlanet_SDK/XbsjEarth-Plugins/plottingSymbol2/assets/SampleData/smoke.png", // smoke.png\fire.png
        imageList: [
          {
            label: 'smoke',
            url: '/EPSPlanet_SDK/XbsjEarth-Plugins/plottingSymbol2/assets/SampleData/smoke.png'
          },
          {
            label: 'fire',
            url: '/EPSPlanet_SDK/XbsjEarth-Plugins/plottingSymbol2/assets/SampleData/fire.png'
          },
          {
            label: 'snowflake',
            url: '/EPSPlanet_SDK/XbsjEarth-Plugins/plottingSymbol2/assets/SampleData/snowflake_particle.png'
          }
        ]
      }
    });

    onMounted(() => {
      earth = useEarth();
    });
    onBeforeUnmount(() => {
      methods.del();
    });

    const methods = {
      createPin() {
        //创建兴趣点，用作提示
        if (!pin) {
          pin = new XE.Obj.Plots.GeoPin(earth);
          pin.innerHTML =
            '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">点击鼠标左键开始绘制!</span></div>';
          pin.creating = true;
          // 数据鼠标左击事件
          lefthandler = new Cesium.ScreenSpaceEventHandler(
            earth.czm.viewer.scene.canvas
          );
          lefthandler.setInputAction((event) => {
            let position = pin.position;
            pin.enabled = false;
            if (
              data.particleType == 'toBeCometTail' ||
              data.particleType == 'toBeRocketThruster'
            ) {
              methods.createParticleSystemTails(position);
            } else {
              methods.createParticleSystem(position);
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        } else {
          pin.creating = true;
          pin.enabled = true;
          if (particleSystemTails) particleSystemTails.show = false;
          if (particleSystem) particleSystem.show = false;
        }
        window['pin'] = pin;
      },
      createParticleSystemTails(position) {
        if (!particleSystemTails) {
          // 创建粒子系统
          particleSystemTails = new XE.Obj.Plots.ParticleSystemTails(earth);
          //设置参数
          particleSystemTails.position = position;
          particleSystemTails.name = data.name;
          particleSystemTails.emissionRate =
            data.particleEjectionParam.emissionRate;
          particleSystemTails.particleSize =
            data.particleEjectionParam.particleSize;
          particleSystemTails.particleNumber =
            data.particleEjectionParam.particleNumber;
          particleSystemTails.particleLife =
            data.particleEjectionParam.particleLife;
          particleSystemTails.radius = data.particleEjectionParam.radius;
          particleSystemTails.rotate = data.particleEjectionParam.rotate;
          particleSystemTails.height = data.particleEjectionParam.height;
          methods.changeType(data.particleType);
          if (data.particleEjectionParam.colorData.length == 0) {
            methods.displayColor(particleSystemTails.colors);
          } else {
            methods.changeColor();
          }
          //绑定属性
          _disposer = [];
          //粒子喷射系统绑定的属性
          _disposer.push(
            XE.MVVM.bind(thisVue, 'name', particleSystemTails, 'name'),
            XE.MVVM.bind(
              thisVue,
              'positionEditing',
              particleSystemTails,
              'positionEditing'
            ),
            XE.MVVM.bind(
              thisVue,
              'rotationEditing',
              particleSystemTails,
              'rotationEditing'
            ),
            XE.MVVM.bind(
              thisVue,
              'particleEjectionParam.colors',
              particleSystemTails,
              'colors'
            )
          );
        } else {
          particleSystemTails.position = position;
          particleSystemTails.show = true;
        }
        // particleSystemTails.flyTo();
        // window["particleSystemTails"] = particleSystemTails;
      },
      createParticleSystem(position) {
        if (!particleSystem) {
          // 创建粒子系统
          particleSystem = new XE.Obj.Plots.ParticleSystem(earth);
          //设置参数
          particleSystem.position = position;
          particleSystem.name = data.name;
          particleSystem.emitterType = data.particleParam.emitterType;
          particleSystem.emitterRadius = data.particleParam.emitterRadius;
          particleSystem.emitterAngle = data.particleParam.emitterAngle;
          particleSystem.emissionRate = data.particleParam.emissionRate;
          particleSystem.particleSize = data.particleParam.particleSize;
          particleSystem.minimumParticleLife =
            data.particleParam.minimumParticleLife;
          particleSystem.maximumParticleLife =
            data.particleParam.maximumParticleLife;
          particleSystem.minimumSpeed = data.particleParam.minimumSpeed;
          particleSystem.maximumSpeed = data.particleParam.maximumSpeed;
          particleSystem.startScale = data.particleParam.startScale;
          particleSystem.endScale = data.particleParam.endScale;
          particleSystem.gravity = data.particleParam.gravity;
          particleSystem.image = data.particleParam.image;
          methods.changeType(data.particleType);
          methods.changeColor2();

          //绑定属性
          _disposer = [];
          //粒子喷射系统绑定的属性
          _disposer.push(
            XE.MVVM.bind(thisVue, 'name', particleSystem, 'name'),
            XE.MVVM.bind(
              thisVue,
              'positionEditing',
              particleSystem,
              'positionEditing'
            ),
            XE.MVVM.bind(
              thisVue,
              'rotationEditing',
              particleSystem,
              'rotationEditing'
            ),
            XE.MVVM.bind(
              thisVue,
              'particleParam.emitterType',
              particleSystem,
              'emitterType'
            ),
            XE.MVVM.bind(
              thisVue,
              'particleParam.image',
              particleSystem,
              'image'
            )
          );
        } else {
          particleSystem.position = position;
          particleSystem.show = true;
        }
        // particleSystem.flyTo();
        // window["particleSystem"] = particleSystem;
      },
      emitterTypeChange(val) {
        if (val === 'ConeEmitter') {
          data.particleParam.radiusdisabled = true;
          data.particleParam.angledisabled = false;
        } else {
          data.particleParam.radiusdisabled = false;
          data.particleParam.angledisabled = true;
        }
      },
      // 改变参数,本来直接用双向绑定，但是粒子系统消耗资源比较大，所以取消了部分与粒子喷射对象属性的双向绑定
      changeParam(text) {
        if (particleSystemTails) {
          switch (text) {
            //粒子喷射系统
            case 'emissionRate':
              particleSystemTails.emissionRate =
                data.particleEjectionParam.emissionRate;
              break;
            case 'particleSize':
              particleSystemTails.particleSize =
                data.particleEjectionParam.particleSize;
              break;
            case 'particleNumber':
              particleSystemTails.particleNumber =
                data.particleEjectionParam.particleNumber;
              break;
            case 'particleLife':
              particleSystemTails.particleLife =
                data.particleEjectionParam.particleLife;
              break;
            case 'radius':
              particleSystemTails.radius = data.particleEjectionParam.radius;
              break;
            case 'height':
              particleSystemTails.height = data.particleEjectionParam.height;
              break;
            case 'rotate':
              particleSystemTails.rotate = data.particleEjectionParam.rotate;
              break;
          }
        }
        //粒子系统
        if (particleSystem) {
          switch (text) {
            case 'emitterRadius':
              particleSystem.emitterRadius = data.particleParam.emitterRadius;
              break;
            case 'emitterAngle':
              particleSystem.emitterAngle = data.particleParam.emitterAngle;
              break;
            case 'emissionRate2':
              particleSystem.emissionRate = data.particleParam.emissionRate;
              break;
            case 'particleSize2':
              particleSystem.particleSize = data.particleParam.particleSize;
              break;
            case 'minimumParticleLife':
              particleSystem.minimumParticleLife =
                data.particleParam.minimumParticleLife;
              break;
            case 'maximumParticleLife':
              particleSystem.maximumParticleLife =
                data.particleParam.maximumParticleLife;
              break;
            case 'minimumSpeed':
              particleSystem.minimumSpeed = data.particleParam.minimumSpeed;
              break;
            case 'maximumSpeed':
              particleSystem.maximumSpeed = data.particleParam.maximumSpeed;
              break;
            case 'startScale':
              particleSystem.startScale = data.particleParam.startScale;
              break;
            case 'endScale':
              particleSystem.endScale = data.particleParam.endScale;
              break;
            case 'gravity':
              particleSystem.gravity = data.particleParam.gravity;
              break;
            case 'startScale':
              particleSystem.startScale = data.particleParam.startScale;
              break;
          }
          methods.changeColor2(); //有个bug,像是比例等参数修改后，不会立马起效，初步测试发现修改颜色能起作用
        }
      },
      // 增加颜色
      addColor() {
        data.particleEjectionParam.colorData.push({
          color: 'rgba(19, 206, 102, 0.8)'
        });
        methods.changeColor();
      },
      // 删除颜色
      deleteColor(index) {
        if (data.particleEjectionParam.colorData.length > 1) {
          data.particleEjectionParam.colorData.splice(index, 1);
          methods.changeColor();
        }
      },
      // 改变粒子系统的颜色
      changeColor2() {
        particleSystem.startColor = methods.transColorToCesium(
          data.particleParam.startColor
        );
        particleSystem.endColor = methods.transColorToCesium(
          data.particleParam.endColor
        );
      },
      // 改变粒子喷射系统的颜色
      changeColor() {
        let cc = [];
        data.particleEjectionParam.colorData.forEach((color) => {
          cc = cc.concat(methods.transColorToCesium(color.color));
        });
        data.particleEjectionParam.colors = cc;
      },
      // 把rgba颜色转换为cesium通用的颜色格式（0，1）
      transColorToCesium(val) {
        let v = val.split('(')[1].split(')')[0].split(',');
        let cc: any = [];
        v.forEach((c: any, i: number) => {
          if (i == 3) {
            cc.push(Number(c));
          } else {
            cc.push(Number(c) / 255.0);
          }
        });
        return cc;
      },
      // 初次加载时把默认的粒子喷射系统的颜色赋给前端界面
      displayColor(col) {
        data.particleEjectionParam.colorData = [];
        let co = { color: '' };
        col.forEach((c, i) => {
          if ((i + 1) % 4 == 0) {
            co.color = 'rgba(' + co.color + String(c) + ')';
            data.particleEjectionParam.colorData.push(co);
            co = { color: '' };
          } else {
            co.color += String(Number(c * 255)) + ',';
          }
        });
      },
      del() {
        if (_disposer && particleSystemTails) {
          _disposer.forEach((el) => {
            el();
          });
          _disposer.length = 0;
        }
        if (!isSaved) {
          if (particleSystem) {
            particleSystem.destroy();
            particleSystem = undefined;
          }
          if (particleSystemTails) {
            particleSystemTails.destroy();
            particleSystemTails = undefined;
          }
        }
        if (pin) pin = pin && pin.destroy();
        if (lefthandler) lefthandler = lefthandler && lefthandler.destroy();
      },
      changeType(val) {
        //彗尾状
        if (val == 'toBeCometTail') {
          particleSystemTails.toBeCometTail();
          particleSystemTails.rotation = [0, 0, 0];
          particleSystemTails.height = 50;
          data.particleEjectionParam.colorData = [
            { color: 'rgba(153, 153, 153, 1)' },
            { color: 'rgba(153, 153, 229, 0.9)' },
            { color: 'rgba(127, 127, 178, 0.5)' }
          ];
          data.particleEjectionParam.height = 50;
        }
        //火焰喷射状
        if (val == 'toBeRocketThruster') {
          particleSystemTails.toBeRocketThruster();
          particleSystemTails.rotation = [0, 0, 3.14];
          particleSystemTails.height = 25;
          data.particleEjectionParam.height = 25;
          data.particleEjectionParam.colorData = [
            { color: 'rgba(255, 127, 12, 1)' },
            { color: 'rgba(229, 153, 2, 1)' },
            { color: 'rgba(204, 12, 22, 1)' },
            { color: 'rgba(255, 12, 22, 1)' }
          ];
        }
        //烟雾状
        if (val == 'toBeSmoke') {
          particleSystem.toBeSmoke();
          data.particleParam.startColor = 'rgba(248, 228, 6, 1)';
          data.particleParam.endColor = 'rgba(245, 45, 45, 1)';
        }
        //喷泉状
        if (val == 'toBeFountain') {
          particleSystem.toBeFountain();
          data.particleParam.startColor = 'rgba(255, 255, 255, 1)';
          data.particleParam.endColor = 'rgba(255, 255, 255, 1)';
          particleSystem.rotation = [0, 0, 0];
        }
      },
      particleTypeChange() {
        const arr1 = ['toBeCometTail', 'toBeRocketThruster'];
        const arr2 = ['toBeSmoke', 'toBeFountain'];
        if (particleSystemTails && arr1.indexOf(data.particleType) > -1) {
          particleSystemTails.show = true;
          if (particleSystem) particleSystem.show = false;
          methods.changeType(data.particleType);
          methods.changeColor();
        } else if (
          pin &&
          pin.enabled == false &&
          arr1.indexOf(data.particleType) > -1
        ) {
          methods.createParticleSystemTails(pin.position);
          particleSystemTails.show = true;
          particleSystem.show = false;
        }
        if (particleSystem && arr2.indexOf(data.particleType) > -1) {
          if (particleSystemTails) particleSystemTails.show = false;
          particleSystem.show = true;
          methods.changeType(data.particleType);
          methods.changeColor2();
        } else if (
          pin &&
          pin.enabled == false &&
          arr2.indexOf(data.particleType) > -1
        ) {
          methods.createParticleSystem(pin.position);
          particleSystemTails.show = false;
          particleSystem.show = true;
        }
        if (data.particleType == 'toBeCometTail') {
          data.particleEjectionParam.colorData = [
            { color: 'rgba(153, 153, 153, 1)' },
            { color: 'rgba(153, 153, 229, 0.9)' },
            { color: 'rgba(127, 127, 178, 0.5)' }
          ];
        }
        if (data.particleType == 'toBeRocketThruster') {
          data.particleEjectionParam.colorData = [
            { color: 'rgba(255, 127, 12, 1)' },
            { color: 'rgba(229, 153, 2, 1)' },
            { color: 'rgba(204, 12, 22, 1)' },
            { color: 'rgba(255, 12, 22, 1)' }
          ];
        }
        if (data.particleType == 'toBeSmoke') {
          data.particleParam.startColor = 'rgba(248, 228, 6, 1)';
          data.particleParam.endColor = 'rgba(245, 45, 45, 1)';
        }
        if (data.particleType == 'toBeFountain') {
          data.particleParam.startColor = 'rgba(255, 255, 255, 1)';
          data.particleParam.endColor = 'rgba(255, 255, 255, 1)';
        }
      },
      save() {
        isSaved = true;
        if (
          data.particleType == 'toBeCometTail' ||
          data.particleType == 'toBeRocketThruster'
        ) {
          const sceneObject = new XE.SceneTree.Leaf(particleSystemTails);
          earth.sceneTree.root.children.push(sceneObject);
          // thisVue.confirm(sceneObject);
        }
        if (
          data.particleType == 'toBeSmoke' ||
          data.particleType == 'toBeFountain'
        ) {
          const sceneObject = new XE.SceneTree.Leaf(particleSystem);
          earth.sceneTree.root.children.push(sceneObject);
          // thisVue.confirm(sceneObject);
        }
      },
      edit(event) {
        if (!event) {
          if (data.value == 'positionEditing') {
            data.positionEditing = !data.positionEditing;
          }
          if (data.value == 'rotationEditing') {
            data.rotationEditing = !data.rotationEditing;
          }
        }
      }
    };
    const refData = toRefs(data);
    return {
      ...refData,
      ...methods
    };
  }
});
</script>
