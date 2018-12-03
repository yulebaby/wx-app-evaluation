//app.js
App({
  // domain: 'http://192.168.1.33:8082/s',       //本地
  // domain: 'http://101.200.177.83:8007/s',       //83
  // domain: 'http://tnewmobile.beibeiyue.cn/s',    //线上测试
  domain:'https://newmobile.beibeiyue.com/s',     //线上
  // domain_testcode:'http://192.168.1.212:8888/s',  //验证码本地
  domain_testcode: 'https://fuli.beibeiyue.com/s', //验证码线上
  /* ------------- ------------- 全局数据存储 -------------------------- */
  globalData: {
    userOpenid: null,
    userLocation: null,
    userAddress: null
  },
  userInfo: {
    loginMsg: '',              //用户是否登录
    openid: '',               // 用户唯一标识
    memberId: null,            //会员id
    phone: null,               //绑定手机号
    address: null,             //地址信息
    city: null,                //当前城市
    lng: null,                 //当前经纬度
    lat: null,

    origin:null,               //渠道
    orArea:null,               //是否在活动城市或时间内
    userStatus: null,          //用户是否绑定过手机    0表示未绑定  1表示绑定 
    userMsg:null ,             //用户基本信息
    orJoin:null,               //用户是否参加过活动
    shareUserPhone:null        //分享人手机号

  },
  onLaunch() {
    
  }
})