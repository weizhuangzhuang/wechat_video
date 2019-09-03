const app = getApp()

Page({
  data: {
    bgmList: null,
    serverUrl: "",
    videoParams: {}
  },

  onLoad: function(params) {
    var that = this
    console.log(params)
    //数据绑定，便于在其他的方法里面获取
    that.setData({
      videoParams: params
    })
    wx.showLoading({
      title: '请等待。。。',
    })
    var that = this
    var serverUrl = app.serverUrl
    wx.request({
      url: serverUrl + "/bgm/list",
      method: "GET",
      success: function(res) {
        var bgmList = res.data.data
        console.log(bgmList)
        wx.hideLoading()
        if (res.data.status == 200) {
          that.setData({
            bgmList: bgmList,
            serverUrl: serverUrl
          })
        }
      }
    })
  },

  upload: function(e) {
    var serverUrl = app.serverUrl
    var videoParams = this.data.videoParams
    var duration = videoParams.duration
    var height = videoParams.height
    var width = videoParams.width
    var size = videoParams.size
    var tempFilePath = videoParams.tempFilePath
    //实际上传视频时这个值为null，等待修复
    //var thumbTempFilePath = videoParams.thumbTempFilePath
    var bgmId = e.detail.value.bgmId
    var desc = e.detail.value.desc
    var that = this
    var userInfo = app.getGlobalUserInfo()
    console.log(e.detail.value)
    wx.showLoading({
      title: '上传中....',
    })
    wx.uploadFile({
      url: serverUrl + "/video/uploadVideo", //仅为示例，非真实的接口地址
      formData: {
        userId: userInfo.id,   //fixme 原来的 app.userInfo.id
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: height,
        videoWidth: width
      },
      filePath: tempFilePath,
      name: 'file',
      success(res) {
        console.log(res)
        console.log(res.data)
        const data = JSON.parse(res.data)
        console.log(data)
        wx.hideLoading()
        if (data.status == 200) {
          wx.showToast({
            title: '上传成功！',
            icon: "success"
          });
            wx.navigateBack({
              delta: 1
            })
          // //上传封面
          // wx.uploadFile({
          //   url: serverUrl + "/video/uploadCover", //仅为示例，非真实的接口地址
          //   formData: {
          //     userId: app.userInfo.id,
          //     videoId: data.data
          //   },
          //   filePath: thumbTempFilePath,
          //   name: 'file',
          //   success: function(res) {
          //     var data = JSON.parse(res.data)
          //     if (data.status == 200) {
          //       wx.showToast({
          //         title: '上传成功！',
          //         icon: "success"
          //       });
          //       wx.navigateBack({
          //         //返回到上一个页面
          //         delta: 1,
          //       })
          //     } else if (data.status == 500) {
          //       wx.showToast({
          //         title: data.msg
          //       });
          //     }
          //   }
          // })

        } else if (data.status == 500) {
          wx.showToast({
            title: data.msg
          });
        }
      }
    })
  }
})