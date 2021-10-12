<template>
  <div class="canvas-component">
    <canvas id="canvas2" width="400" height="400"> </canvas>
  </div>
</template>

<style lang="scss" scoped>
.canvas-component {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  #canvas2 {
    border: 1px solid #000;
  }
}
</style>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { useInit } from "@/services/shared/shared.service";

class Box2 {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;

  constructor(init?: Partial<Box2>) {
    this.x = 0;
    this.y = 0;
    this.w = 1; // default width and height?
    this.h = 1;
    this.fill = "#444444";
  }

  draw(
    context: any,
    extraData: {
      WIDTH: number;
      HEIGHT: number;
      gctx: any;
      mySel: any;
      mySelColor: string;
      mySelWidth: number;
      mySelBoxSize: number;
      mySelBoxColor: string;
      selectionHandles: { x: number; y: number }[];
    }
  ) {
    if (context === extraData.gctx) {
      context.fillStyle = "black"; // always want black for the ghost canvas
    } else {
      context.fillStyle = this.fill;
    }

    // We can skip the drawing of elements that have moved off the screen:
    if (this.x > extraData.WIDTH || this.y > extraData.HEIGHT) return;
    if (this.x + this.w < 0 || this.y + this.h < 0) return;

    context.fillRect(this.x, this.y, this.w, this.h);

    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (extraData.mySel === this) {
      context.strokeStyle = extraData.mySelColor;
      context.lineWidth = extraData.mySelWidth;
      context.strokeRect(this.x, this.y, this.w, this.h);

      // draw the boxes
      const half = extraData.mySelBoxSize / 2;

      // 0  1  2
      // 3     4
      // 5  6  7

      // top left, middle, right
      extraData.selectionHandles[0].x = this.x - half;
      extraData.selectionHandles[0].y = this.y - half;

      extraData.selectionHandles[1].x = this.x + this.w / 2 - half;
      extraData.selectionHandles[1].y = this.y - half;

      extraData.selectionHandles[2].x = this.x + this.w - half;
      extraData.selectionHandles[2].y = this.y - half;

      //middle left
      extraData.selectionHandles[3].x = this.x - half;
      extraData.selectionHandles[3].y = this.y + this.h / 2 - half;

      //middle right
      extraData.selectionHandles[4].x = this.x + this.w - half;
      extraData.selectionHandles[4].y = this.y + this.h / 2 - half;

      //bottom left, middle, right
      extraData.selectionHandles[6].x = this.x + this.w / 2 - half;
      extraData.selectionHandles[6].y = this.y + this.h - half;

      extraData.selectionHandles[5].x = this.x - half;
      extraData.selectionHandles[5].y = this.y + this.h - half;

      extraData.selectionHandles[7].x = this.x + this.w - half;
      extraData.selectionHandles[7].y = this.y + this.h - half;

      context.fillStyle = extraData.mySelBoxColor;
      for (let i = 0; i < 8; i++) {
        const cur = extraData.selectionHandles[i];
        context.fillRect(
          cur.x,
          cur.y,
          extraData.mySelBoxSize,
          extraData.mySelBoxSize
        );
      }
    }
  }
}

