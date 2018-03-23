<template>
  <div id="vue-img-uploader">
    <template v-if="files.length>0">
      <div class="vue-thumbnail-wrapper"
        v-for="(img,index) in files"
        :key="img.name + index">
        <div class="del-button"
          @click="deleteImg(img.name,index)">×</div>
        <img class="vue-img-thumbnail"
          v-gallery:group
          :src="img.src"
          :style="tbstyle">
      </div>
    </template>
    <div class="loading"
      v-show="loading"
      :style="tbstyle">
      <div class="donut"></div>
    </div>
    <label v-if="files.length<max && !loading"
      @click="getFile">
      <slot name="addButton"></slot>
      <div class="default"
        v-if="!$slots.addButton">+</div>
    </label>
  </div>
</template>

<script>
// 不能运行，仅提供思路
require('formdata-polyfill')
import ImageCompressor from 'image-compressor.js'
export default {
  data() {
    return {
      files: [], // 展示用列表
      formData: new FormData(), // 上传用列表
      loading: false
    }
  },
  props: {
    componentId: {
      type: String,
      default: 'cid' + Math.floor(Math.random() * 10000),
      validator: function(value) {
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
      default: 5
    },
    uploadURL: {
      type: String
    }
  },
  mounted() {
    this.$store.dispatch('Wechat', window.location.href.split('#')[0])
    this.handleInitialImg()
  },
  watch: {
    initialImg() {
      this.handleInitialImg()
    }
  },
  methods: {
    async handleInitialImg() {
      if (this.initialImg.length > 0)
        for (let i = 0; this.initialImg.length > i; i++) {
          let url = this.initialImg[i]
          let blob = await this.url2Blob(url)
          // 加入展示列表
          this.files.push({ name: `preset${i}`, src: url })
          if (this.autoUpload) {
            // 本来就上传了所以就不管了
          } else {
            // 加入上传列表
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
    dataURItoBlob(dataURI) {// 重点
      var byteString = atob(dataURI.split(',')[1])
      var mimeString = dataURI
        .split(',')[0]
        .split(':')[1]
        .split(';')[0]
      var ab = new ArrayBuffer(byteString.length)
      var ia = new Uint8Array(ab)
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: mimeString })
    },
    getURL(localId) {
      return new Promise((resolve, rej) => {
        let vm = this
        vm.$wechat.getLocalImgData({
          localId: localId,
          success: function(res) {
            var localData = res.localData // localData是图片的base64数据，可以用img标签显示
            // 重点
            if (window.__wxjs_is_wkwebview) {
              // 如果是IOS，需要去掉前缀
              localData = localData.replace('jgp', 'jpeg')
            } else {
              localData = 'data:image/jpeg;base64,' + localData
            }
            var blob = vm.dataURItoBlob(localData)
            // 新增图片加入上传列表
            vm.formData.append(localId, blob)
            vm.$emit('update:formData', vm.formData)
            resolve()
          }
        })
      })
    },
    getFile() {
      let vm = this
      vm.$wechat.chooseImage({
        count: 5,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: async function(res) {
          var localIds = res.localIds // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          console.log(localIds)
          // 新增图片加入展示列表
          for (let i = 0; i < localIds.length; i++) {
            await vm.getURL(localIds[i])
            vm.files.push({ name: localIds[i], src: localIds[i] })
          }
        }
      })
    },
    deleteImg(name, index) {
      this.files.splice(index, 1)
      this.formData.delete(name)
      this.$emit('update:formData', this.formData)
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
