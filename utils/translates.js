module.exports = {
  cross,
  trans,
  httpstrans,
}

// import { MD5 } from './tools'
const Tools = require('./tools')
const https = require('https')
// require('fast-text-encoding')
function trans(params, callback, to = 'zh', from = 'auto', node) {
  // console.log(from, to)
  httpstrans(params, from, to, node)
    .then(callback)
    .catch((error) => {
      console.error(error)
      this.$msg('statusCode: ' + error.statusCode + '  ' + error.statusMessage)
    })
}
function cross(url, deal = (d) => Tools.Uint8(d), method = 'GET', node) {
  const options = {
    path: url,
    method: method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 'Content-Length': data.length
    },
  }
  if (node) {
    options.hostname = 'api.fanyi.baidu.com'
  }
  return new Promise((resolve, reject) => {
    httpreq(
      options,
      (d) => {
        resolve(deal(d))
        console.log(deal(d))
      },
      reject
    )
  })
}
function httpstrans(query, from, to, node) {
  if (!query) return
  query = query.toString()
  query = query.replace(/#/g, '＃')
  const appid = '20210319000733704'
  const key = 'P6MLnbpUPi5IgHkRu79L'
  const salt = new Date().getTime()
  const q = encodeURI(query) // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  const str1 = appid + query + salt + key
  const sign = Tools.MD5(str1)
  const path =
    '/api/trans/vip/translate?q=' +
    q +
    '&from=' +
    from +
    '&to=' +
    to +
    '&appid=' +
    appid +
    '&salt=' +
    salt +
    '&sign=' +
    sign +
    '&action=' +
    1
  // var options = {
  //     path: path,
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //         // 'Content-Length': data.length
  //     }
  // }
  // return new Promise((resolve, reject) => {
  //     httpreq(options, d => {
  //         let res = dealtrans(d)
  //         resolve(res)
  //     }, reject)

  // })
  return cross(path, dealtrans, 'POST', node)
}
function httpreq(options, callback, reject) {
  const req = https.request(options, (res) => {
    if (res.statusCode != 200) {
      console.error(`CONNETCTION FAIL
url: ${options.path}
statusCode: ${res.statusCode}`)
      reject(res)
    }
    res.on('data', callback)
  })
  req.on('error', (error) => {
    console.error('error', error)
    reject(error)
  })
  req.end()
}
function dealtrans(d) {
  let baidu = Tools.Uint8(d)
  let translation = []
  if (baidu.trans_result) {
    baidu.trans_result.forEach((e) => {
      translation.push(aftertrans(e.dst))
    })
  } else if (baidu.error_code) {
    translation.push(Number(baidu.error_code))
    switch (baidu.error_code) {
      case '52000':
        translation.push('成功;')
        break
      case '52001':
        translation.push('请求超时; \n请重试')
        break
      case '52002':
        translation.push('系统错误; \n请重试')
        break
      case '52003':
        translation.push('未授权用户; \n请检查您的appid是否正确，或者服务是否开通')
        break
      case '54000':
        translation.push('必填参数为空; \n请检查是否少传参数')
        break
      case '54001':
        translation.push('签名错误; \n请检查您的签名生成方法')
        break
      case '54003':
        translation.push('请求过于频繁, 请稍后再试')
        break // '访问频率受限; \n请降低您的调用频率，或进行身份认证后切换为高级版/尊享版'); break;
      case '54004':
        translation.push('账户余额不足; \n请前往管理控制台为账户充值')
        break
      case '54005':
        translation.push('长query请求频繁; \n请降低长query的发送频率，3s后再试')
        break
      case '58000':
        translation.push(
          '客户端IP非法; \n检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改，可前往开发者信息-基本信息修改'
        )
        break
      case '58001':
        translation.push('译文语言方向不支持; \n请检查译文语言是否在语言列表里')
        break
      case '58002':
        translation.push('服务当前已关闭; \n请前往管理控制台开启服务')
        break
      case '90107':
        translation.push('认证未通过或未生效; \n请前往我的认证查看认证进度')
        break
      case '517':
        translation.push('未知错误')
        break
      default:
        translation.push(baidu.error_msg)
        console.log('新错误:', baidu.error_code)
        console.log(baidu.error_msg)
        break
    }
    translation.push('; \n' + baidu.error_msg)
  } else {
    translation.push(40000)
    translation.push(JSON.stringify(baidu))
    console.log(baidu)
    try {
      process.stdout.write(d)
    } catch (error) {}
  }
  return translation
}
function aftertrans(txt) {
  return txt
    .replace("'", '’')
    .replace('"', '“')
    .replace(/经销商/g, '品牌商')
}