export default defineComponent({
  name: "CanvasComponent",
  components: {},
  emits: ["onSubmitData"],
  setup(props: any, { emit }: any) {
    // Setup Default
    const { base } = useInit();

    // Component reactive data
    const data = reactive({
      isLoading: false,
    });
    const boxes2: any[] = [];

    // New, holds the 8 tiny boxes that will be our selection handles
    // the selection handles will be in this order:
    // 0  1  2
    // 3     4
    // 5  6  7
    const selectionHandles: any[] = [];

    // Hold canvas information
    let canvas: any;
    let ctx: any;
    let WIDTH: any;
    let HEIGHT: any;
    const INTERVAL = 20; // how often, in milliseconds, we check to see if a redraw is needed

    let isDrag = false;
    let isResizeDrag = false;
    let expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
    let mx: number, my: number; // mouse coordinates

    // when set to true, the canvas will redraw everything
    // invalidate() just sets this to false right now
    // we want to call invalidate() whenever we make a change
    let canvasValid = false;

    // The node (if any) being selected.
    // If in the future we want to select multiple objects, this will get turned into an array
    let mySel: { x: number; y: number; w: number; h: number } | null = null;

    // The selection color and width. Right now we have a red selection with a small width
    const mySelColor = "#CC0000";
    const mySelWidth = 2; //grootte rode kader van sleep vierkant
    const mySelBoxColor = "darkred"; // New for selection boxes
    const mySelBoxSize = 6; //grootte handles van sleep vierkant

    // we use a fake canvas to draw individual shapes for selection testing
    let ghostcanvas;
    let gctx: CanvasRenderingContext2D | null; // fake canvas context

    // since we can drag from anywhere in a node
    // instead of just its x/y corner, we need to save
    // the offset of the mouse when we start dragging.
    let offsetx: number, offsety: number;

    // Padding and border style widths for mouse offsets
    let stylePaddingLeft: number,
      stylePaddingTop: number,
      styleBorderLeft: number,
      styleBorderTop: number;

    const invalidate = () => {
      canvasValid = false;
    };

    //Initialize a new Box, add it, and invalidate the canvas
    const addRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      fill: string
    ) => {
      const rect = new Box2();
      rect.x = x;
      rect.y = y;
      rect.w = w;
      rect.h = h;
      rect.fill = fill;
      boxes2.push(rect);
      invalidate();
    };

    //wipes the canvas context
    const clear = (c: any) => {
      c.clearRect(0, 0, WIDTH, HEIGHT);
    };

    // Sets mx,my to the mouse position relative to the canvas
    // unfortunately this can be tricky, we have to worry about padding and borders
    const getMouse = (e: any) => {
      let element = canvas,
        offsetX = 0,
        offsetY = 0;

      if (element.offsetParent) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
      }

      // Add padding and border style widths to offset
      offsetX += stylePaddingLeft;
      offsetY += stylePaddingTop;

      offsetX += styleBorderLeft;
      offsetY += styleBorderTop;

      mx = e.pageX - offsetX;
      my = e.pageY - offsetY;
    };

    // Main draw loop.
    // While draw is called as often as the INTERVAL variable demands,
    // It only ever does something if the canvas gets invalidated by our code
    const mainDraw = () => {
      if (canvasValid == false) {
        clear(ctx);
        // Add stuff you want drawn in the background all the time here
        // draw all boxes
        const l = boxes2.length;
        for (let i = 0; i < l; i++) {
          boxes2[i].draw(ctx, {
            WIDTH,
            HEIGHT,
            gctx,
            mySel,
            mySelColor,
            mySelWidth,
            mySelBoxSize,
            mySelBoxColor,
            selectionHandles,
          }); // we used to call drawshape, but now each box draws itself
        }
        // Add stuff you want drawn on top all the time here
        canvasValid = true;
      }
    };

    // Happens when the mouse is moving inside the canvas
    const myMove = (e: any) => {
      if (!mySel) {
        return;
      }
      if (isDrag) {
        getMouse(e);
        mySel.x = mx - offsetx;
        mySel.y = my - offsety;
        // something is changing position so we better invalidate the canvas!
        invalidate();
      } else if (isResizeDrag) {
        // time ro resize!
        const oldx = mySel.x;
        const oldy = mySel.y;

        // 0  1  2
        // 3     4
        // 5  6  7
        switch (expectResize) {
          case 0:
            mySel.x = mx;
            mySel.y = my;
            mySel.w += oldx - mx;
            mySel.h += oldy - my;
            break;
          case 1:
            mySel.y = my;
            mySel.h += oldy - my;
            break;
          case 2:
            mySel.y = my;
            mySel.w = mx - oldx;
            mySel.h += oldy - my;
            break;
          case 3:
            mySel.x = mx;
            mySel.w += oldx - mx;
            break;
          case 4:
            mySel.w = mx - oldx;
            break;
          case 5:
            mySel.x = mx;
            mySel.w += oldx - mx;
            mySel.h = my - oldy;
            break;
          case 6:
            mySel.h = my - oldy;
            break;
          case 7:
            mySel.w = mx - oldx;
            mySel.h = my - oldy;
            break;
        }
        invalidate();
      }

      getMouse(e);
      // if there's a selection see if we grabbed one of the selection handles
      if (mySel !== null && !isResizeDrag) {
        for (let i = 0; i < 8; i++) {
          // 0  1  2
          // 3     4
          // 5  6  7

          const cur = selectionHandles[i];

          // we dont need to use the ghost context because
          // selection handles will always be rectangles
          if (
            mx >= cur.x &&
            mx <= cur.x + mySelBoxSize &&
            my >= cur.y &&
            my <= cur.y + mySelBoxSize
          ) {
            // we found one!
            expectResize = i;
            invalidate();

            switch (i) {
              case 0:
                e.target.style.cursor = "nw-resize";
                break;
              case 1:
                e.target.style.cursor = "n-resize";
                break;
              case 2:
                e.target.style.cursor = "ne-resize";
                break;
              case 3:
                e.target.style.cursor = "w-resize";
                break;
              case 4:
                e.target.style.cursor = "e-resize";
                break;
              case 5:
                e.target.style.cursor = "sw-resize";
                break;
              case 6:
                e.target.style.cursor = "s-resize";
                break;
              case 7:
                e.target.style.cursor = "se-resize";
                break;
            }
            return;
          }
        }
        // not over a selection box, return to normal
        isResizeDrag = false;
        expectResize = -1;
        e.target.style.cursor = "auto";
      }
    };

    // Happens when the mouse is clicked in the canvas
    const myDown = (e: any) => {
      getMouse(e);
      //we are over a selection box
      if (expectResize !== -1) {
        isResizeDrag = true;
        return;
      }
      clear(gctx);
      const l = boxes2.length;
      for (let i = l - 1; i >= 0; i--) {
        // draw shape onto ghost context
        boxes2[i].draw(gctx, {
          WIDTH,
          HEIGHT,
          gctx,
          mySel,
          mySelColor,
          mySelWidth,
          mySelBoxSize,
          mySelBoxColor,
          selectionHandles,
        });

        // get image data at the mouse x,y pixel
        if (gctx) {
          const imageData = gctx.getImageData(mx, my, 1, 1);
          const index = (mx + my * imageData.width) * 4;
          // if the mouse pixel exists, select and break
          if (imageData.data[3] > 0) {
            mySel = boxes2[i];
            if (mySel) {
              offsetx = mx - mySel.x;
              offsety = my - mySel.y;
              mySel.x = mx - offsetx;
              mySel.y = my - offsety;
              isDrag = true;

              invalidate();
              clear(gctx);
              return;
            }
          }
        }
      }
      // havent returned means we have selected nothing
      mySel = null;
      // clear the ghost canvas for next time
      clear(gctx);
      // invalidate because we might need the selection border to disappear
      invalidate();
    };

    const myUp = () => {
      isDrag = false;
      isResizeDrag = false;
      expectResize = -1;
    };

    // adds a new node
    const myDblClick = (e: any) => {
      getMouse(e);
      // for this method width and height determine the starting X and Y, too.
      // so I left them as vars in case someone wanted to make them args for something and copy this code
      const width = 20; //grootte van nieuwe vierkant waneer klikt
      const height = 20;
      addRect(
        mx - width / 2,
        my - height / 2,
        width,
        height,
        "rgba(220,205,65,0.7)"
      );
    };

    //
    onMounted(() => {
      canvas = document.getElementById("canvas2");
      HEIGHT = canvas.height;
      WIDTH = canvas.width;
      ctx = canvas.getContext("2d");
      ghostcanvas = document.createElement("canvas");
      ghostcanvas.height = HEIGHT;
      ghostcanvas.width = WIDTH;
      gctx = ghostcanvas.getContext("2d");

      //fixes a problem where double clicking causes text to get selected on the canvas
      canvas.onselectstart = function () {
        return false;
      };

      // fixes mouse co-ordinate problems when there's a border or padding
      // see getMouse for more detail
      if (document.defaultView && document.defaultView.getComputedStyle) {
        stylePaddingLeft =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)["paddingLeft"],
            10
          ) || 0;
        stylePaddingTop =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)["paddingTop"],
            10
          ) || 0;
        styleBorderLeft =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)[
              "borderLeftWidth"
            ],
            10
          ) || 0;
        styleBorderTop =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)[
              "borderTopWidth"
            ],
            10
          ) || 0;
      }

      // make mainDraw() fire every INTERVAL milliseconds
      setInterval(mainDraw, INTERVAL);

      // set our events. Up and down are for dragging,
      // double click is for making new boxes
      canvas.onmousedown = myDown;
      canvas.onmouseup = myUp;
      canvas.ondblclick = myDblClick;
      canvas.onmousemove = myMove;

      // set up the selection handle boxes
      for (let i = 0; i < 8; i++) {
        const rect = new Box2();
        selectionHandles.push(rect);
      }

      // add custom initialization here:

      // add a large green rectangle
      addRect(260, 70, 60, 65, "rgba(0,205,0,0.7)");

      // add a green-blue rectangle
      addRect(240, 120, 40, 40, "rgba(2,165,165,0.7)");

      // add a smaller purple rectangle
      addRect(45, 60, 25, 25, "rgba(150,150,250,0.7)");
    });

    return {
      // Data
      data,
      // Function
    };
  },
});
</script>
