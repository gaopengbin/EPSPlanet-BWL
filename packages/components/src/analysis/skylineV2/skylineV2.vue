<template>
  <div>init</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive } from "vue";
import { useEarth } from '../../utils';


export default defineComponent({
  name: "EpsplanetSkylineV2",
  setup() {
    // todo
    let analysisCollection = {} as any;
    let sunwayearth: any;
    const methods = {
      startRendering() {
        if (data.isAnalysis) {
          methods.clearAnalysisRes();
        } else {
          methods.startAnalysis();
        }
        data.isAnalysis = !data.isAnalysis;
      },
      clearAnalysisRes() {
        analysisCollection.removeAll();
      },
      startAnalysis() {
        var viewer = sunwayearth.czm.viewer;
        analysisCollection = viewer.scene.postProcessStages;

        var edgeDetection =
          Cesium.PostProcessStageLibrary.createEdgeDetectionStage();

        var postProccessStage = new Cesium.PostProcessStage({
          name: "czm_skylinetemp",
          fragmentShader:
          "uniform sampler2D colorTexture;" +
            "uniform sampler2D depthTexture;" +
            "in vec2 v_textureCoordinates;" +
            "void main(void)" +
            "{" +
            "float depth = czm_readDepth(depthTexture, v_textureCoordinates);" +
            "vec4 color = texture(colorTexture, v_textureCoordinates);" +
            "if(depth<1.0 - 0.000001){" +
            "out_FragColor = color;" +
            "}" +
            "else{" +
            "out_FragColor = vec4(1.0,0.0,0.0,1.0);" +
            "}" +
            "}",
        });

        var postProccessStage1 = new Cesium.PostProcessStage({
          name: "czm_skylinetemp1",
          fragmentShader:
          "uniform sampler2D colorTexture;" +
            "uniform sampler2D redTexture;" +
            "uniform sampler2D silhouetteTexture;" +
            "in vec2 v_textureCoordinates;" +
            "void main(void)" +
            "{" +
            "vec4 redcolor=texture(redTexture, v_textureCoordinates);" +
            "vec4 silhouetteColor = texture(silhouetteTexture, v_textureCoordinates);" +
            "vec4 color = texture(colorTexture, v_textureCoordinates);" +
            "if(redcolor.r == 1.0){" +
            "out_FragColor = mix(color, vec4(1.0,0.0,0.0,1.0), silhouetteColor.a);" +
            "}" +
            "else{" +
            "out_FragColor = color;" +
            "}" +
            "}",
          uniforms: {
            redTexture: postProccessStage.name,
            silhouetteTexture: edgeDetection.name,
          },
        });

        var postProccessStage = new Cesium.PostProcessStageComposite({
          name: "czm_skyline",
          stages: [edgeDetection, postProccessStage, postProccessStage1],
          inputPreviousStageTexture: false,
          uniforms: edgeDetection.uniforms,
        });

        analysisCollection.add(postProccessStage);
      },
    };
    const data = reactive({
      isAnalysis: false,
    });
    onMounted(async () => {
      sunwayearth = useEarth();
      methods.startRendering();
    });
    onUnmounted(() => {
      methods.clearAnalysisRes();
    });
    return {};
  },
});
</script>