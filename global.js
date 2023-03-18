'use strict'
;(function () {
  Error.stackTraceLimit = Infinity
  let $global, $module
  if (typeof window !== 'undefined') {
    $global = window
  } else if (typeof self !== 'undefined') {
    $global = self
  } else if (typeof global !== 'undefined') {
    $global = global
    $global.require = require
  } else {
    $global = this
  }
  if ($global === undefined || $global.Array === undefined) {
    throw new Error('no global object found')
  }
  if (typeof module !== 'undefined') {
    $module = module
  }
  require('./src/utils/gofmt')
  const fs = require('fs')
  const process = require('child_process')
  $global.cmd = function (
    clause,
    callback = (error, stdout, stderr) => {
      if (!error) {
        console.log(stdout, stderr)
      } else {
        console.log(error, stderr)
      }
    }
  ) {
    z(clause)
    process.exec(clause, { maxBuffer: 1024 * 5000 }, callback)
  }
  $global.z = console.log
  $global.file2string = function (file) {
    return fs.readFileSync(file).toString()
  }
  // fs.readFile(params, function (err, data) {
  //     if (err) {
  //         return console.error(err);
  //     }
  //     return("异步读取: " + data.toString());
  // });
  $global.string2file = function (file, txt) {
    let formatted = ''
    if (file.endsWith('.go')) {
      formatted = gofmt(txt)
      if (formatted.length > txt.length * 0.8) {
        txt = formatted
      }
    }
    fs.writeFile(file, txt, function (err) {
      if (err) {
        return console.error(err)
      }
      console.log(' - - -  ' + file + ' was saved!')
    })
  }
  $global.fileInsert = function (file, txt, where = '//node auto gen') {
    let reg = '/' + txt.slice(1, 25).escape()
    let origin = file2string(file)
    let already = origin.match(RegExp(eval(reg + '/')))
    console.log(reg)
    if (already) {
      console.log(' - - - did ' + file)
      string2file(file, origin.replace(eval(reg + '[sS]*' + where.escape() + '/'), txt + '\n' + where))
    } else {
      string2file(file, origin.replace(where, txt + '\n' + where))
    }
  }
  function fileReplace(file, oldText, txt) {
    let origin = file2string(file)
    string2file(file, origin.replace(toReg(oldText), txt + '\n'))
  }

  function toReg(txt) {
    return eval('/' + txt.escape() + '/')
  }
  // Object.defineProperty(String.prototype, 'escape', {
  //   value: function (param) {
  //     // your code …
  //     return 'counting distance between ' + this + ' and ' + param
  //   },
  // })
  String.prototype.escape = function () {
    return this.replace(/\n/g, '\\n')
      .replace(/\//g, '\\/')
      .replace(/\*/g, '\\*')
      .replace(/\./g, '\\.')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
  }
})()
function isvalid(e) {
  return e ? (isNaN(e) ? e.length : true) : false
}
function ifnull(notnul, ifnul) {
  if (typeof notnul === 'undefined') {
    return ifnul
  } else {
    return notnul
  }
}
