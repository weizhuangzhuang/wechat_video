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

    placeholder: "说点什么..."

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
          me.setData({
            publisher: res.data.data.publisher,
            userLikeVideo: res.data.data.userLikeVideo,
            serverUrl: serverUrl
          })
        }
      }),

      me.getCommentsList(1)
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

    //防止绕过验证直接访问后台
    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/userLogin',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  likeVideoOrNot: function() {
    var me = this
    var user = app.getGlobalUserInfo()

    //防止绕过验证直接访问后台
    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/userLogin',
      })
    } else {
      var userLikeVideo = me.data.userLikeVideo
      var videoInfo = me.data.videoInfo
      //debugger;
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId
      if (userLikeVideo) {
        var url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId
      }
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: app.serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function(res) {
          wx.hideLoading()
          me.setData({
            userLikeVideo: !userLikeVideo
          })
        }
      })
    }
  },

  //展示视频发布者的信息
  showPublisher: function() {
    var me = this
    var user = app.getGlobalUserInfo();

    //这个地方是传对象
    var videoInfo = me.data.videoInfo
    //？ = 会被过滤掉
    //var realUrl = "../videoInfo/videoInfo?videoStr=" + videoInfo
    var realUrl = "../mine/mine#publisherId@" + videoInfo.userId
    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/userLogin?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
  },

  shareMe: function() {
    var me = this
    var user = app.getGlobalUserInfo()
    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function(res) {
        //console.log(res.tapIndex)
        //下载
        wx.showLoading({
          title: '下载中',
        })
        if (res.tapIndex == 0) {
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                //console.log(res.tempFilePath)
                //保存视频到本地相册中
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success(res) {
                    console.log(res.errMsg)
                    wx.hideLoading()
                  }
                })
              }
            }
          })
          //举报用户
        } else if (res.tapIndex == 1) {

          var videoInfo = JSON.stringify(me.data.videoInfo)
          var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo
          if (user == null || user == undefined || user == "") {
            wx.navigateTo({
              url: '../userLogin/userLogin?redirectUrl=' + realUrl,
            })
          } else {
            var publisherId = me.data.videoInfo.userId
            var videoId = me.data.videoInfo.id
            var currentUserId = user.id
            //debugger
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + '&publisherId=' + publisherId,
            })
          }

        } else {
          wx.showToast({
            title: '官方暂未开放.....',
          })
        }
      }
    })
  },

  //分享页面信息
  onShareAppMessage: function(res) {

    var me = this;
    var videoInfo = me.data.videoInfo;

    return {
      title: '短视频内容分析',
      path: "pages/videoinfo/videoinfo?videoInfo=" + JSON.stringify(videoInfo)
    }
  },

  //点击评论按钮时评论输入框获取焦点
  leaveComment: function() {
    this.setData({
      commentFocus: true
    })
  },

  /**
   * 假设wzz留言，test回复留言
   * test用户点击留言框时触发事件replyFocus,会获取wzz留言的信息
   * 信息包括评论id，wzz的id，wzz的昵称
   * 
   * 这三条信息都会绑定到input框中去
   * placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,

      test用户在输入回复的内容之后触发saveComment事件，将评论信息发送到后台保存
      信息中额外包括了wzz的评论id及wzz的id
   */

  replyFocus: function(e) {
    //一定要是小写的fathercommentid
    //当前评论的id
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    //当前评论者id
    var toUserId = e.currentTarget.dataset.touserid;
    //当前评论者昵称
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },

  //发表评论,保存到后端
  saveComment: function(e) {
    var me = this
    var commentContent = e.detail.value
    //console.log(commentContent)

    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo()
    //验证是否登录
    var videoInfo = JSON.stringify(me.data.videoInfo)
    var realUrl = "/videoInfo/videoInfo#videoInfo@" + videoInfo
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/userLogin?redirectUrl' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        data: {
          videoId: me.data.videoInfo.id,
          fromUserId: user.id,
          comment: commentContent
        },
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function(res) {
          console.log(res.data)
          wx.hideLoading()
          me.setData({
            contentValue: '',
            commentsList: []
          })

          me.getCommentsList(1)
        }
      })
    }
  },

  //评论
  // commentsPage: 1,    当前页数
  // commentsTotalPage: 1,   总页数
  // commentsList: [],      评论列表
  //String videoId , Integer page , Integer pageSize   请求参数

  getCommentsList: function(page) {
    var me = this
    var serverUrl = app.serverUrl
    var user = app.getGlobalUserInfo()
    var videoId = me.data.videoInfo.id
    wx.showLoading({
      title: '加载评论中...',
    })
    var url = '/video/getVideoComments?videoId=' + videoId + '&page=' + page + '&pageSize=5'
    wx.request({
      url: serverUrl + url,
      method: 'POST',
      success: function(res) {
        console.log(res.data)
        var commentsList = res.data.data.rows
        wx.hideLoading()
        var newCommentsList = me.data.commentsList
        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        })
      }
    })
  },

  onReachBottom: function() {
    var me = this
    var currentPage = me.data.commentsPage
    var totalPage = me.data.commentsTotalPage
    if (currentPage == totalPage) {
      wx.showToast({
        title: '已无更多评论',
        icon: 'none'
      })
      return;
    }
    var page = currentPage + 1
    me.getCommentsList(page)
  }


})