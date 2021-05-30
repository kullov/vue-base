<template>
  <div class="hello">
    <h1>{{msg}}</h1>
    Clicked: {{ $store.state.count }} times, count is {{ evenOrOdd }}.
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="incrementIfOdd">Increment if odd</button>
    <button @click="incrementAsync">Increment async</button>
    <h2>{{ usersDemo }}</h2>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      count: -1
    }
  },
  computed: {
    ...mapState("demo", ["usersDemo"]),
    ...mapGetters(['evenOrOdd'])
  },
  methods: {
    ...mapActions([
      'increment',
      'decrement',
      'incrementIfOdd',
      'incrementAsync'
    ]),
    getUserDemo() {
      const userDemo = this.$store.state.demo.usersDemo
      console.log(userDemo);
    }
  },
  mounted() {
    this.getUserDemo()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
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
</style>
