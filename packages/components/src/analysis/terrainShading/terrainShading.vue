<template>
  <div class="epsplanet-panel-base terrainShading" style="width: 450px">
    <!-- <el-scrollbar height="202px" width="400px"> -->
    <el-row>
      <el-col :span="6" v-for="(terrain, index) in terrainData" :key="index">
        <div class="grid-content">
          <el-button
            type="primary"
            plain
            class="thisbtn"
            @click="terrainChange(terrain.id)"
          >
            <div>
              <span class="iconfont" :class="terrain.icon"></span>
            </div>
            <div class="child-tool-item-inner-title">{{ terrain.title }}</div>
          </el-button>
        </div>
      </el-col>
    </el-row>
    <el-row v-if="terrainType == 'elevation'">
      <el-col :span="6">
        <div class="demonstration"><span>高度范围</span></div>
      </el-col>
      <el-col :span="18">
        <el-slider
          v-model="heightRange"
          range
          :step="10"
          :min="0"
          :max="10000"
          @change="changeHeight"
          style="width:340px !important"
        />
      </el-col>
    </el-row>
    <el-row
      v-if="
        terrainType == 'slope' ||
        terrainType == 'elevation' ||
        terrainType == 'aspect'
      "
    >
      <el-col :span="6">
        <div class="demonstration">
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;色带</span>
        </div>
      </el-col>
      <el-col :span="18">
        <XbsjRampSelect
          class="ramptwo"
          ref="ramp"
          @selected="selected"
        ></XbsjRampSelect>
      </el-col>
    </el-row>
    <el-row v-if="terrainType == 'contour'">
      <el-col :span="4">
        <div class="demonstration">
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;线宽</span>
        </div>
      </el-col>
      <el-col :span="18">
        <el-slider
          v-model="contour.lineWidth"
          :min="1"
          :max="10"
          :step="0.1"
          show-input
          :show-input-controls="false"
          @change="changeContourpar('lineWidth')"
        ></el-slider>
      </el-col>
      <el-col :span="4">
        <div class="demonstration">
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间距</span>
        </div>
      </el-col>
      <el-col :span="18">
        <el-slider
          v-model="contour.spacing"
          :min="1"
          :max="300"
          :step="1"
          show-input
          :show-input-controls="false"
          @change="changeContourpar('spacing')"
        ></el-slider>
      </el-col>
      <el-col :span="4">
        <div class="demonstration">
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;颜色</span>
        </div>
      </el-col>
      <el-col :span="1">
        <el-color-picker
          v-model="contour.uicolor"
          show-alpha
          @active-change="changeColor"
        ></el-color-picker>
      </el-col>
    </el-row>
    <!-- </el-scrollbar> -->
  </div>
</template>
<script lang='ts'>
/* eslint-disable */
import "./style/index.scss";
import XbsjRampSelect from "./RampSelect.vue";
import { useEarth } from '../../utils';
import {
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  defineComponent,
  ref,
} from "vue";

