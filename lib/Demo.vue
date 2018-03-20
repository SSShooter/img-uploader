<template>
  <div id="demo">
    <Uploader :formData.sync="formData" :autoUpload="false" />
  </div>
</template>

<script>
import Uploader from './uploader'
export default {
  name: 'Demo',
  components: { Uploader },
  data() {
    return { formData:'' }
  },
  watch:{
    formData(val){console.log(val)}
  }
}
</script>

<style>
#demo {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 30px;
}
</style>
