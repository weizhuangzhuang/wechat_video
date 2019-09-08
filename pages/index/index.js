const app = getApp()

Page({
  data: {

    //用于分页的属性
    totalPage: 1,
    page:1,
    videoList: [],

    screenWidth: 350,
    serverUrl: "",

    //搜索内容
    searchContent: ""
  },

  onLoad: function(params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    //获取在搜索框搜索的内容
    var searchContent = params.search
    //要保存到后台的搜索记录
    var isSaveRecord = params.isSaveRecord
    if (searchContent == null || searchContent == '' || searchContent == undefined) {
      searchContent = "";
    } 
    if(isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined){
      //0 - 不需要保存，或者为空的时候
      isSaveRecord = 0
    } 
    me.setData({
      searchContent : searchContent
    });

    var page = me.data.page
    me.getAllVideoList(page , isSaveRecord);

  },

  //抽取出的获取视频信息的方法
  getAllVideoList: function(page , isSaveRecord){
    var me = this;
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '请等待，加载中...',
    })

    var searchContent = me.data.searchContent;
    //console.log("get" + page)
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&isSaveRecord=' + isSaveRecord,
      method: 'POST',
      data: {
        videoDesc: searchContent
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading()
        //在当前页面隐藏导航条加载动画
        wx.hideNavigationBarLoading()
        //停止当前页面下拉刷新
        wx.stopPullDownRefresh()
        //console.log(res.data)

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
  this.getAllVideoList(1,0);
  
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
  me.getAllVideoList(page,0)
},

  //点击视频截图时携带参数跳转到视频详情页
  showVideoInfo: function(e){
    var me = this
    //视频列表
    var videoList = me.data.videoList
    //确定是哪一个视频
    var arrindex = e.target.dataset.arrindex
    var videoInfo = JSON.stringify(videoList[arrindex])
    //将视频信息传递到视频详情页(对象无法使用页面跳转到下一页面，必须转换为String)
    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo,
    })
  }

})