export default defineComponent({
  name: "EpsplanetTerrainShading",
  props: [],
  components: { XbsjRampSelect },
  setup() {
    const ramp = ref();
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    let sunwayearth: any;
    let tileset: any;
    let _disposer: any = [];
    const data = reactive({
      terrainData: [
        {
          title: "按高程",
          icon: "icon-gaocheng",
          id: "elevation",
        },
        {
          title: "按坡度",
          icon: "icon-podu_1",
          id: "slope",
        },
        {
          title: "按坡向",
          icon: "icon-poxiang",
          id: "aspect",
        },
        {
          title: "按等高线",
          icon: "icon-a-3k-5",
          id: "contour",
        },
      ],
      //地形图片信息
      heightRange: [0, 5000], //高度范围
      terrainType: "",
      contour: {
        lineWidth: 1,
        spacing: 100,
        uicolor: "rgba(249, 42, 0, 0.8)",
      },
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARoAAAAKCAYAAABrEpGVAAAAAXNSR0IArs4c6QAAFd5JREFUaEN9msuLdd1W3n9jzrXWvlTVe/u+nHM8ohINdlQwHclfENJJOhEJ3lDE/8OWYgQRbaSTKHgUlbRCSCOEkEaUEAyJGi9pBBHBht/tfWvXvqzbnEOeMVe97yfKKVjsql1rr733mHP+5vM8Y9l//fe/4oUMS8/dDV5cR47zI+Yn1nRl9/YjfD7j9UTpLix2w5eJ/a1wXGB3W3EvzNcTxz5RL1eGucJlIRdjuDzBCtxWGBfm85lC5fDRHoYMu9Iee4e0UvNM7YEOSoLuACkDem4wypDxwbC+gy5h/UrqDHQM4F2l9k7uE/paxh2YQ67QFcgLNS2QC/pJunjeXt/piRqHx+/GuquQEynRrhGPkDowvY4dmJ73+MzeOdZbnKPnPKd4jfUlvlc1WFBJDKfDvLLiLGbcHG4GN3SOUXHOZWY1mIHZYDIYacdS4Sm18i4OF9pxtcQTlUllx3jnzpN1PJE4zzN9gVcd3HdJJeNgxguHFxXua+Xozs5AX2NnKb5K/J6Mo0dF2buGzBiSyt6uc+ewr4VDNfZm8RqzHX2euGdlqIkx9fxh+Qn+7adf4X+nH+RPdt8b9ahR1xXsAsXp5nvy0vHycStvBQrUqn8XqjurOd01U+NJ8GJRYKtGWSteoL/mGEvVaDZn9ZVa2oWSZsf10Ao5QTdV+jnFoSmiqWBrpa4eBTZNmzWTF2sX1HuOel9wnaMBWsFnqAtU/e7ONFeWmpknuL6dyGPhIQ3cdx3fci0MKXFMxr05d9VbDd3JOD0VS5muywzJOLjqbNypxq6BgMHboaV0LIVD8RjTPiVeasrH8tG1NEVVaPBYhXrui222XXFOmJ3AnnCuqhhrfUs2xzTHbcFsxO2G+Q3XLPYZV/HqDUtXzJ7aGHLD64SpQID99//wDZ8XZ5mc4bFwfDpzEGh4wtON/foK5it5OWN2o3IjzSPHa+FOoLmueF1YpguHjgBNP4OfZ8wT09uJrjpcbzDduF1PaD7cfQQ2EIuv32m2a5GC7yDtWwFVk2qGddYWvh6zXlOhz6Sk2S8QqJKCjsdCF2xsSA0E3YppwuscrQY9BkT07WEWJ3J7b/3P9Z7b7/r/LnV4svZeqTSg5PaZdH7pcvzfs+P6n0bz/Xs4Q1BJzy2UzinJWbRIXAsmc/OidRUgCch4g8nsBGAEuOKGhnNOMJoxtqHdQNOxookcQ8vFEmeDc5zTpsupwin1nAWaqY3H6yFznxP31YTKvwWae2qUSqA4pkzCxdr4aoLNgMdr9HUfNMktN2BROWqS65qpgWY3Qu7nWAip9jx2O/6w/hS/9u47+KPhX/FX6eMGDxbcnkjp0hb4fIetdwyX+1Z2PVc8oLLWGotERzd28VzAQJApKRZ+g5Iz1xJw14IPIAUwCppCuubHl12jtEAzV/op0S22gcaYS0dZPa7vARcNuq7V3iddvwSaRZBpO8l70Mwr4+qU0jNPzvg4B2he9nuOKfEwLQGa+5Q5UrjzBpqdvps7X68ZExK7RJ8s4BPLwxO9Ox+5xXTeBeSJaxwx9tsR07TtgbF5aBy1HqJmOKl+GsUy/n7QFH+HPkFspjrPFtz1RTUDK8Yj1Uc0K7XNafxIF9yvcV56Bs1/+dVf9EpPqgN3EzzcJu5mEe0daxrp5kwaR/JyhTSx6oXLxGFcOCzwcCmUMrPMV3apUq9X+sWo55FEz/RO4sGx6wzjldv5bYDm/iMjDzAOzrBPpF2mDIU6OBZ/Wyx6LeSUjdRpphZqtzZF0bdFWPdggoAUkWZ259Thg+Iog8d5AZpnCITaUPGca4BmA4deK2BswNH7HNlvoGmKxlXwXNtrcg546FqCjEsl9amBLq5hqmyAxnuptbYLx3ytUD1x6moMs6AQCsSNydrver6vfSie2DeSMwdotC7aIjqnoSmi6vHamxlPZlzNA0g3r5yqcco9J89c5oneK692HXdmvF4FiMQLEg9VO6oman2vaO63UnVSlwKOSp28wQfjpZgfyqfttvuihdBAJADda35qVWt/LAOfpSP/x36a3zh/J396+FEezwuaEFZWst3ImvDueDmwlgNleU0qWhAic1MuAZv3oGkLXgzRo0Ajskhh6Lw5j/GYVkk/J9+gX5x9yXQlsQuJKdI7afJQM+9BU4z+OsS1V8GjOmtN1GIUwUbDfXkGTQOMazcI0GxwmtZQNGvpWRdjPi30Y+VVt+euM+7HNZTH0XQUjtU5eI0aqt7fXqVBLFSNpaZydAzuJDO+tkqVpADLAQ+1eQwYSWVauAFtCAJ9iP4QNEKMQF2x9TPJtgYaf1Y0l7ZF+YKnp3i9XAsWspHq86a3HeOT0OchQLhgdsG05bmusVBtUzS/++9+xj319Ow5zsaL28J+fMta3jJzZrfsSONMWm9UK0xpZC0T3bywWwWahbpOrOsYE3A9X9hXYz2N7FNPfRzp1gyXGvS/nsbg4P2rl7Eo58MTw77Hh0TpVorsjSAzNIXgh5WUKllWpS+kvGCyJ8+qRHgPtaKVoGpuqmKDivc9JoQL5WFjjKrVouf0I0DJGnV6vgYMdIQaSo7tynvQuK142LAGrhhEBJrt0NbxZUUjZaLPFSAr8ZkFsWKyRQn3vFkfDYnsUIOIHqVwYjGtxmr6uzLpMTVFE8K1FM5ZoKksxRjdAzTXlLhq6CXbbVM0uefRE09SNOa8GXLI65cCjRn3ZB68cF+dnSa6yqkNgRIlHQQTyXOVW6CxBhpN7GfQ7GKRNMjo0OulBI0S0Bzp+ISBP/Cf5Lcu/5A/O/4I18tXwjF1i3g0x2QVzEs5sNRdwFWgic1KVmRTNZpDAlI3pwDAB0WTt3Oaqulcc7NiUgZSG5fKMCeOvov39VTwtYSkTFI1+hxLJi2G18pu7OPaAkts5CWFWmlWDbqzoLhZp0UwS/jkm6IRvAqjQLN2rBOsTyvD7LzOUjTGVxepXuMo9ShVGPX7AJoXIb5T2CZN367WgIxq35msrGSClKa+k2Aj6ytFqW1eY+ahaAZvKnVQPQVyFoqg5fKmAseIu1yLrJMgIU84RVFMUs5mqt/CFzbQaHZqHkjRaLZq1so66VF6esZ9pMiDyjz8j9/5OV9kkEtmd63cXSf28yPwGBmNJGy+LezGJb5kFdGWkX6e2K8a6IVl0YeRX1qYL2eOnllONw7dnvLuk/C16aIQwRgFmuI8vHlJ6jK3w2OAhl2mRo5RQ9HYvqmEdZhCkeROGctKyoWkc55BEzN6m+1hQjeduNkk73cNNGFvZKcSNWxQA43sm4nyoYYMwSRUTWeYOb5bvzloRPm4/ga5sHgb/BLc+ma79JlTLxUkyKUATSVzrh+sk6AgqyPYaOhkma5xXgx7QEbnSO2MMhvVuaSORfarJiapGjMuG2h0DWU/J+U01vFFdZ6mkV6AGbQLwp2lgMK9WSiaoysfqBGbZdM5a7hTKZM7ZQDaObf8RnXNqUTpYhKH4zV2XkLhaKctAaQa2YB74jOMP64/zjeevoX/d/ghPp2/L2xKPzXhkzX9XVawb0oij6Rq5NUU4QVEtMhVm7BOs33JOuXIZ1yec1M+fcksc2hDFM2Ua6Fbu/jOGrp7TVtJzKlqLdEtKQDU3guehtJymhny7GStvTVhyiGVf1wtPpMrt4nwrfsSaAr9mriOK+ucKTPMj9qgnVfsuEuZr9dWt0gPTJaoQWYwj7pma4DYk1s+U3Vug5PqKyvTaZxiHGtTlQKL/h9CX4rHYz/dhyUuZBNipEz0+zkKoSzFeQpIfACNMhmpFomDE54ecX/CBROpHQ+PGwUM+2QjyZQwXoMHAlDJG2j+42/+ay/0mPccJuNhmtkvsk4tDL6UPYdz4cXZeZgSw7zSTyOHm86T7J+Zl1vIL2F8enriaB3j6crDcMf58a9jN0rXGbvdGE9fxAjev+nIvTPuCv3OyPuOVfbi71inPkCTFPx2gkDFcwuAI7/YSX0IGAr9BKMP1kmvWbv6t6yTFrtC5FBBWoh7KZMWGEZGs6kaQU7X7ZVIREbz91untZfikW2SAtsUUlxrU0TesiR99sh1QroqCE54zVxcQ96Uh8ymrM5EaorGXMMei3WSug/QNJv1DJpTShGMylVMYbsSN5OiaXZLSuhM5m3q+LwW3o1j7I4v+6ylx13WopOiabI7MgIaPJ7dpoD0oAC5CEYKehuXBRpLa1wvVE1M8NoewzYaWTtwgoea2S89567n/9Yf5tdOb/ij/b/kL8o/Bi3uLZ/PUjXKVUrG68Bqc8wfNRY+hLCqXbOWaW4WKVSFmK9N89k6Sf14xyyQ6GkP9x57gr7DOjd4NtBEJkqWstEGrkO511AiDEuTDqMTEOdEnmU7FAZvoIkweFM0CoP1uWRrvON6U4aZWEannNb3oDla5rVXuvQcyrdsRkDYbZnYgRJh+wtP3Av03qyuxkzp2Z4l6qy/NU4CSdjW+MpGVvTgGhMBrLCT/XI1cKRIBJgNNKFoBBptdbcIfCPV9g6zM57eUu2ziFTctP0pCKu4ay4vuMJg08xVIa+4AFRnqhJ0zfj/9I1fcE/6mAOHOXF3GxmmR+byOTMX1mHg8OS8eEo8hH+t5HFmP43s1w0u043UFcoyMp6fOKYd4+OFh8MD0+Nb+rVgl1uAZjrJ0zn3b2SFoAyQVZn9Zit6sE17a+GaPNNz2yO6OgprWzics1G14zx3nSKnaYGwZr5g5ElhsBRFszWR9TzbG218ej+BKq5pFBPIPiiSrvvmYfAk0MkKBWhqdJwi1JZdSgr0NFCCWcuW9N3dJMsl/TOnTru+BUgEm+cwWH8LMNfYLRpc5iTAfMhoVi+cTHqhUqpF1BCwUo7jggyMXrikzLvU8UkpnKZF4pGHIdEpq7G8KRsLyKjrMWgX3VisnpMmsLoXL6px1A4s8Ou7KJepSygkgSVCYtduuwlEqbHSdtnXC7xYHhj7O/4g/Qj/5t0rfr//F3wyfDd13TUVIlFYJ7qykJYOW3pGSf3q9EsKAKRFmYzqp2neNlRZJ1/1hDoFWxC8gUfnTQKFNhfV4zqTa2KXO8qkRdqskU1SLR42P60WENG1dsuztZKasU31bBt5qfjcUVedo6ZMwnV8CTTZei5XZZiJcmugUbYpRXOwxEtZn61+O9aWb5k30JgAX9hH1mXcyxrJ2gog1jqhD0XfIUeXL1Sl1GSI6q3LNHTkLWBuSmlF7QO5Dyma0NDKaKRoXPnKl0Gj82TSLlT7gpo+AzWJYitUy6sNQN3C4VA6+p9N0XESgBqQwP7nb/y8F/25dAyjcxxH9stjSKWSb6w+MZyd4zXRlYFVsraMUEb6snI/LkzTLaxNWW4NNN2eyxdPvDy+IH3yKd1q5MuKnRfm04nqlYdXe3KAZiRr5kcoUBs4ZJ3Uqs5a+CWsjQ2G95mi6HxQaztjamF3S9ihFgY3y+O9R1gsU2u+jwVvak2H5SpUhbYKdCULVYd4/baF6zyZ2uguwXInQHyT9nYW0TXHdf5m255Bpva4ujZSRBtoWjQkyGixZP66jyZhg8JmnbQnRKa/7RZ6HG3LaDZrFeBR+7uth1A0z6DRNLhFdwuua+GS4V3e8dm68jiXKN+LobnMr0QklniIvKUFkcpjIvIKATY0ELnHjipZnpRjJYWJxsdlbdYp2txSMRtoYrIrnWldkjfrwMv1NePwmt9PP8YvP77k9/I/59R/jXUdwtY00FSGdaVXE2LOnHYrSaFsqJ4GAC1qV0CpAHjLS57DYBVDY6rWsp47yK6opb9ldbq9QsL3kBLrNPPxdGzBsRTK5GHzbbNesmGRAa3aRFuLW6rH1pbTeFGMoExoU0WzBWhQM0SKpsgG9txuC/NoFHWBTyU+0+u0izD+a8p52p0bm7VpimbITSUe6xoQURwhYEc+86ywk3G3qGuVA1YH2S1lPFtfRKHxAym6jLKzCvkDNFsRa9Um3NxIZDShSpRutxZ2K7R2FCkUKZq3Te34Qm73b1DSu8hwanShFHPIVs3vQdM9g+a//fbPel41iB27W2U3qz39RF8eozVVy310BCgrNs+kZcaWkbSueKkM4xSaNS0LulGgnTNhoXYK6XSjl4S8Lvi7C8ulRju3vzOGuwNpd417KASWuCVFKBd0toXvQw7FUbYgQPfQVMFmUzezFIR2va4FunGdUDMfpL0UR9ibzVq9v8dFMlIb6WaTtPJC2bSwIJRIjm30S2FylwNyz8GyD0rq22aq95SaifwodvxIdLcM6cPjc6NDgLi6YrUGmhbgtkbjc9w2Z3WdWhismwvklrXntK6UDu2DrbWt/eQS5ylyUIfLWKeBS+d8kSuf11G3N8XtQC9z4qE78IZLAEWT+CGAYvHYRKVap7t2P0fkMBZqR/lLp5QpOk1LAEVlV7dDYWZrr7av/anuvaHwrezYX18w2ffzu/kH+KXb1/m9l/+I8/pP44sIDv1c6Yo6P7XZ7aLbAHZhYSKbkUVaChbdJ8l2BcT7gLY6QFoXehS0YvFX46BQV1D60DRp9wVUjzzn1ZLa9aZCunlYo07dJ2VCNbGq8np/hbwKk6VMdE11sbRfTQqjtzU502Cytbc10RXSK2u+LgvjeYbzzGFKfJSOvOx6vjreIr9SvVQ3wf5Ijvprv5KlVRisPEbaQkDqt1u/NMUOz6CK1z8HynG3SIsuW1OUPik30xiudC57qlmlmaPgdiWpQxRBvGaXZuDY/GO5tEfBw65bG1x5TstkdzEbn72nfm/XaHq6XTe21v/867/kuXbRxh4WY1hmhnKlr5e4Kef+nSpXwzerx5fKEuAJ+FTnze0LvK4UgWaaQtXosQpEdSV/cYsbxPpJ1Z5Yb1Pscmk/0O13LK+fYqHGAlVlt5v1YtGqoPft3pYA67N16tvfUjrDXiHLBwXyoYXtsdBvH7VQV+e0bpKgsN17o4FRAqfNdMtZNlC3vEUWYQceMGptdHWsLKXIbTSC6U5+rKkZXUPXjla6frcaNk+KSkG0dym6Vg0Q7YapuXq0+2OztNRuxBMgtpv6pkndgXZPje6tmVILipU96vm/VE228Dj2lM2CRQvd4c/LjqnTdIITC7PXFoKmLizutzIFKFR2qZkIexUgqqOD8VWpvfdSvLVcdUg66z9f967J9M0yKQuIjGab4N91+gcsu8/jJo+nCR67b+d/+T/jtx5/gD95+Cf8//o9weNOrWdlMUuDjVUPINZZXjn6q/FcAKLdG9Cku7qwIokWu2gvwAg8Oi+6bK07FTfT6LnoQGnA9X94/XbfQKegV8cWBj/fZ1POanTImjXLJjWjwQjXUY30+fZZNhWlgYwOWIsw6M5DjO1tcUbN/8sU95k90HNPz5te1qYG7AUbTcdQJFIuBt+ljT06eMJNs0waF0FHG+i36bXx95btbNZKylJthI8j0XlOCzR2uj1X6ZYAoL7RX279Tb1PS/+UtTRQyHL+eWQ5LfRtqV8z78p4mgBp7XKBSAASoNp5ApT7X8Uw/Q2Nq5Il00y5kwAAAABJRU5ErkJggg==",
    });

    onMounted(async () => {
      sunwayearth = useEarth();
      // 加载测试模型数据
      // sunwayearth.sceneTree.root.children.push({
      //   ref: "test",
      //   // czmObject: {
      //   //   xbsjType: "Terrain",
      //   //   name: "地形样例",
      //   //   xbsjTerrainProvider: {
      //   //     type: "XbsjCesiumTerrainProvider",
      //   //     XbsjCesiumTerrainProvider: {
      //   //       url: "model/dem", // Cesium官方资源都可以通过 Ion(<资源ID号>) 这种形式访问
      //   //       requestVertexNormals: true,
      //   //       requestWaterMask: true,
      //   //     },
      //   //   },
      //   // },

      //   czmObject: {
      //     xbsjType: "Terrain",
      //     xbsjGuid: "d47253ba-f703-4282-92fd-0a5de4ebeb9a",
      //     name: "全球14级地形",
      //     show: true,
      //     xbsjTerrainProvider: {
      //       type: "XbsjCesiumTerrainProvider",
      //       XbsjEllipsoidTerrainProvider: {},
      //       XbsjCesiumTerrainProvider: {
      //         url: "http://www.supermapol.com/realspace/services/3D-stk_terrain/rest/realspace/datas/info/data/path",
      //         requestVertexNormals: true,
      //         requestWaterMask: true,
      //       },
      //       GoogleEarthEnterpriseTerrainProvider: {},
      //     },
      //   },

      // });
      // tileset = sunwayearth.sceneTree.$refs.test.czmObject;
      // sunwayearth.camera.flyTo(
      //   [(107.570752 / 180) * Math.PI, (34.026197 / 180) * Math.PI, 5000],
      //   1000,
      //   [(90 * Math.PI) / 180, (-30 * Math.PI) / 180, 0]
      // );
      methods.init();
    });
    onBeforeUnmount(() => {
      methods.del();
    });
    const methods = {
      init() {
        _disposer.push(
          XE.MVVM.bind(
            thisVue,
            "image",
            sunwayearth.terrainEffect.elevation,
            "image"
          ),
          XE.MVVM.bind(
            thisVue,
            "image",
            sunwayearth.terrainEffect.aspect,
            "image"
          ),
          XE.MVVM.bind(
            thisVue,
            "image",
            sunwayearth.terrainEffect.slope,
            "image"
          )
        );
      },
      selected(it) {
        data.image = it.img;
      },

      terrainChange(id) {
        // debugger;
        // ramp.value.selected.img = data.image;
        data.terrainType = id;
        sunwayearth.terrainEffect.elevation.enabled = false;
        sunwayearth.terrainEffect.contour.enabled = false;
        sunwayearth.terrainEffect.aspect.enabled = false;
        sunwayearth.terrainEffect.slope.enabled = false;
        if (id == "elevation") {
          //高程
          sunwayearth.terrainEffect.elevation.enabled = true;
          methods.changeHeight();
          sunwayearth.terrainEffect.elevation.image = data.image;
        }
        if (id == "aspect") {
          //坡向
          sunwayearth.terrainEffect.aspect.enabled = true;
          sunwayearth.terrainEffect.aspect.image = data.image;
        }
        if (id == "slope") {
          //坡度
          sunwayearth.terrainEffect.slope.enabled = true;
          sunwayearth.terrainEffect.slope.image = data.image;
        }
        if (id == "contour") {
          //等高线
          sunwayearth.terrainEffect.contour.enabled = true;
          sunwayearth.terrainEffect.contour.width = data.contour.lineWidth;
          sunwayearth.terrainEffect.contour.spacing = data.contour.spacing;
          methods.changeColor(data.contour.uicolor);
        }
      },
      changeColor(val) {
        let v = val.split("(")[1].split(")")[0].split(",");
        let cc: any = [];
        v.forEach((c, i) => {
          if (i == 3) {
            cc.push(Number(c));
          } else {
            cc.push(Number(c) / 255.0);
          }
        });
        sunwayearth.terrainEffect.contour.color = cc;
      },
      changeHeight() {
        sunwayearth.terrainEffect.elevation.minHeight = data.heightRange[0];
        sunwayearth.terrainEffect.elevation.maxHeight = data.heightRange[1];
      },
      changeContourpar(type) {
        if (type == "lineWidth") {
          sunwayearth.terrainEffect.contour.width = data.contour.lineWidth;
        }
        if (type == "spacing") {
          sunwayearth.terrainEffect.contour.spacing = data.contour.spacing;
        }
      },
      del() {
        sunwayearth.terrainEffect.elevation.enabled = false;
        sunwayearth.terrainEffect.contour.enabled = false;
        sunwayearth.terrainEffect.aspect.enabled = false;
        sunwayearth.terrainEffect.slope.enabled = false;
        if (_disposer) {
          _disposer.forEach((d: any) => d());
          _disposer.length = 0;
        }
        // if (tileset) {
        //   sunwayearth.sceneTree.root.children.forEach((node) => {
        //     if (node.czmObject.xbsjGuid == tileset.xbsjGuid) {
        //       sunwayearth.sceneTree.root.children.remove(node);
        //     }
        //   });
        // }
      },
    };
    const refData = toRefs(data);
    return {
      ...refData,
      ...methods,
      ramp,
    };
  },
});
</script>