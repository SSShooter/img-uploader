<template>
  <div id="demo">
    manual upload (data storage in formData)
    <div class="uploader-wrapper">
      <Uploader :formData.sync="formData1"
        :autoUpload="false" />
    </div>
    manual upload with initial images
    <div class="uploader-wrapper">
      <Uploader :formData.sync="formData2"
        :autoUpload="false"
        :initialImg="initialImg" />
    </div>
    auto upload 
    <div class="uploader-wrapper">
      <Uploader :formData.sync="formData3"
        :autoUpload="true"
        uploadURL="http://his.noahhealthcare.com/upload/upload?uploadType=project&project=OS&category=CONSULT&recordNo=78"
        @uploaded="handleUploaded" />
    </div>

  </div>
</template>

<script>
import Uploader from './uploader'
export default {
  name: 'Demo',
  components: { Uploader },
  data() {
    return {
      initialImg: ['https://avatars2.githubusercontent.com/u/541152?v=4','http://122.13.3.33:8083/uploads/OS/CONSULT/2/1c7ef992f97047b1892486aa17c71173.jpg'],
      formData1: '',
      formData2: '',
      formData3: '',
      urlList: []
    }
  },
  methods: {
    handleUploaded(res) {
      console.log(res)
    }
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
