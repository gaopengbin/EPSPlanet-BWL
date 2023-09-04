<template>
  <div class="tool-panel-base" style="width: 320px; margin-top: 16px">
    <el-scrollbar height="202px" width="200px">
      <el-form ref="form" label-width="78px" :inline="true">
        <el-form-item label="名称">
          <el-input
            style="width: 199px"
            v-model="name"
            placeholder="请输入15个以内字符"
            size="small"
            maxlength="15"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="拉伸">
          <el-slider
            v-model="stretchRadius"
            :min="0.1"
            :max="130"
            style="width: 200px"
            show-input
            :show-input-controls="false"
            @change="changeSize($event)"
          ></el-slider>
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            style="width: 120px; margin-left: 0px"
            v-model="type"
            placeholder="请选择类型"
            size="small"
            @change="changeType($event)"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div style="float: right">
            <span
              style="
                padding-left: 10px;
                float: left;
                margin-right: 10px;
                color: #606266;
              "
              >颜色</span
            >
            <el-color-picker
              v-model="color"
              @change="changeColor"
              show-alpha
            ></el-color-picker>
          </div>
        </el-form-item>
      </el-form>
      <div class="tool-panel-button">
        <el-button size="small" @click="create">创建</el-button>
        <el-button size="small" @click="save">保存</el-button>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  computed,
  watch
} from 'vue';
import { useEarth } from '../../utils';

