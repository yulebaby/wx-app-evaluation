const app = getApp()
const Http = require('../../utils/request.js');
const Util = require('../../utils/util.js');
Page({
  data: {
    way:'',
    nameValue: '',
    phoneValue:'',
    testCodeValue:'',
    nameError: '',
    ageError: '',
    phoneError:'',
    testCodeError:'',
    enroll_tit:'',
    enroll_cont:'',

    date: '宝宝生日',
    dateEnd: Util.formatTime(new Date).split(' ')[0],

    countdown:60,
    testCodeText:'获取验证码',
    sendTestCodeDisabled:false,
    data:null,
    enroll_menb: false
  },
  onLoad: function (options) {
    this.setData({
      way : options.way,
      data: JSON.parse(options.data)
    });
  },
  nameInput: function (e) {
    var nameTest = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$/;
    this.setData({
      nameValue: e.detail.value
    })
    if (this.data.nameValue && !nameTest.test(this.data.nameValue)) {
      this.errorPrompt('昵称为1-10个数字、中文或英文', '', '')
    }else{
      this.errorPrompt(' ', '', '')
    }
  },
  phoneInput: function (e) {
    var phoneTest = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/;
    this.setData({
      phoneValue: e.detail.value
    })
    if (this.data.phoneValue && !phoneTest.test(this.data.phoneValue)) {
      this.errorPrompt('', '', '请填写正确的手机号')
    } else {
      this.errorPrompt(' ', ' ', ' ')
    }
  },
  testCodeInput: function (e) {
    this.setData({
      testCodeValue: e.detail.value
    })
  },
  /*生日选择器*/
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  /*发送手机验证码*/
  getTestCode(){
    let that = this;
    var nameTest = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$/;
    var phoneTest = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/;
    if (!this.data.nameValue) {
      this.errorPrompt('昵称不能为空', '', '')
    } else if (!nameTest.test(this.data.nameValue)) {
      this.errorPrompt('昵称为1-10个数字、中文或英文', '', '')
    } else if (this.data.date && this.data.date == '宝宝生日') {
      this.errorPrompt('', '请选择宝宝的生日', '')
    } else if (!this.data.phoneValue) {
      this.errorPrompt('', '', '手机号不能为空')
    } else if (!phoneTest.test(this.data.phoneValue)) {
      this.errorPrompt('', '', '请填写正确的手机号')
    }else{
      this.errorPrompt('', '', '');
      if (this.data.sendTestCodeDisabled){

      }else{
        this.setData({
          sendTestCodeDisabled: true,
        })
        Http.post('https://fuli.beibeiyue.com/s/sendVerification', { mobilePhone: that.data.phoneValue }).then(res => {
          if (res.result == 0) {
            this.settime();
          }else if(res.result == 2){
            this.setData({
              sendTestCodeDisabled: false,
            })
            this.errorPrompt('', '', res.message)
          }else{
            this.setData({
              sendTestCodeDisabled: false,
            })
          }
          wx.hideLoading();
        }, _ => {
          wx.hideLoading();
        });
      }
    }
    
  },
  settime() {
    let that = this;
    if(this.data.countdown == 0) {
      this.setData({ 
        sendTestCodeDisabled: false,
        testCodeText:"获取验证码"
      })
      this.data.countdown = 60;
    } else {
      this.setData({
        sendTestCodeDisabled: true,
        testCodeText: this.data.countdown + 's'
      })
      this.data.countdown--;
      setTimeout(function () {
        that.settime()
      }, 1000)
    }
	},

  /*提交宝宝信息*/
  submitBabyMsg(){
    let that = this;
    var nameTest = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,10}$/;
    var phoneTest = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/;
    if (!this.data.nameValue) {
      this.errorPrompt('昵称不能为空', '', '')
    } else if (!nameTest.test(this.data.nameValue)) {
      this.errorPrompt('昵称为1-10个数字、中文或英文', '', '')
    } else if (this.data.date && this.data.date == '宝宝生日') {
      this.errorPrompt('', '请选择宝宝的生日', '')
    } else if (!this.data.phoneValue) {
      this.errorPrompt('', '', '手机号不能为空')
    } else if (!phoneTest.test(this.data.phoneValue)) {
      this.errorPrompt('', '', '请填写正确的手机号')
    } else if (!this.data.testCodeValue){
      this.errorPrompt('', '', '','验证码不能为空')
    }else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      this.errorPrompt('', '', '');
      /*校验验证码*/
      Http.post('https://fuli.beibeiyue.com/s/checkVerification', { mobilePhone: that.data.phoneValue, verification: that.data.testCodeValue}).then(res => {
        if(res.result == 0){
          that.bindPhone();
        }else if(res.result == 2){
          this.errorPrompt('', '', '', res.message)
        }
        wx.hideLoading();
      }, _ => {
        wx.hideLoading();
      });
    }
  },
  /*绑定手机*/
  bindPhone(){
    let that = this;
    Http.post('/thanksGivingBindWX', { phone: that.data.phoneValue, userId: app.userInfo.openid, userName: app.userInfo.userMsg.nickName, headImages: app.userInfo.userMsg.avatarUrl, nickName: that.data.nameValue, birthday: that.data.date}).then(res => {
      if(res.result == 0){
        app.userInfo.phone = that.data.phoneValue;
        if(that.data.way == 'share'){
          app.userInfo.userStatus = 1;
          wx.navigateBack({})
        } else if (that.data.way == 'get'){
          that.submitEnroll();
        }
      }else{
        that.errorPrompt('', res.message, '')
      }
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  /*报名*/
  submitEnroll(){
    let that = this;
    this.data.data.phone = that.data.phoneValue;
    if (app.userInfo.shareUserPhone){
      this.data.data.shareUserPhone = app.userInfo.shareUserPhone;
    }
    Http.post('/saveThanksGiving', that.data.data).then(res => {
      if (res.result == 0) {
        app.userInfo.userStatus = 1;
        app.userInfo.orJoin = true;
        this.errorPrompt('', '', '', '', '报名成功', '您好，您已报名成功，请确保手机通畅，稍后门店客服会联系您预约时间。')
        that.setData({ enroll_menb: true })
      } else if (res.result == -1) {
        this.errorPrompt('', '', '', '', '提示', res.message)
        that.setData({ enroll_menb: true })
      } else if (res.result == 1) {
        this.errorPrompt('', '', '', '', '提示', res.message)
        that.setData({ enroll_menb: true })
      }
      
      wx.hideLoading();
    }, _ => {
      wx.hideLoading();
    });
  },
  errorPrompt(nameError, ageError, phoneError, testCodeError, enroll_tit, enroll_cont) {
    if (nameError){
      this.setData({
        nameError: nameError,
      })
    }
    if (ageError) {
      this.setData({
        ageError: ageError,
      })
    }
    if (phoneError) {
      this.setData({
        phoneError: phoneError,
      })
    }
    if (testCodeError) {
      this.setData({
        testCodeError: testCodeError,
      })
    }
    if (enroll_tit) {
      this.setData({
        enroll_tit: enroll_tit,
      })
    }
    if (enroll_cont) {
      this.setData({
        enroll_cont: enroll_cont,
      })
    }

    // this.setData({
    //   nameError: nameError,
    //   ageError: ageError,
    //   phoneError: phoneError,
    //   testCodeError: testCodeError,
    //   enroll_tit: enroll_tit,
    //   enroll_cont: enroll_cont
    // })
  },
  close_enroll_menb() {
    wx.navigateBack({})
  },

})