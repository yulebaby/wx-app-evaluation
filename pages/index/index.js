const app = getApp()
const Http = require('../../utils/request.js');
const getUserInfo = require('../../utils/getUserInfo.js');
const getAddress = require('../../utils/getAddress.js');
Page({
  data: {
    brandMsg:'',
    activeMsg:'',
    giftMsg:'',
    orJoin:'',

    orArea:'',
    cityCode:'',
    data:null,
    enroll_menb:false,
    photo_menb:false,
    topNum:0,
    enroll_tit:'',
    enroll_cont:'',
    toView: 0 ,               //跳转到指定位置
    chest_scroll: (wx.getSystemInfoSync().windowWidth / 375 / 2 ) * 1220 
  },
  onLoad: function (options) {
    // 记录分享人手机号并存到全局
    if (options.shareUserPhone){
      app.userInfo.shareUserPhone = options.shareUserPhone;
    }

    // 判断渠道来源（分为三种： app 、公众号 、搜索小程序）
    if (options.origin == 'app'){
      app.userInfo.phone = options.phone;
      app.userInfo.memberId = options.memberId;
      app.userInfo.origin = options.origin;
      this.initMsg();
    } else if (options.origin == 'gzh'){
      app.userInfo.origin = 'gzh';
      this.initMsg();
    } else{
      app.userInfo.origin = 'search';
      this.initMsg();
    }
  },
  onShow: function () {
    if (app.userInfo.orJoin){      
      this.setData({
        orJoin:true
      })
    }
  },
  /* ------------------- 初始化信息 ------------------- */
  initMsg(){
    wx.showLoading({ title: '加载中...', mask: true });
    getUserInfo.login(loginMsg => {
      if (!app.userInfo.phone) {
        app.userInfo.phone = loginMsg.userPhone;
      }
      this.getaddressIndex();
    })
  },
  /* ------------------- 获取用户地理位置信息 ------------------- */
  getaddressIndex() {
    let that = this;
    getAddress(address => {
      if (!address) {
        this.setData({ address_menb: true })
      } else {
        this.setData({ address_menb: false })
        app.userInfo.address = address;
        app.userInfo.city = address.address_component.city;
        app.userInfo.lng = address.location.lng;
        app.userInfo.lat = address.location.lat;
        if (app.userInfo.city.indexOf('北京') == -1 && app.userInfo.city.indexOf('上海') == -1 && app.userInfo.city.indexOf('天津') == -1 && app.userInfo.city.indexOf('沈阳') == -1){
          app.userInfo.orArea = 1;
          that.setData({
            orArea: 1
          })
          wx.showModal({
            title: '温馨提示',
            content: '您不在活动范围内',
            confirmColor: '#000',
            confirmText: '确定',
            showCancel: false,
          })
        }else{
          this.getBrandMsg()
          this.getUserMsg();
        }
      }
      wx.hideLoading();
    })
  },
  /* ------------------- 判断是否存在用户头像、昵称 ------------------- */
  getUserMsg(){
    let that = this;
    // 判断用户是否授权过
    wx.getUserInfo({
      success: function (res) {
        app.userInfo.userMsg = res.userInfo;
        that.setData({
          userMsg_menb: false,
        })
        that.orJoin();
        if (app.userInfo.origin == 'app'){
          that.bindPhone();
        }
      },
      fail:function(){
        that.setData({
          userMsg_menb: true
        })
      }
    })
  },
  /* ------------------- 授权 ------------------- */
  onGotUserInfo: function (e) {
    this.setData({
      userMsg_menb: false
    })
    app.userInfo.userMsg = e.detail.userInfo;
    if (app.userInfo.memberId) {
      this.bindPhone();
    }
    this.orJoin();
  },

  
  
  /* ------------------- 获取品牌信息 ------------------- */
  getBrandMsg(){
    let that = this;
    if (app.userInfo.city.indexOf('北京') != -1){
      this.setData({ cityCode:110100})
    } else if (app.userInfo.city.indexOf('上海') != -1){
      this.setData({ cityCode: 310100 })
    } else if (app.userInfo.city.indexOf('天津') != -1) {
      this.setData({ cityCode: 120100 })
    } else if (app.userInfo.city.indexOf('沈阳') != -1) {
      this.setData({ cityCode: 210100 })
    }else{
      this.setData({ cityCode: 110100 })
    }

    Http.post('/thanksGivingBrandAddress', { cityCode: that.data.cityCode, lng: app.userInfo.lng, lat: app.userInfo.lat }).then(res => {
      if(res.result == 0){
        if (res.data.openCity.indexOf(app.userInfo.city.slice(0,2)) == -1){
          if(app.userInfo.orArea !=1){
            app.userInfo.orArea = 1;
            that.setData({
              orArea: 1
            })
            wx.showModal({
              title: '温馨提示',
              content: '您不在活动范围内',
              confirmColor: '#000',
              confirmText: '确定',
              showCancel: false,
            })
          }
        }
        let dataMsg={
          openid: app.userInfo.openid,
          cityCode: that.data.cityCode,
          location1: res.data.brandAddress.storeList[0].name,
          location2: res.data.brandAddress.storeList[1].name,
          location3: res.data.brandAddress.storeList[2].name,
          location4: res.data.brandAddress.storeList[3].name,
          location5: res.data.brandAddress.storeList[4].name,
          source:app.userInfo.origin
        }
        that.setData({
          data: dataMsg
        })
        let cityStr='';
        for (var i = 0; i < res.data.openCity.length;i++){
          cityStr += res.data.openCity[i]+'、';
        }
        let screen_width = wx.getSystemInfoSync().windowWidth
        res.data.brandAddress.storeList[0].distance = (screen_width / 375 / 2 ) * 1986  ;
        res.data.brandAddress.storeList[1].distance = (screen_width / 375 / 2 ) * (1986+312) ;
        res.data.brandAddress.storeList[2].distance = (screen_width / 375 / 2) * (1986 + 312*2);
        res.data.brandAddress.storeList[3].distance = (screen_width / 375 / 2) * (1986 + 312*3);
        res.data.brandAddress.storeList[4].distance = (screen_width / 375 / 2) * (1986 + 312*4);
        that.setData({
          scroll_msg: res.data.brandAddress.storeList,
          brandMsg: res.data.brandAddress.storeList,
          activeMsg: res.data,
          activeCity: cityStr.substr(0, cityStr.length-1),
          giftMsg: res.data.brandAddress.gift.split('<br>')
        })
      }
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });   
  },
  /* -------------------会员自动绑定手机 -------------------*/
  bindPhone() {
    let that = this;
    Http.post('/thanksGivingBindWX', { memberId : app.userInfo.memberId,phone: app.userInfo.phone, userId: app.userInfo.openid, userName: app.userInfo.userMsg.nickName, headImages: app.userInfo.userMsg.avatarUrl }).then(res => {
      if (res.result == 0) {
        app.userInfo.userStatus = 1;
      }
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  /* ------------------- 用户是否参加过活动 ------------------- */
  orJoin() {
    let that = this;
    Http.post('/hasJoinedThanksGiving', { phone: app.userInfo.phone, userName: app.userInfo.userMsg.nickName, headImage: app.userInfo.userMsg.avatarUrl }).then(res => {
      that.setData({
        orJoin: res.data
      })
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  getTicket(){
    let that = this;
    if (app.userInfo.userStatus == 1){
      this.data.data.phone = app.userInfo.phone;
      if (app.userInfo.shareUserPhone){
        this.data.data.shareUserPhone = app.userInfo.shareUserPhone;
      }
      if (app.userInfo.memberId){
        this.data.data.memberId = app.userInfo.memberId;
        Http.post('/saveThanksGiving', this.data.data).then(res => {
          if (res.result == 0) {
            that.prompt('报名成功', '您好，您已报名成功，请确保手机通畅，稍后门店客服会联系您预约时间。')
            that.setData({ enroll_menb: true })
            
          } else if (res.result == -1) {
            that.prompt('提示', res.message)
            that.setData({ enroll_menb: true })
          } else if (res.result == 1) {
            that.prompt('提示', res.message)
            that.setData({ enroll_menb: true })
          }
          wx.hideLoading();
        }, _ => {
          wx.hideLoading();
        });
      }else{
        Http.post('/saveThanksGiving', this.data.data).then(res => {
          if (res.result == 0) {
            that.prompt('报名成功', '您好，您已报名成功，请确保手机通畅，稍后门店客服会联系您预约时间。')
            that.setData({ enroll_menb: true })
          } else if (res.result == -1) {
            that.prompt('提示', res.message)
            that.setData({ enroll_menb: true })
          } else if (res.result == 1){
            that.prompt('提示', res.message)
            that.setData({ enroll_menb: true })
          }
          wx.hideLoading();
        }, _ => {
          wx.hideLoading();
        });
      }
    }else{
      wx.navigateTo({
        url: '../base-msg/base-msg?way=get&data=' + JSON.stringify(this.data.data)
      })
    }
  },
  shareMsg(){
    if (app.userInfo.userStatus == 1){
      let path = 'pages/index/index?activityId=2&userPhone=' + app.userInfo.phone + '&choice=2';
      wx.navigateToMiniProgram({
        appId: 'wxce6688718ef525db', // 要跳转的小程序的appid
        path: path,                  // 跳转的目标页面
        extarData: {
          open: 'auth'
        },
        success(res) {
          // 打开成功  
        },
        fail(res) {
        }
      })
    }else{
      wx.navigateTo({
        url: '../base-msg/base-msg?way=share&data='+JSON.stringify(this.data.data)
      })
    }
  },
  saveImg(){
    let that = this;
    wx.getImageInfo({
      src: 'https://ylbb-wxapp.oss-cn-beijing.aliyuncs.com/activity/assessment-already-join-qr.jpg',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success(res) {
          },
          fail(error){
            if (error.errMsg == 'saveImageToPhotosAlbum:fail auth deny' || error.errMsg == 'saveImageToPhotosAlbum:fail:auth denied'){
              that.setData({ photo_menb :true})
            }
          }
        })
      }
    })
  },
  close_enroll_menb(){
    this.orJoin();
    this.setData({ enroll_menb: false })
  },
  prompt(enroll_tit, enroll_cont){
    this.setData({
      enroll_tit: enroll_tit,
      enroll_cont: enroll_cont
    })
  },
  returnTop(e){
    this.setData({
      toView: e.currentTarget.dataset.id
    })
  },
  // 手动打开定位，返回index页面后刷新定位
  openSetting(e) {
    let that = this;
    //that.getaddressIndex('0');
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    setTimeout(function(){
      if (!e.detail.authSetting['scope.userLocation']) {
        that.setData({ address_menb :true})
        // wx.showModal({
        //   title: '警告',
        //   content: '若不打开授权，则无法获取门店信息！',
        //   showCancel: false
        // })
      } else {
        that.setData({ address_menb: false })
        that.getaddressIndex();
      }
    },50)
  },
  // 手动打开保存相册
  openPhoto(e){
    let that = this;
    that.setData({ photo_menb: false })
    // setTimeout(function () {
    //   if (!e.detail.authSetting['scope.userLocation']) {
    //     that.setData({ photo_menb: true })
    //     wx.showModal({
    //       title: '警告',
    //       content: '若不打开授权，二维码则无法保存到本地相册！',
    //       showCancel: false
    //     })
    //   }else{
    //     that.setData({ photo_menb: false })
    //     that.saveImg();
    //   }
    // }, 50)
  }
})