export default defineComponent({
  name: 'EpsplanetDynamic',
  props: [],
  setup() {
    const ctx: any = getCurrentInstance();
    const thisVue = ctx.ctx;
    let earth: any; //earth对象
    let threeDimensional: any; //立体形对象
    let pin: any; //兴趣点
    let creating: boolean = false; //pin是否创建
    let isSaved: boolean = false; //是否挂载到sceneTree.root下
    let dynamicCircle: any = {}; //动态圆参数
    let Circle_preUpdateEvalString: string = '';
    let dynamicRadiantCircle: any = {}; //动态辐射圈参数
    let RadiantCircle_evalString: string = '';
    let beamOfLight: any = {}; //光柱参数
    let handler: any; //鼠标左击事件
    const data = reactive({
      name: '立体形对象', //立体形名称
      stretchRadius: 120, //拉伸
      color: 'rgba(0,255,0,1)', //颜色
      type: '动态圆', //立体形类型
      typeOptions: [
        //立体形类型
        {
          value: '动态圆',
          label: '动态圆'
        },
        {
          value: '动态辐射圈',
          label: '动态辐射圈'
        },
        {
          value: '光柱',
          label: '光柱'
        }
      ],
      bindList: [
        //立体形绑定的属性
        { name: 'name' }
      ]
    });

    onMounted(() => {
      earth = useEarth();
    });
    onBeforeUnmount(() => {
      del();
    });
    const configure = (recreate: boolean = false) => {
      let lon = (pin.position[0] / Math.PI) * 180;
      let lat = (pin.position[1] / Math.PI) * 180;
      let height = pin.position[2];

      // 设置参数
      Circle_preUpdateEvalString =
        "\n                p._angle += 1;\n                if (p._angle > 360.0) {\n                    p._angle = 0.0;\n                }\n                const angle = p._angle;\n\n                p.drawCanvas(ctx => {\n                    ctx.clearRect(0, 0, 256, 256);\n\n                    ctx.save();\n\n                    ctx.translate(128, 128);\n                    ctx.rotate(-angle * Math.PI / 180.0);\n\n                    // 状态设置\n                    ctx.strokeStyle = '" +
        data.color +
        "'; \n                    ctx.setLineDash([8, 8]);\n                    ctx.lineWidth = 3;\n                    \n                    // 大圆\n                    ctx.beginPath();\n                    ctx.arc(0, 0, " +
        data.stretchRadius +
        ', 0, Math.PI*2, true);\n                    ctx.stroke();\n\n                    // 小圆\n                    // ctx.beginPath();\n                    // ctx.arc(0, 0, 64, 0, Math.PI*2, true);\n                    // ctx.stroke();\n\n                    p._drawArrow(ctx, 0, 0, ' +
        data.stretchRadius +
        ", 0, 30, 10, 3, '" +
        data.color +
        "');\n\n                    ctx.font = '12px Microsoft YaHei';\n                    ctx.fillStyle = '" +
        data.color +
        "';\n                    ctx.fillText('5公里', 40, -5);\n\n                    ctx.restore();\n                });\n            ";
      RadiantCircle_evalString =
        "\n                    p.canvasWidth = 512;\n                    p.canvasHeight = 512;\n                    p.drawCanvas(ctx => {\n                        ctx.clearRect(0, 0, 512, 512);\n\n                        ctx.strokeStyle = 'rgb(255, 255, 255)';\n                        ctx.setLineDash([30, 30]);\n                        ctx.lineWidth = 5;\n                        ctx.arc(256, 256, " +
        data.stretchRadius +
        ', 0, Math.PI * 2, true);\n                        ctx.stroke();\n                    });\n                ';
      dynamicCircle = {
        //动态圆参数
        name: data.name,
        position: [lon, lat, height]['xeptr'],
        positions: XE.Obj.CustomPrimitive.Geometry.unitSquare.positions,
        sts: XE.Obj.CustomPrimitive.Geometry.unitSquare.sts,
        indices: XE.Obj.CustomPrimitive.Geometry.unitSquare.indices,
        scale: [100, 100, 1],
        renderState: XE.Obj.CustomPrimitive.getRenderState(true, true),
        canvasWidth: 256,
        canvasHeight: 256,
        autoRegisterEditing: true,
        evalString:
          "\n                if (p._drawArrow) {\n                    return;\n                }\n\n                // ctx：Canvas绘图环境\n                // fromX, fromY：起点坐标（也可以换成p1，只不过它是一个数组）\n                // toX, toY：终点坐标 (也可以换成p2，只不过它是一个数组)\n                // theta：三角斜边一直线夹角\n                // headlen：三角斜边长度\n                // width：箭头线宽度\n                // color：箭头颜色\n                function drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {\n\n                    theta = typeof (theta) != 'undefined' ? theta : 30;\n                    headlen = typeof (theta) != 'undefined' ? headlen : 10;\n                    width = typeof (width) != 'undefined' ? width : 1;\n                    color = typeof (color) != 'color' ? color : '#000';\n\n                    // 计算各角度和对应的P2,P3坐标\n                    var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,\n                        angle1 = (angle + theta) * Math.PI / 180,\n                        angle2 = (angle - theta) * Math.PI / 180,\n                        topX = headlen * Math.cos(angle1),\n                        topY = headlen * Math.sin(angle1),\n                        botX = headlen * Math.cos(angle2),\n                        botY = headlen * Math.sin(angle2);\n\n                    ctx.save();\n                    ctx.beginPath();\n\n                    var arrowX = fromX - topX,\n                        arrowY = fromY - topY;\n\n                    ctx.moveTo(arrowX, arrowY);\n                    ctx.moveTo(fromX, fromY);\n                    ctx.lineTo(toX, toY);\n                    arrowX = toX + topX;\n                    arrowY = toY + topY;\n                    ctx.moveTo(arrowX, arrowY);\n                    ctx.lineTo(toX, toY);\n                    arrowX = toX + botX;\n                    arrowY = toY + botY;\n                    ctx.lineTo(arrowX, arrowY);\n                    ctx.strokeStyle = color;\n                    ctx.lineWidth = width;\n                    ctx.stroke();\n                    ctx.restore();\n                }\n\n                p._drawArrow = drawArrow;\n                p._angle = 0;\n            ",
        preUpdateEvalString: Circle_preUpdateEvalString
      };
      dynamicRadiantCircle = {
        //动态辐射圈参数
        name: data.name,
        position: [lon, lat, height]['xeptr'],
        positions: XE.Obj.CustomPrimitive.Geometry.unitSquare.positions,
        sts: XE.Obj.CustomPrimitive.Geometry.unitSquare.sts,
        indices: XE.Obj.CustomPrimitive.Geometry.unitSquare.indices,
        scale: [100, 100, 1],
        renderState: XE.Obj.CustomPrimitive.getRenderState(true, true),
        canvasWidth: 512,
        canvasHeight: 512,
        autoRegisterEditing: true,
        evalString: RadiantCircle_evalString,
        preUpdateEvalString:
          "\n                    if (typeof p.dAngle === 'undefined') p.dAngle = 0.0;\n                    if (typeof p.dt === 'undefined') p.dt = 0.01;\n\n                    p.dAngle += 10.0;\n                    if (p.dAngle > 360.0) {\n                        p.dAngle = 0.0;\n                    }\n                    p.rotation[0] = p.dAngle / 180.0 * Math.PI;\n\n                    p.dt += 0.02;\n                    if (p.dt > 1.0) p.dt = 0.01;\n\n                    p.scale[0] = 50 * p.dt;\n                    p.scale[1] = 50 * p.dt;\n                "
      };
      beamOfLight = {
        //光柱参数
        name: data.name,
        position: [lon, lat, height]['xeptr'],
        positions: [
          2, 0, 0, 1.0000000000000002, 1.7320508075688772, 0,
          -0.9999999999999996, 1.7320508075688774, 0, -2,
          2.4492935982947064e-16, 0, -1.0000000000000009, -1.732050807568877, 0,
          0.9999999999999987, -1.732050807568878, 0, 2, -4.898587196589413e-16,
          0, 0.3, 0, 1, 0.15000000000000002, 0.25980762113533157, 1,
          -0.14999999999999994, 0.2598076211353316, 1, -0.3,
          3.6739403974420595e-17, 1, -0.15000000000000013, -0.2598076211353315,
          1, 0.1499999999999998, -0.2598076211353317, 1, 0.3,
          -7.347880794884119e-17, 1
        ],
        sts: [
          0, 0, 0.16666666666666666, 0, 0.3333333333333333, 0, 0.5, 0,
          0.6666666666666666, 0, 0.8333333333333334, 0, 1, 0, 0, 1,
          0.16666666666666666, 1, 0.3333333333333333, 1, 0.5, 1,
          0.6666666666666666, 1, 0.8333333333333334, 1, 1, 1
        ],
        indices: [
          0, 1, 7, 1, 8, 7, 1, 2, 8, 2, 9, 8, 2, 3, 9, 3, 10, 9, 3, 4, 10, 4,
          11, 10, 4, 5, 11, 5, 12, 11, 5, 6, 12, 6, 13, 12
        ],
        // scale: [3, 3, 300],
        scale: [
          data.stretchRadius / 50,
          data.stretchRadius / 50,
          data.stretchRadius * 2
        ],
        renderState: XE.Obj.CustomPrimitive.getRenderState(true, true),
        canvasWidth: 1,
        canvasHeight: 0,
        autoRegisterEditing: true,
        fragmentShaderSource:
          '\n                varying vec3 v_positionEC;\n                varying vec3 v_normalEC;\n                varying vec2 v_st;\n                varying vec4 v_color;\n                uniform sampler2D u_image;\n                uniform vec4 u_color;\n                void main()\n                {\n                    float powerRatio = fract(czm_frameNumber / 30.0) + 1.0;\n                    float alpha = pow(1.0 - v_st.t, powerRatio);\n                    gl_FragColor = vec4(u_color.rgb, alpha*u_color.a);\n                }\n                ',
        evalString: '',
        preUpdateEvalString: ''
      };
      let config =
        data.type == '动态圆'
          ? dynamicCircle
          : data.type == '动态辐射圈'
          ? dynamicRadiantCircle
          : beamOfLight;
      threeDimensional.xbsjFromJSON(config);
      threeDimensional.flyTo();
      changeColor();
    };
    const cteatePin = () => {
      //创建pin
      pin = new XE.Obj.Plots.GeoPin(earth);
      pin.innerHTML =
        '<div style="cursor:pointer;position:absolute;width:300px;left:6px;line-height:15px;color:white;"><span style="padding:2px;border-radius:2px;text-stroke:2px #000;font-size:14px;color:#ffffff;background-color:rgba(50,50,50,0.5)">点击左键确定中心点</span></div>';
      pin.creating = true;

      // 注册点击事件：左键点击，添加标注,全局只注册一次，所以和pin放一块
      handler = new Cesium.ScreenSpaceEventHandler(
        earth.czm.viewer.scene.canvas
      );
      handler.setInputAction((event) => {
        configure();
        pin.enabled = false;
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    const cteateThreeDimensional = () => {
      // 创建立体形
      threeDimensional = new XE.Obj.CustomPrimitive(earth);
      threeDimensional.name = data.name;
      //绑定属性
      data.bindList.forEach((el: any) => {
        el.unbind = XE.MVVM.bind(thisVue, el.name, threeDimensional, el.name);
      });
    };
    const create = (
      ifpin: boolean = true,
      ifthreeDimensional: boolean = true
    ) => {
      if (ifpin && !pin) cteatePin();
      if (ifthreeDimensional && !threeDimensional) cteateThreeDimensional();
    };
    //改变立体形类型
    const changeType = (event) => {
      if (threeDimensional) {
        threeDimensional.xbsjFromJSON(
          event == '动态圆'
            ? dynamicCircle
            : event == '动态辐射圈'
            ? dynamicRadiantCircle
            : beamOfLight
        );
        changeColor();
        changeSize(data.stretchRadius);
        threeDimensional.flyTo();
      } else return;
    };
    //改变立体形尺寸
    const changeSize = (newradius) => {
      if (threeDimensional) {
        Circle_preUpdateEvalString =
          "\n                p._angle += 1;\n                if (p._angle > 360.0) {\n                    p._angle = 0.0;\n                }\n                const angle = p._angle;\n\n                p.drawCanvas(ctx => {\n                    ctx.clearRect(0, 0, 256, 256);\n\n                    ctx.save();\n\n                    ctx.translate(128, 128);\n                    ctx.rotate(-angle * Math.PI / 180.0);\n\n                    // 状态设置\n                    ctx.strokeStyle = '" +
          data.color +
          "'; \n                    ctx.setLineDash([8, 8]);\n                    ctx.lineWidth = 3;\n                    \n                    // 大圆\n                    ctx.beginPath();\n                    ctx.arc(0, 0, " +
          data.stretchRadius +
          ', 0, Math.PI*2, true);\n                    ctx.stroke();\n\n                    // 小圆\n                    // ctx.beginPath();\n                    // ctx.arc(0, 0, 64, 0, Math.PI*2, true);\n                    // ctx.stroke();\n\n                    p._drawArrow(ctx, 0, 0, ' +
          data.stretchRadius +
          ", 0, 30, 10, 3, '" +
          data.color +
          "');\n\n                    ctx.font = '12px Microsoft YaHei';\n                    ctx.fillStyle = '" +
          data.color +
          "';\n                    ctx.fillText('5公里', 40, -5);\n\n                    ctx.restore();\n                });\n            ";
        RadiantCircle_evalString =
          "\n                    p.canvasWidth = 512;\n                    p.canvasHeight = 512;\n                    p.drawCanvas(ctx => {\n                        ctx.clearRect(0, 0, 512, 512);\n\n                        ctx.strokeStyle = 'rgb(255, 255, 255)';\n                        ctx.setLineDash([30, 30]);\n                        ctx.lineWidth = 5;\n                        ctx.arc(256, 256, " +
          data.stretchRadius +
          ', 0, Math.PI * 2, true);\n                        ctx.stroke();\n                    });\n                ';
        if (data.type == '光柱') {
          threeDimensional.scale = [
            newradius / 50,
            newradius / 50,
            newradius * 2
          ];
        }
        if (data.type == '动态圆') {
          threeDimensional.preUpdateEvalString = Circle_preUpdateEvalString;
        }
        if (data.type == '动态辐射圈') {
          //清空画布重新赋值evalString的方法不起作用，所以只能销毁并且重新生成立体形-----bug
          if (data.bindList && threeDimensional) {
            data.bindList.forEach((el: any) => {
              el.unbind();
            });
            data.bindList.length = 0;
          }
          if (threeDimensional) {
            threeDimensional.destroy();
            threeDimensional = undefined;
          }
          create(false, true);
          configure(true);
          // threeDimensional.drawCanvas(ctx => {
          //   ctx.clearRect(256, 256, 1024, 1024);
          // });

          // setTimeout(() => {
          //   threeDimensional.evalString = RadiantCircle_evalString;
          // }, 5000);
        }
      } else return;
    };
    // 改变颜色
    const changeColor = () => {
      Circle_preUpdateEvalString =
        "\n                p._angle += 1;\n                if (p._angle > 360.0) {\n                    p._angle = 0.0;\n                }\n                const angle = p._angle;\n\n                p.drawCanvas(ctx => {\n                    ctx.clearRect(0, 0, 256, 256);\n\n                    ctx.save();\n\n                    ctx.translate(128, 128);\n                    ctx.rotate(-angle * Math.PI / 180.0);\n\n                    // 状态设置\n                    ctx.strokeStyle = '" +
        data.color +
        "'; \n                    ctx.setLineDash([8, 8]);\n                    ctx.lineWidth = 3;\n                    \n                    // 大圆\n                    ctx.beginPath();\n                    ctx.arc(0, 0, " +
        data.stretchRadius +
        ', 0, Math.PI*2, true);\n                    ctx.stroke();\n\n                    // 小圆\n                    // ctx.beginPath();\n                    // ctx.arc(0, 0, 64, 0, Math.PI*2, true);\n                    // ctx.stroke();\n\n                    p._drawArrow(ctx, 0, 0, ' +
        data.stretchRadius +
        ", 0, 30, 10, 3, '" +
        data.color +
        "');\n\n                    ctx.font = '12px Microsoft YaHei';\n                    ctx.fillStyle = '" +
        data.color +
        "';\n                    ctx.fillText('5公里', 40, -5);\n\n                    ctx.restore();\n                });\n            ";
      let cc = [];
      cc = cc.concat(transColorToCesium(data.color));
      threeDimensional.color = cc;
      if (data.type == '动态圆') {
        //!!!!!!!这里有个bug,changColor函数比监听函数先执行，导致这里的Circle_preUpdateEvalString来不及更新，
        setTimeout(() => {
          threeDimensional.preUpdateEvalString = Circle_preUpdateEvalString;
        }, 100);
      }
    };

    const transColorToCesium = (val) => {
      let v = val.split('(')[1].split(')')[0].split(',');
      let cc: any = [];
      v.forEach((c, i) => {
        if (i == 3) {
          cc.push(Number(c));
        } else {
          cc.push(Number(c) / 255.0);
        }
      });
      return cc;
    };
    const del = () => {
      if (handler) {
        handler = handler && handler.destroy();
      }
      if (data.bindList && threeDimensional) {
        data.bindList.forEach((el: any) => {
          el.unbind();
        });
        data.bindList.length = 0;
      }
      if (threeDimensional && !isSaved)
        threeDimensional = threeDimensional && threeDimensional.destroy();
      if (pin) pin = pin && pin.destroy();
    };
    const save = () => {
      isSaved = true;
      const sceneObject = new XE.SceneTree.Leaf(threeDimensional);
      earth.sceneTree.plots.dynamic.children.push(sceneObject);
      thisVue.confirm(sceneObject);
    };
    const refData = toRefs(data);
    return {
      ...refData,
      create,
      changeType,
      changeSize,
      changeColor,
      transColorToCesium,
      save,
      del
    };
  }
});
</script>
