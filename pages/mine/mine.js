const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    faceUrl: "../resource/images/noneface.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    var user = app.getGlobalUserInfo()
    //console.log("-------")
    //console.log(user)
    var serverUrl = app.serverUrl
    wx.request({
      url: serverUrl + '/user/query?userId=' + user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data)
        wx.hideLoading()
        var data = res.data.data
        var faceUrl = "../resource/images/noneface.png"
        if (data.faceImage != null && data.faceImage != "" && data.faceImage != undefined) {
          faceUrl = serverUrl + data.faceImage
        }
        console.log(faceUrl)
        that.setData({
          faceUrl: faceUrl,
          nickname: data.nickname,
          fansCounts: data.fansCounts,
          followCounts: data.followCounts,
          receiveLikeCounts: data.receiveLikeCounts
        })
        var status = res.data.status
        if (status == 200) {
          wx.showToast({
            title: '登录成功',
            icon: 'none',
            duration: 2000
          })
        } else if (status == 500) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  /**
   * 作品上传
   */
  uploadVideo: function(e) {
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
  },
  /**
   * 上传图片
   */
  changeFace: function(res) {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        var serverUrl = app.serverUrl
        var user = app.getGlobalUserInfo()
        wx.showLoading({
          title: '上传中....',
        })
        wx.uploadFile({
          url: serverUrl + "/user/uploadFace?userId=" + user.id, //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          success(res) {
            console.log(res)
            console.log(res.data)
            const data = JSON.parse(res.data)
            console.log(data)
            wx.hideLoading()
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功',
                icon: "success"
              });
              that.setData({
                faceUrl: serverUrl + data.data
              })
            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg
              });
            }
          }
        })
      }
    })
  },
  /**
   * 页面注销
   */
  logout: function(e) {
    var user = app.getGlobalUserInfo()
    console.log(user)
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: serverUrl + "/logout?userId=" + user.id,
      method: "POST",
      success: function(res) {
        console.log(res.data)
        wx.hideLoading();
        if (res.data.status == 200) {
          //app.userInfo = null;
          //注销以后，清空缓存
          wx.removeStorageSync("userInfo")
          wx.redirectTo({
            url: '../userLogin/userLogin',
          })

        }
      }
    })
  }
})