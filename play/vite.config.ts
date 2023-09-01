import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// @ts-ignore
import DefineOptions from 'unplugin-vue-define-options/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
// import ReactivityTransform from '@vue-macros/reactivity-transform/vite'
export default defineConfig({
  plugins: [vue(), DefineOptions(), vueJsx()]
});
