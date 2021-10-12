<template>
  <canvas
    id="canvas"
    ref="select"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  ></canvas>
</template>

<script>
export default {
  name: "Selection",
  data() {
    return {
      selectionMode: false,
      startPosition: {
        x: null,
        y: null,
      },
      x: null,
      y: null
    };
  },
  computed: {
    // currentMouse() {
    //   var c = document.getElementById("canvas");
    //   var rect = c.getBoundingClientRect();

    //   return {
    //     x: this.mouse.current.x - rect.left,
    //     y: this.mouse.current.y - rect.top,
    //   };
    // },
  },
  methods: {
    // startSelect(e) {
    handleMouseDown(e) {
      this.selectionMode = true;
      // this.startPosition.x = e.clientX;
      // this.startPosition.y = e.clientY;


      var rect = canvas.getBoundingClientRect();
      this.startPosition.x = e.clientX;
      this.startPosition.y = e.clientY;
      this.x = e.clientX - rect.left;
      this.y = e.clientY - rect.top;
    },

    // drawRect(e) {
    handleMouseMove(e) {
      var ctx = this.$refs.select.getContext("2d");
      if (this.selectionMode) {
        var rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        // ctx.rect(
        //   this.startPosition.x,
        //   this.startPosition.y,
        //   e.clientX - this.startPosition.x,
        //   e.clientY - this.startPosition.y,
        // );


        // var canvasOffset = $("#canvas").offset();
        // var offsetX = canvasOffset.left;
        // var offsetY = canvasOffset.top;
        // var mouseX = parseInt(e.clientX - offsetX);
        // var mouseY = parseInt(e.clientY - offsetY);
        ctx.rect(
          this.startPosition.x,
          this.startPosition.y,
          e.clientX - this.x + rect.left,
          e.clientY - this.y + rect.top,
        );





        ctx.closePath();
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.strokeStyle = "#f00";
        ctx.stroke();
      }
    },

    // stopSelect(e) {
    handleMouseUp(e) {
      var ctx = this.$refs.select.getContext("2d");
      ctx.fillStyle = "#fff";
      console.log("x", this.startPosition.x + ", y", this.startPosition.y);
      this.selectionMode = false;
      this.startPosition.x = null;
      this.startPosition.y = null;
    },
  },
  mounted() {
    this.$refs.select.height = window.innerHeight;
    this.$refs.select.width = window.innerWidth;
    // this.ctx = this.$refs.select.getContext("2d");
  },
};
</script>

<style>
body {
  margin: 2rem;
  background: #eee;
}

#canvas {
  background-image: url('https://scontent.fhan14-2.fna.fbcdn.net/v/t1.6435-9/242251136_5196171577064500_8676253264315219982_n.jpg?_nc_cat=1&ccb=1-5&_nc_sid=730e14&_nc_ohc=-0e6JvfRHqkAX-1nGlM&tn=Zi0oSsAX7R-DUxcp&_nc_ht=scontent.fhan14-2.fna&oh=ff8b91237315a7f173a563e78a837905&oe=617838AF');
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.2);
}
</style>