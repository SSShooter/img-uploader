<template>
  <div id="vue-img-uploader">
    <input type="file"
      accept="image/*"
      :id="componentId"
      @change="getFile">
    <template v-if="files.length>0">
      <div class="vue-thumbnail-wrapper"
        v-for="(img,index) in files"
        :key="img.name + index">
        <div class="del-button"
          @click="deleteImg(img.name,index)">×</div>
        <img class="vue-img-thumbnail"
          v-gallery:vueImgUploader
          :data-index="index"
          :src="img.src"
          :style="tbstyle">
      </div>
    </template>
    <div class="loading"
      v-show="loading"
      :style="tbstyle">
      <div class="donut"></div>
    </div>
    <label :for="componentId"
      v-if="files.length<max && !loading">
      <slot name="addButton"></slot>
      <div class="default"
        v-if="!$slots.addButton">+</div>
    </label>
  </div>
</template>

<script>
require('formdata-polyfill')
import ImageCompressor from 'image-compressor.js'
export default {
  data() {
    return {
      files: [],
      formData: new FormData(),
      loading: false,
    }
  },
  props: {
    componentId:{
      type:String,
      default:'cid' + Math.floor(Math.random() * 10000),
      validator: function (value) {
        let hasNotWord = /\W/.test(value)
        return !hasNotWord
      }
    },
    initialImg: {
      type: Array,
      default: () => []
    },
    tbstyle: { type: Object },
    autoUpload: {
      type: Boolean,
      default: true
    },
    compressQuality: {
      type: Number,
      default: 0.6
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024
    },
    max: {
      type: Number,
      default: 9
    },
    uploadURL: {
      type: String
    }
  },
  mounted() {
    this.handleInitialImg()
  },
  watch: {
    initialImg(list) {
      this.handleInitialImg()
    }
  },
  methods: {
    async handleInitialImg() {
      if (this.initialImg.length > 0)
        for (let i = 0; this.initialImg.length > i; i++) {
          let url = this.initialImg[i]
          console.log(url)
          let blob = await this.url2BlobKai(url)
          console.log(blob)
          this.files.push({ name: `preset${i}`, src: url })
          if (this.autoUpload) {
            // 本来就上传了就不管了
          } else {
            this.formData.append(`preset${i}`, blob, `preset${i}`)
            this.$emit('update:formData', this.formData)
          }
        }
    },
    url2Blob(url) {
      return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest()
        xhr.responseType = 'blob'
        xhr.onload = function() {
          res(xhr.response)
        }
        xhr.open('GET', url)
        xhr.send()
      })
    },
    url2BlobKai(url) {
      return new Promise((res, rej) => {
        console.log('改！')
        var canvas = document.createElement('canvas')
        let img = new Image()
        img.setAttribute('crossOrigin', 'Anonymous')
        img.src = url
        img.onload = () => {
          // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
          canvas.width = img.width
          canvas.height = img.height
          canvas.getContext('2d').drawImage(img, 0, 0)
          canvas.toBlob(blob => {
            res(blob)
          })
        }
      })
    },
    async getFile(evt) {
      this.loading = true
      let file = evt.target.files[0]
      let fileName = file.name
      console.log(file)
      // 清除value下次才能选择相同图片
      document.querySelector(`#${this.componentId}`).value = null
      let compressData = await this.imgCompress(file) // 压缩后的图片
      let dataURL = await this.getDataURL(compressData) // 转换为dataURL
      // TODO 读入初始图片列表
      this.files.push({ name: fileName, src: dataURL })
      let index = this.files.length - 1
      if (this.autoUpload) {
        let formData = new FormData()
        formData.append('img', compressData, fileName)
        this.uploader(formData) // 即时上传
      } else {
        this.formData.append(fileName, compressData, fileName)
        this.$emit('update:formData', this.formData)
      }
      this.loading = false
    },
    deleteImg(name, index) {
      console.log(name, index)
      this.files.splice(index, 1)
      this.formData.delete(name)
      this.$emit('update:formData', this.formData)
    },
    getDataURL(file) {
      return new Promise((res, rej) => {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = evt => res(evt.target.result)
        reader.onerror = err => rej(err)
      })
    },
    imgCompress(file) {
      return new Promise((res, rej) => {
        new ImageCompressor(file, {
          quality: this.compressQuality,
          success(result) {
            res(result)
          },
          error(err) {
            rej(err)
          }
        })
      })
    },
    uploader(data) {
      console.log(data)
      let vm = this
      let connect = new XMLHttpRequest()
      connect.open('POST', this.uploadURL)
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
          vm.$emit('uploaded', connect.response)
        }
      }
      connect.send(data)
      connect.upload.addEventListener(
        'progress',
        function(event) {
          console.log(event.loaded, event.total)
        },
        false
      )
    }
  }
}
</script>

<style scoped>
#vue-img-uploader {
  display: flex;
  flex-wrap: wrap;
}

.vue-thumbnail-wrapper {
  position: relative;
  margin-right: 10px;
}

.del-button {
  position: absolute;
  margin: 5px;
  top: 0;
  right: 0;
  border-radius: 50%;
  background: #fff;
  height: 15px;
  width: 15px;
  line-height: 15px;
  text-align: center;
}

img {
  display: block;
  height: 100px;
  width: 100px;
  object-fit: cover;
}

.loading {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  height: 100px;
  width: 100px;
  margin-right: 10px;
}

@keyframes donut-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.donut {
  display: inline-block;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #888;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: donut-spin 1.2s linear infinite;
}

label > .default {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  height: 100px;
  width: 100px;
  border: 1px solid #333;
  color: #333;
}

input {
  position: absolute;
  top: -100px;
  left: 0;
}
</style>
