var videoUtil = require('../../utils/videoUtils.js')


const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    videoInfo: {},

    serverUrl: "",
    //记录视频发布者的信息
    publisher: {},
    //记录当前用户与该视频是否有喜欢的关系
    userLikeVideo: false,

    //评论
    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],

  },

  videoCtx: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(params) {
    var me = this
    var serverUrl = app.serverUrl
    //获取video组件
    me.videoCtx = wx.createVideoContext("myVideo", me)
    //获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo)

    //console.log(params)
    var videoHeight = videoInfo.videoHeight
    var videoWidth = videoInfo.videoWidth
    var cover = 'cover'
    if (videoWidth >= videoHeight) {
      //当视频的宽度大于等于视频的高度时不拉伸
      cover = ''
    }

    me.setData({
      videoId: videoInfo.id,
      src: serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      cover: cover
    });

    var user = app.getGlobalUserInfo()
    var loginUserId = ""
    if (user != null && user != '' && user != undefined) {
      loginUserId = user.id
    }
    wx.request({
      url: serverUrl + '/user/queryPubilsher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        //console.log(res.data)
        me.setData({
          publisher: res.data.data.publisher,
          userLikeVideo: res.data.data.userLikeVideo,
          serverUrl: serverUrl
        })
      }
    })
  },

  onShow: function() {
    var me = this
    me.videoCtx.play()
  },

  onHide: function() {
    var me = this
    me.videoCtx.pause()
  },

  //上传
  upload: function() {
    var me = this
    var user = app.getGlobalUserInfo();

    var videoInfo = JSON.stringify(me.data.videoInfo)
    //？ = 会被过滤掉
    //var realUrl = "../videoInfo/videoInfo?videoStr=" + videoInfo
    var realUrl = "../videoInfo/videoInfo#videoInfo@" + videoInfo
    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/userLogin?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo()
    }
  },

  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  showMine: function() {
    var user = app.getGlobalUserInfo();

    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/userLogin',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  }

})