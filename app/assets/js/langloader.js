const fs = require('fs-extra')
const isDev = require('./isdev')
const path = require('path')
const toml = require('toml')
const merge = require('lodash.merge')

const defaultLang = "en_US"
let config = null
let lang

/**
 * Languages are now a resource
 * this detects the environment of the launcher (if it's dev, if it's a MacOS release or a Windows/Ubuntu release) and applies the directory in any case
 * this aims to fix the releases because before it only worked in the dev environment, it works on Windows but still needs testing on MacOS and Ubuntu
 * 
 * sorry for this shtty code LMAO
 */

exports.loadLanguage = function(id){
    if(isDev){
        lang = merge(lang || {}, toml.parse(fs.readFileSync(path.join(process.cwd(), 'lang', `${id}.toml`))) || {})
    } else {
        if(process.platform === 'darwin'){
            lang = merge(lang || {}, toml.parse(fs.readFileSync(path.join(appPath, 'Contents', 'Resources', 'lang', `${id}.toml`))) || {})
    } else {
        lang = merge(lang || {}, toml.parse(fs.readFileSync(path.join(process.cwd(), 'resources', 'lang', `${id}.toml`))) || {})
}
}
}

exports.query = function(id, placeHolders){
    let query = id.split('.')
    let res = lang
    for(let q of query){
        res = res[q]
    }
    let text = res === lang ? '' : res
    if (placeHolders) {
        Object.entries(placeHolders).forEach(([key, value]) => {
            text = text.replace(`{${key}}`, value)
        })
    }
    return text
}

exports.queryJS = function(id, placeHolders){
    return exports.query(`js.${id}`, placeHolders)
}

exports.queryEJS = function(id, placeHolders){
    return exports.query(`ejs.${id}`, placeHolders)
}

function getLang(dir) {
    // ! Yuck, this is sketchy
    if(dir){
        try{
            config = JSON.parse(fs.readFileSync(dir, 'UTF-8'))
            if(config.settings.launcher.language == undefined) {
                config.settings.launcher.language = defaultLang
            }
            return config.settings.launcher.language
        } catch (err){
            return defaultLang
        }
    }
}

exports.setupLanguage = function(dir){
    // Load Language Files and check for conflict with CM
    slectedLang = getLang(dir)
    if(slectedLang) {
        console.log(slectedLang)
        exports.loadLanguage(slectedLang)
        // Load Custom Language File for Launcher Customizer
        exports.loadLanguage('_custom')
    }
}