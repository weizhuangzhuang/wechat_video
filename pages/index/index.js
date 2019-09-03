const app = getApp()

Page({
  data: {

    //用于分页的属性
    totalPage: 1,
    page:1,
    videoList: [],

    screenWidth: 350,
    serverUrl: ""
  },

  onLoad: function(params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    wx.showLoading({
      title: '请等待，加载中...',
    })

    var page = me.data.page
    me.getAllVideoList(page);

  },

  //抽取出的获取视频信息的方法
  getAllVideoList: function(page){
    var me = this;
    var serverUrl = app.serverUrl
    //console.log("get" + page)
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading()
        //在当前页面隐藏导航条加载动画
        wx.hideNavigationBarLoading()
        //停止当前页面下拉刷新
        wx.stopPullDownRefresh()
        console.log(res.data)

        // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page === 1) {
          me.setData({
            videoList: []
          })
        }

        var data = res.data.data
        var newVideoList = me.data.videoList;

        me.setData({
          totalPage: data.total,
          page: page,
          videoList: newVideoList.concat(data.rows),
          serverUrl: serverUrl
        })
      }
    })
  },

//下拉刷新
onPullDownRefresh: function () {
  wx.showNavigationBarLoading()
  this.getAllVideoList(1);
  
},

//上拉刷新
onReachBottom: function(){
  var me = this
  //当前页
  var currentPage = me.data.page
  if(currentPage === me.data.totalPage){
    wx.showToast({
      title: '已经没有更多的视频了~~',
      icon: 'none'
    })
    return;
  }

  var page = currentPage + 1;
  //console.log(page)
  me.getAllVideoList(page)

}

})