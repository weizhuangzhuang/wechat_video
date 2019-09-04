//app.js
App({
  serverUrl: "http://192.168.1.10:8081",
  //serverUrl: "http://192.168.31.125:8081",
  userInfo: null,

  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user)
  },

  getGlobalUserInfo: function() {
    return wx.getStorageSync("userInfo")
  }

})