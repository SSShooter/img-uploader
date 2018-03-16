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
      files: [],
      formData: new FormData()
    }
  },
  props: {
    tbstyle: { type: Object },
    autoUpload: {
      type: Boolean,
      default: true
    }
  },
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
      if (this.autoUpload) {
        let formData = new FormData()
        formData.append('img', file, fileName)
        this.uploader('/', formData)
      } else {
        this.formData.append('img', file, fileName)
        this.$emit('update:formData', this.formData)
      }
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
    },
    uploader(url, data) {
      console.log(data)
      url =
        'http://his.noahhealthcare.com/upload/upload?uploadType=project&project=OS&category=CONSULT&recordNo=78'
      let connect = new XMLHttpRequest()
      connect.open('POST', url)
      /* You shouldNEVERset that header yourself. 
       * We set the header properly with the boundary. 
       * If you set that header, we won't and your server won't know what boundary to expect 
       * (since it is added to the header). 
       * Remove your custom Content-Type header and you'll be fine.
       * http://stackoverflow.com/questions/17415084/multipart-data-post-using-python-requests-no-multipart-boundary-was-found
       */
      // connect.setRequestHeader(
      //   'Content-type',
      //   'multipart/form-data'
      // )
      connect.onreadystatechange = function() {
        //Call a function when the state changes.
        if (
          connect.readyState == XMLHttpRequest.DONE &&
          connect.status == 200
        ) {
          // 请求结束后,在此处写处理代码
        }
      }
      connect.send(data)
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
  justify-content: center;
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
