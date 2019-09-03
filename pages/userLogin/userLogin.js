const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  doLogin : function(e){
    var that = this
    var formObject = e.detail.value
    var username = formObject.username
    var password = formObject.password

    //简单验证
    if(username.length == 0 || password.length == 0){
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
      }else{
      var serverUrl = app.serverUrl
      wx.showLoading({
        title: '加载中.....',
      })
        wx.request({
          url: serverUrl + '/login',
          data: {
            username : username,
            password : password
          },
          method : 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success : function(res){
            wx.hideLoading()
            var status = res.data.status
            if(status == 200){
              wx.showToast({
                title: '登录成功',
                icon: 'none',
                duration: 2000
              })

              //app.userInfo = res.data.data
              //fixme 修改原有的全局对象为本地缓存
              app.setGlobalUserInfo(res.data.data)
              wx.redirectTo({
                url: '../mine/mine',
              })
            }else if(status == 500){
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    }
  
})