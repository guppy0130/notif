<template>
  <HelloWorld :msg="msg"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data: () => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.has('msg') ? params.get('msg') : 'missing message?';
    console.log(msg);
    return {
      msg
    }
  }
}
</script>

<style lang="scss">
@import 'styles.scss';

body {
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  width: 100vw;
}
</style>
