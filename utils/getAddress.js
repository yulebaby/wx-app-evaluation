/**
 * @function GetAddress
 * @param callBack<经纬度, 所在城市>
 * 
 * @export <GetAddress: function>
 * 
 * @author LD
 * @time 2018-10-12
 */
const app=getApp();


/* ------------------------- 获取地理位置 ------------------------- */
const GetAddress = (callback) => {
  /* --------- 如果app已经存储地址信息则直接返回 --------- */
  if (app.globalData.address) {
    callback(app.globalData.address)
  } else {

    /* --------- 获取用户经纬度, 成功存储并返回,失败则提示用户授权 --------- */
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res)
        GetCity({ lat: res.latitude, lon: res.longitude }).then(address => {
          app.globalData.address = address;
          callback(app.globalData.address)
        }).catch(err => {
          callback(null)
        })
      },
      fail(err) {
        callback(false)
        /* --------- 提示用户授权 --------- */
        // wx.showModal({
        //   title: '获取用户地址失败',
        //   content: '请在设置页允许获取所在地址',
        //   showCancel: false,
        //   success: function (res) {
        //     if (res.confirm) {
        //       // wx.openSetting({
        //       //   success(res) {
        //       //     wx.getLocation({
        //       //       type: 'wgs84',
        //       //       success() {
        //       //         /* --------- 通过经纬度获取到当前地址信息 --------- */
        //       //         GetCity({ lat: res.latitude, lon: res.longitude }).then(address => {
        //       //           app.globalData.address = address;
        //       //           callback(app.globalData.address)
        //       //         }).catch(err => {
        //       //           callback(null)
        //       //         })
        //       //       }
        //       //     })
        //       //   },
        //       //   complete(err) {
        //       //     /* --------- 用户未授权直接退出则再次提示用户授权 --------- */
        //       //     GetAddress(callback)
        //       //   }
        //       // })
        //     }
        //   }
        // })
      }
    })
  }
}

/* ------------------------- 获取所在城市 ------------------------- */
const Http = require('./request.js');
const GetCity = (obj) => {
  return new Promise((resolve, reject) => {
    Http.get('https://apis.map.qq.com/ws/geocoder/v1', {
      location: obj.lat + ',' + obj.lon,
      // location: '31.23' + ',' + '121.426498',
      
      key: 'VNIBZ-SC4KQ-HON5Z-GRGRT-EWZSV-QNFPU'
    }).then(res => {
      if (res.status == 0) {
        resolve(res.result)
      } else {
        reject('获取城市失败')
      }
    }).catch(err => {
      reject('获取城市失败')
    })
  })
}



module.exports = GetAddress;