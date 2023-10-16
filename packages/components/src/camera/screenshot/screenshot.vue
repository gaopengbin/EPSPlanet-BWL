
<script lang="ts">
import { reactive, toRefs, onMounted, defineComponent } from "vue";
import { useEarth, changeBtnState } from '../../utils';

export default defineComponent({
  name: "EpsplanetScreenshot",
  props: ["btnClass"],
  setup(props) {
    let earth: any;
    const data = reactive({});
    onMounted(async () => {
      earth = useEarth();
      // earth.cameraViewManager.globe.flyTo();
      screenshot();
      changeBtnState(props.btnClass, false);
    });
    function screenshot() {
      // 截图并发送
      earth
        .capture(1920, 1080)
        .then((img) => {
          //通过a标签下载base64图片
          let a = document.createElement("a");
          a.href = img;
          a.download = "截图.png";
          a.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }
    return {
      ...toRefs(data)
    };
  },
});
</script>
