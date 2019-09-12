const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    faceUrl: "../resource/images/noneface.png",
    publisherId: '',
    //判断是否是本人
    isMe: true,
    isFollow: false,


    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(params) {
    var that = this
    var user = app.getGlobalUserInfo()
    var userId = user.id
    if (params.publisherId != null && params.publisherId != '' && params.publisherId != undefined && params.publisherId != userId) {
      userId = params.publisherId;
      that.setData({
        publisherId: params.publisherId,
        isMe: false
      })
    }
    var serverUrl = app.serverUrl
    wx.request({
        url: serverUrl + '/user/query?userId=' + userId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function(res) {
          //console.log(res.data)
          wx.hideLoading()
          if (res.data.status == 200) {
            var data = res.data.data
            var faceUrl = "../resource/images/noneface.png"
            if (data.faceImage != null && data.faceImage != "" && data.faceImage != undefined) {
              faceUrl = serverUrl + data.faceImage
            }
            //console.log(faceUrl)
            that.setData({
              faceUrl: faceUrl,
              nickname: data.nickname,
              fansCounts: data.fansCounts,
              followCounts: data.followCounts,
              receiveLikeCounts: data.receiveLikeCounts
            })
          } else if (res.data.status == 502) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000,
              success: function() {
                wx.redirectTo({
                  url: '../userLogin/userLogin',
                })
              }
            })
          }
        }
      }),

      that.getMyVideoList(1)
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
        //console.log(tempFilePaths)
        var serverUrl = app.serverUrl
        var user = app.getGlobalUserInfo()
        wx.showLoading({
          title: '上传中....',
        })
        wx.uploadFile({
          url: serverUrl + "/user/uploadFace?userId=" + user.id, //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json', // 默认值
            'userId': user.id,
            'userToken': user.userToken
          },
          success(res) {
            //console.log(res)
            //console.log(res.data)
            const data = JSON.parse(res.data)
            //console.log(data)
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

  followMe: function(e) {
    var me = this

    var user = app.getGlobalUserInfo()
    var userId = user.id
    var publisherId = me.data.publisherId

    var followType = e.currentTarget.dataset.followtype

    var url = ''
    //1: 关注 0：取消关注
    if (followType == '1') {
      url = app.serverUrl + '/user/beyourfans?userId=' + publisherId + '&fanId=' + userId
    } else {
      url = app.serverUrl + '/user/dontbeyourfans?userId=' + publisherId + '&fanId=' + userId
    }
    wx.showLoading()
    wx.request({
      url: url,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading()
        if (followType == '1') {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          })
        } else {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          })
        }
      }
    })
  },

  /**
   * 页面注销
   */
  logout: function(e) {
    var user = app.getGlobalUserInfo()
    //console.log(user)
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: serverUrl + "/logout?userId=" + user.id,
      method: "POST",
      success: function(res) {
        //console.log(res.data)
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
  },

  doSelectWork: function() {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyVideoList(1);
  },

  doSelectLike: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyLikesList(1);
  },

  doSelectFollow: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyFollowList(1)
  },

  getMyVideoList: function(page) {
    var me = this
    var user = app.getGlobalUserInfo()
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&pageSize=6',
      method: 'POST',
      data: {
        userId: user.id
      },
      success: function(res) {
        var myVideoList = res.data.data.rows
        wx.hideLoading()
        var newVideoList = me.data.myVideoList
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: serverUrl
        })
      }
    })
  },

  getMyLikesList: function(page) {
    var me = this
    var user = app.getGlobalUserInfo()
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: serverUrl + '/video/showMyLike?userId=' + user.id + '&page=' + page + '&pageSize=6',
      method: 'POST',
      success: function(res) {
        var likeVideoList = res.data.data.rows
        wx.hideLoading()
        var newVideoList = me.data.likeVideoList
        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: serverUrl
        })
      }
    })
  },

  getMyFollowList: function(page) {
    var me = this
    var user = app.getGlobalUserInfo()
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: serverUrl + '/video/showMyFollow?userId=' + user.id + '&page=' + page + '&pageSize=6',
      method: 'POST',
      success: function(res) {
        var followVideoList = res.data.data.rows
        wx.hideLoading()
        var newVideoList = me.data.followVideoList
        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: serverUrl
        })
      }
    })
  },

  // 点击跳转到视频详情页面
  showVideo: function(e) {

    console.log(e);

    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    //debugger;

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })

  },

  // 到底部后触发加载
  onReachBottom: function() {
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.myLikesTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    } else if (!myFollowFalg) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }

  }
})