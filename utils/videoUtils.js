const app = getApp()

/**
 * 作品上传
 */
function uploadVideo() {
  var serverUrl = app.serverUrl
  var that = this
  wx.chooseVideo({
    sourceType: ['album'],
    success(res) {
      console.log(res)
      var duration = res.duration
      var height = res.height
      var width = res.width
      var size = res.size
      var tempFilePath = res.tempFilePath
      var thumbTempFilePath = res.thumbTempFilePath
      //20点几秒也是允许的
      if (duration > 20) {
        wx.showToast({
          title: '视频长度不能超过20秒',
          icon: "none",
          duration: 2500
        })
      } else if (duration < 1) {
        wx.showToast({
          title: '视频长度太短，请上传超过1秒的视频',
          icon: "none",
          duration: 2500
        })
      } else {
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            '&height=' + height +
            '&width=' + width +
            '&size=' + size +
            '&tempFilePath=' + tempFilePath +
            '&thumbTempFilePath=' + thumbTempFilePath,
        })
      }
    }
  })
}

module.exports = {
  uploadVideo: uploadVideo
}