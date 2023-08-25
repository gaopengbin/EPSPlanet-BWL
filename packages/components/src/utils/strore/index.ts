import { defineStore } from 'pinia';

export const useStore = defineStore({
  id: 'main',
  state: () => ({
    earth: new Map()
  }),
  // getters: {
  //     doubleCount: (state) => state.count * 2,
  // },
  actions: {
    setEarth(id: string, earth: any) {
      this.earth.set(id, earth);
    },
    getEarth(id?: string) {
      if (!id) return this.earth.values().next().value;
      return this.earth.get(id);
    },
    getEarthList() {
      return this.earth;
    }
  }
});
