'use strict';

const util = require('./util');

const convertArrayLikeObj = function(obj) {
  const keys = Object.keys(obj)
  keys.forEach(key => {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key].length >= 0) {
      if (obj[key].length === 0) {
        obj[key] = []
      } else {
        const arr = []
        Object.values(obj[key]).forEach(val => {
          if (typeof val === 'object') {
            if (Array.isArray(val)) {
              arr.push(...val)
            } else {
              arr.push(val)
            }
          }
        })
        obj[key] = arr
      }
    }
    if (obj[key] && typeof obj[key] === "object") convertArrayLikeObj(obj[key])
  })
}

const convertKeys = function(obj) {
  const keys = Object.keys(obj)
  keys.forEach(key => {
    if (key === 'raw') {
      obj[key] = obj[key].toString()
    } else if (obj[key] === 'null') {
      obj[key] = null
    }
    if (obj[key] && typeof obj[key] === "object") convertKeys(obj[key])
  })
}

const convertToJson = function(node, options) {
  const jObj = {};

  //when no child node or attr is present
  if ((!node.child || util.isEmptyObject(node.child)) && (!node.attrsMap || util.isEmptyObject(node.attrsMap))) {
    return util.isExist(node.val) ? node.val : '';
  } else {
    //otherwise create a textnode if node has some text
    if (util.isExist(node.val)) {
      if (!(typeof node.val === 'string' && (node.val === '' || node.val === options.cdataPositionChar))) {
        if(options.arrayMode === "strict"){
          jObj[options.textNodeName] = [ node.val ];
        }else{
          jObj[options.textNodeName] = node.val;
        }
      }
    }
  }

  util.merge(jObj, node.attrsMap, options.arrayMode);

  const keys = Object.keys(node.child);
  for (let index = 0; index < keys.length; index++) {
    var tagname = keys[index];
    if (node.child[tagname] && node.child[tagname].length > 1) {
      jObj[tagname] = [];
      for (var tag in node.child[tagname]) {
        jObj[tagname].push(convertToJson(node.child[tagname][tag], options));
      }
    } else {
      if(options.arrayMode === true){
        const result = convertToJson(node.child[tagname][0], options)
        if(typeof result === 'object')
          jObj[tagname] = [ result ];
        else
          jObj[tagname] = result;
      }else if(options.arrayMode === "strict"){
        jObj[tagname] = [convertToJson(node.child[tagname][0], options) ];
      }else{
        jObj[tagname] = convertToJson(node.child[tagname][0], options);
      }
    }
  }

  //add value
  convertArrayLikeObj(jObj)
  convertKeys(jObj)
  return jObj
};

exports.convertToJson = convertToJson;
