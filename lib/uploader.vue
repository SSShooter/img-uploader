<template>
  <div id="vue-img-uploader">
    <input type="file"
      name="file"
      id="file"
      @change="getFile">
    <img class="vue-img-thumbnail"
      v-if="files.length>0"
      v-for="(img,index) in files"
      :key="img.name + index"
      v-gallery:vueImgUploader
      :src="img.src"
      :style="tbstyle">
    <label for="file">
      <slot name="addButton"></slot>
      <div class="default"
        v-if="!$slots.addButton">+</div>
    </label>
  </div>
</template>

<script>
import ImageCompressor from 'image-compressor.js'
export default {
  data() {
    return {
      files: []
    }
  },
  props: ['tbstyle'],
  mounted() {
    console.log(this.$slots)
    console.log(this.tbstyle)
  },
  methods: {
    async getFile(evt) {
      let file = evt.target.files[0]
      let fileName = file.name
      let compressData = await this.imgCompress(file)
      let dataURL = await this.getDataURL(compressData)
      this.files.push({ name: fileName, src: dataURL })
    },
    getDataURL(file) {
      return new Promise((res, rej) => {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = evt => res(evt.target.result)
        reader.onerror = err => rej(err)
      })
    },
    imgCompress(file, quality) {
      return new Promise((res, rej) => {
        new ImageCompressor(file, {
          quality: quality || 0.6,
          success(result) {
            res(result)
          },
          error(err) {
            rej(err)
          }
        })
      })
    }
  }
}
</script>

<style scoped>
#vue-img-uploader {
  display: flex;
  flex-wrap: wrap;
}
img {
  height: 100px;
  width: 100px;
  object-fit: cover;
  margin-right: 10px;
  margin-bottom: 10px;
}
label > .default {
  display: flex;
  justify-content:center;
  align-items: center;
  font-size: 25px;
  height: 100px;
  width: 100px;
  border: 1px solid #333;
}
input {
  position: absolute;
  top: -100px;
  left: 0;
}
</style>
