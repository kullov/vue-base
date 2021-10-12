<template>
  <div>
    <v-stage
      ref="stage"
      id="stage"
      :config="stageSize"
      @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown"
      @contextmenu="rightClickStage"
    >
      <v-layer ref="layer">
        <v-image
          :config="{
            image: image,
          }"
        />
        <v-rect
          id="rect"
          v-for="item in rectangles"
          :key="item.id"
          :config="item"
          @transformend="handleTransformEnd"
          @contextmenu="rightClickRect"
        />
        <v-label
          :config="{ x: 20, y: 20, opacity: 1 }"
          v-if="btnDeleteVisible"
          @click="removeLabel"
          >Delete</v-label
        >

        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
    <button
      id="menu"
      v-show="btnDeleteVisible"
      @click="removeLabel"
    >
      Delete
    </button>
  </div>
</template>

<script>
import "jquery";
export default {
  name: "Test",
  data() {
    return {
      stageSize: {
        stroke: "black",
        strokeWidth: 4,
        drawBorder: true,
      },
      rectangles: [],
      selectedShapeName: "",
      image: null,
      btnDeleteVisible: false,
    };
  },
  computed: {
    currentRect() {
      const rect = this.rectangles.find(
        (r) => r.name === this.selectedShapeName
      );
      return rect;
    },
    
  },
  mounted() {
    const image = new window.Image();
    image.src = "https://konvajs.org/assets/yoda.jpg";
    image.onload = () => {
      // set image only when it is loaded
      this.image = image;
    };
    this.stageSize.width = image.width;
    this.stageSize.height = image.height;
  },
  methods: {
    removeLabel() {
      this.rectangles = [];
      this.btnDeleteVisible = false;
      this.selectedShapeName = "";
      this.updateTransformer();
    },
    rightClickStage(e) {
      // prevent default behavior
      e.evt.preventDefault();
    },
    rightClickRect(e) {
      if (e.evt.button === 2) {
        this.btnDeleteVisible = true;
      }
      const stage = e.target.getStage();
      if (e.target === stage) {
        // if we are on empty place of the stage we will do nothing
        return;
      }
      // const currentShape = e.target;
      let menuNode = document.getElementById('menu');
      // show menu
      menuNode.style.display = 'initial';
      menuNode.style.position = 'absolute';
      var containerRect = stage.container().getBoundingClientRect();
      menuNode.style.top =
        containerRect.top + stage.getPointerPosition().y + 5 + 'px';
      menuNode.style.left =
        containerRect.left + stage.getPointerPosition().x + 5 + 'px';
    },
    handleTransformEnd(e) {
      // shape is transformed, let us save new attrs back to the node
      // find element in our state
      const rect = this.currentRect;
      console.log(rect);
      // update the state
      rect.x = e.target.x();
      rect.y = e.target.y();
      rect.rotation = e.target.rotation();
      rect.scaleX = e.target.scaleX();
      rect.scaleY = e.target.scaleY();
      // change radius
      rect.radius = 5;
      // console.log(rect);
    },
    handleStageMouseDown(e) {
      if (this.rectangles.length === 0) {
        this.rectangles = [
          {
            rotation: 0,
            // x: 80,
            // y: 59,
            x: e.evt.offsetX,
            y: e.evt.offsetY,
            width: 40,
            height: 40,
            scaleX: 1,
            scaleY: 1,
            name: "rect",
            draggable: true,
            opacity: 1,
            stroke: "red",
            strokeWidth: 0.5,
          },
        ];
      }
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = "";
        this.updateTransformer();
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      let name = e.target.name();
      const rect = this.rectangles.find((r) => r.name === name);
      if (rect) {
        this.selectedShapeName = name;
        const container = document.getElementById("stage");
        // make it focusable
        container.tabIndex = 1;
        // focus it
        // also stage will be in focus on its click
        const el = this;
        container.addEventListener("keydown", (e) => {
          if (e.key === "Delete" && name) {
            el.removeLabel();
            name = "";
          }
          e.preventDefault();
        });
      } else {
        this.selectedShapeName = "";
        this.btnDeleteVisible = false;
        this.configText = {};
      }
      this.updateTransformer();
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      const transformerNode = this.$refs.transformer.getNode();
      const stage = transformerNode.getStage();
      const { selectedShapeName } = this;
      const selectedNode = stage.findOne("." + selectedShapeName);
      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
        return;
      }

      if (selectedNode) {
        // attach to another node
        transformerNode.nodes([selectedNode]);
      } else {
        // remove transformer
        transformerNode.nodes([]);
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
*:focus {
  border: none !important;
}
*:focus-visible {
  outline: none;
}
</style>
