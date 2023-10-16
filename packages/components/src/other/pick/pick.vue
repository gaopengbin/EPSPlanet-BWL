<template>
  <div class="epsplanet-panel-base pick" style="width: 450px">
    <span>点击任意模型或二维面进行拾取</span>
    <el-form label-width="20px">
      <el-form-item>
        <el-pagination v-show="pageList.length" small layout="prev, pager, next" :page-size="1" :total="pageList.length"
          @current-change="currentChange" />
        <el-table :data="tableData" border height="350">
          <el-table-column prop="name" label="属性名" />
          <el-table-column prop="value" label="属性值" />
        </el-table>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import {
  reactive,
  toRefs,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import axios from "axios";
import { ElLoading, ElMessage } from "element-plus";
import { useEarth } from '../../utils';
import { PickModel } from "./pickModel";
import { PickVector } from "./pickVector";

export default defineComponent({
  name: "EpsplanetPick",
  setup() {
    const data = reactive({
      _czmObject: undefined as any,
      _disposer: [] as any,
      pageList: [] as any,
      tableData: [] as any,
      locale: {
        zh: [], en: []
      }
    });
    let earth: any;
    const { proxy } = getCurrentInstance() as any;
    const thisVue = proxy;
    onBeforeMount(async () => {
      await axios
        .get("Epsplanet_Assets/widgets/pick/config.json")
        .then((res) => {
          // thisVue.serverURL = res.data.serverWfs;
          data.locale = res.data.locale;
        })
        .catch((err) => {
          ElMessage.error("加载配置文件失败");
          del();
        });
    });
    let pickV: PickVector;
    let pickM: PickModel;
    onMounted(async () => {
      earth = useEarth();
      // initPick();
      pickM = new PickModel(earth)
      pickV = new PickVector(earth);
      let loadService: any;
      pickM.pick(res => {
        if (res == 'start') {
          loadService = ElLoading.service({
            text: "拾取中",
            target: ".pick",
          });
          pickV.stopPick = true
        } else {
          if (res) {
            if (loadService) {
              loadService.close()
            }

            data.tableData = res.propertyList;
            //替换字段名中英文
            if (data.locale) {
              data.tableData.forEach((item: any) => {
                if (data.locale.en.findIndex((en: any) => en == item.name) != -1) {
                  item.name = data.locale.zh[data.locale.en.findIndex((en: any) => en == item.name)]
                }
              });
            }

            data.pageList = []
            pickV.stopPick = true
          } else {
            pickV.stopPick = false
            pickV.pick(result => {
              if (result.length > 0) {
                data.pageList = result
                currentChange(1)
                if (loadService) {
                  loadService.close()
                }
              } else {
                data.pageList = []
                data.tableData = []
                if (loadService) {
                  loadService.close()
                }
              }
            })
          }
        }

      })

    });
    onBeforeUnmount(() => {
      pickV.destroy()
      pickM.destroy()
      del();
    });

    // TODO 切换页面时，重新获取数据
    const currentChange = (cur) => {
      if (data.pageList.length == 0) return
      let feature = data.pageList[cur - 1];
      pickV.highLight(feature)
      let table: any = []
      Object.keys(feature.properties).map(key => {
        table.push({
          name: key,
          value: feature.properties[key]
        })
      })
      data.tableData = table;
    };
    // 飞到当前对象
    const flyToCurrent = () => {
      thisVue._czmObject.flyTo();
    };
    // 清理绑定对象，关闭拾取
    const del = () => {
      if (thisVue._disposer.length) {
        thisVue._disposer.forEach((d: any) => d());
        thisVue._disposer = [];
      }
      earth.interaction.picking.enabled = false;
    };
    return {
      ...toRefs(data),
      currentChange,
      flyToCurrent,
    };
  },
});
</script>
<style scoped></style>
