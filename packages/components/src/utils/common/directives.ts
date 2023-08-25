import { changeMapSize } from './domTool';
import { useEarth } from '../useEarth';

export default {
  vDrag: {
    // 指令的定义
    mounted(el: any) {
      let oDiv = el; // 获取当前元素
      let aDiv = el.parentElement.parentElement;
      oDiv.onmousedown = (e: any) => {
        if (el.dataset.dragable == 'false') return;
        // oDiv.style.cursor = "move"; // 鼠标样式
        // 算出鼠标相对元素的位置
        let disX = e.clientX - aDiv.offsetLeft;
        let disY = e.clientY - aDiv.offsetTop;
        document.onmousemove = (e) => {
          // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
          let left = e.clientX - disX;
          let top = e.clientY - disY;
          let parent = aDiv.parentElement;
          // 不让div超出父div窗口范围
          if (left < 0) {
            left = 0;
          } else if (left > parent.clientWidth - aDiv.offsetWidth) {
            left = parent.clientWidth - aDiv.offsetWidth;
          }
          // 上下不超出
          if (top < 0) {
            top = 0;
          } else if (top > parent.clientHeight - aDiv.offsetHeight) {
            top = parent.clientHeight - aDiv.offsetHeight;
          }

          aDiv.style.left = left + 'px';
          aDiv.style.top = top + 'px';
          aDiv.style.bottom = 'auto';
          aDiv.style.right = 'auto';
        };
        document.onmouseup = (e) => {
          // oDiv.style.cursor = "default";
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  },
  vResizeLeft: {
    mounted(el: any, id: any) {
      el.onmousedown = (e: PointerEvent) => {
        let box = document.getElementById(id.value);
        if (!box) return;
        let startX = e.clientX;
        let boxLeft = box.offsetLeft;
        let boxWidth = box.clientWidth;
        document.onmousemove = (em) => {
          if (!box) return;
          el.style.backgroundColor = 'white';
          let endX = em.clientX;
          let diffX = startX - endX;
          box.style.left = boxLeft - diffX + 'px';
          box.style.width = boxWidth + diffX + 'px';
        };
        document.onmouseup = (eu) => {
          el.style.backgroundColor = 'transparent';
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  },
  vResizeRight: {
    async mounted(el: any, id: any, dockMode?: any) {
      let earth: any;
      if (dockMode) {
        dockMode = dockMode.props['data-dockMode'];
        earth = useEarth();
      }

      el.onmousedown = (e: any) => {
        let box = document.getElementById(id.value);
        if (!box) return;
        let startX = e.clientX;
        let boxLeft = box.offsetLeft;
        let boxWidth = box.clientWidth;
        document.onmousemove = (em) => {
          if (!box) return;
          el.style.backgroundColor = 'white';
          let endX = em.clientX;
          let diffX = startX - endX;
          box.style.width = boxWidth - diffX + 'px';
          if (dockMode) {
            changeMapSize(earth, 'margin-left', `${boxWidth - diffX}px`);
            changeMapSize(earth, 'width', `calc(100% - ${boxWidth - diffX}px)`);
          }
        };
        document.onmouseup = (eu) => {
          el.style.backgroundColor = 'transparent';
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  },
  vResizeTop: {
    async mounted(el: any, id: any, dockMode?: any) {
      let earth: any;
      if (dockMode) {
        dockMode = dockMode.props['data-dockMode'];
        earth = useEarth();
      }
      el.onmousedown = (e: any) => {
        let box = document.getElementById(id.value);
        if (!box) return;
        let startY = e.clientY;
        let boxTop = box.offsetTop;
        let boxHeight = box.clientHeight;
        document.onmousemove = (em) => {
          if (!box) return;
          el.style.backgroundColor = 'white';
          let endY = em.clientY;
          let diffY = startY - endY;
          box.style.top = boxTop - diffY + 'px';
          box.style.height = boxHeight + diffY + 'px';
          if (dockMode) {
            changeMapSize(
              earth,
              'height',
              `calc(100% - ${boxHeight + diffY}px)`
            );
            // changeMapSize(earth, 'width', `calc(100% - ${boxWidth - diffX}px)`)
          }
          //
        };
        document.onmouseup = (eu) => {
          el.style.backgroundColor = 'transparent';
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  },
  vResizeBottom: {
    mounted(el: any, id: any) {
      el.onmousedown = (e: any) => {
        let box = document.getElementById(id.value);
        if (!box) return;

        let startY = e.clientY;
        // let boxLeft = box.offsetLeft;
        let boxHeight = box.clientHeight;
        document.onmousemove = (em) => {
          if (!box) return;
          el.style.backgroundColor = 'white';
          let endY = em.clientY;
          let diffY = startY - endY;
          // box.style.left = boxLeft - diffX + "px";
          box.style.height = boxHeight - diffY + 'px';
          //
        };
        document.onmouseup = (eu) => {
          el.style.backgroundColor = 'transparent';
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  },
  vResizeBottomLeft: {
    mounted(el: any, id: any) {
      el.onmousedown = (e: any) => {
        let box = document.getElementById(id.value);
        if (!box) return;

        let startX = e.clientX;
        let startY = e.clientY;
        let boxLeft = box.offsetLeft;
        let boxWidth = box.clientWidth;
        let boxHeight = box.clientHeight;
        document.onmousemove = (em) => {
          if (!box) return;
          el.style.backgroundColor = 'white';
          let endX = em.clientX;
          let endY = em.clientY;
          let diffX = startX - endX;
          let diffY = startY - endY;
          box.style.left = boxLeft - diffX + 'px';
          box.style.width = boxWidth + diffX + 'px';
          box.style.height = boxHeight - diffY + 'px';
          //
        };
        document.onmouseup = (eu) => {
          el.style.backgroundColor = 'transparent';
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  },
  vResizeBottomRight: {
    mounted(el: any, id: any) {
      el.onmousedown = (e: any) => {
        let box = document.getElementById(id.value);
        if (!box) return;

        let startX = e.clientX;
        let startY = e.clientY;
        let boxLeft = box.offsetLeft;
        let boxWidth = box.clientWidth;
        let boxHeight = box.clientHeight;
        document.onmousemove = (em) => {
          if (!box) return;
          el.style.backgroundColor = 'white';
          let endX = em.clientX;
          let endY = em.clientY;
          let diffX = startX - endX;
          let diffY = startY - endY;
          // box.style.left = boxLeft - diffX + "px";
          box.style.width = boxWidth - diffX + 'px';
          box.style.height = boxHeight - diffY + 'px';
          //
        };
        document.onmouseup = (eu) => {
          el.style.backgroundColor = 'transparent';
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  }
};
