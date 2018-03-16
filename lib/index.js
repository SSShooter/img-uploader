let uploader = {
  install(Vue, option) {
    Vue.directive('test', {
      bind() {
        console.log('绑上了')
      }
    })
  }
}

export default uploader
