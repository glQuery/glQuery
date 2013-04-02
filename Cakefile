fs     = require 'fs'
path   = require 'path'
{exec} = require 'child_process'

# Constants
masterVersion = '2.0'

# omit src/ and .js to make the below lines a little shorter
baseLibFiles = [
  'header'
  'core'
  'webgl-constants'
  'update'
]

libFiles = 
  '1.0': baseLibFiles.concat [
    'refresh'
    'tag'
    'state'
    'command'
    'api'
    'scene'
    'shader'
    'footer']
  '1.1': baseLibFiles.concat [
    'refresh'
    'tag'
    'state'
    'command'
    'api'
    'scene'
    'shader'
    'footer']
  '2.0': baseLibFiles.concat [
    'core-2.0'
    'refresh'
    'tag'
    'state'
    'command'
    'api'
    'canvas'
    'scene'
    'shader'
    'contextevents'
    'worker'
    'footer']
  '2.0-lite': baseLibFiles.concat [
    'canvas'
    'contextevents'
    'footer']

concatSrcFiles = (files, callback) ->
  contents = new Array files.length
  remaining = files.length
  for file, index in files then do (file, index) ->
    fs.readFile "src/#{file}.js", 'utf8', (err, fileContents) ->
      throw err if err
      contents[index] = fileContents
      (callback contents) if --remaining is 0 and callback?

task 'build', "Concatenate source files into a single library file", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  # Translate concatenated file
  output = (version) -> (contents) ->
    distFileName = "dist/glquery-#{version}.js"
    fs.writeFile distFileName, (contents.join '\n'), 'utf8', (err) ->
      throw err if err
      console.log "...Done(#{distFileName})"
      if version == masterVersion
        ((fs.createReadStream distFileName).pipe fs.createWriteStream 'dist/glquery.js').on "close", ->
          console.log "...Done(dist/glquery.js)"
          return
      return
    return
  # Concatenate files
  for version, files of libFiles
    concatSrcFiles files, output version
  return

task 'fetch:npm', "Fetch the npm package manager", ->
  exec "curl http://npmjs.org/install.sh | sudo sh", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "...Done(fetch npm package manager)"

task 'fetch:uglifyjs', "Fetch the UglifyJS minification tool", ->
  exec "npm install uglify-js", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "...Done(fetch UglifyJS)"

task 'fetch:extra-modules', "Fetch additional glquery modules that are useful", ->
  fileNames = [
    'glquery.math.module.js', 
    'glquery.math.module.min.js']
  repoUrl = 'https://github.com/glQuery/glQuery-math/raw/master/dist'
  wgetCommand = ""
  for fileName in fileNames
    wgetCommand += "wget -q -O dist/extra/#{fileName} #{repoUrl}/#{fileName};"
  exec wgetCommand, (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "...Done(fetch extra modules)"

task 'minify', "Minify the resulting application file after build", ->
  path.exists 'node_modules/.bin/uglifyjs', (exists) ->
    if exists
      exec "node_modules/.bin/uglifyjs dist/glquery.js --comments /publicdomain/ > dist/glquery.min.js", (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log "...Done(minify)"
    else
      exec "uglifyjs dist/glquery.js > dist/glquery.min.js", (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log "...Done(minify)"

task 'clean', "Cleanup all build files and distribution files", ->
  exec "rm -rf build;rm dist/glquery.js;rm dist/glquery.min.js", (err, stdout, stderr) ->
    console.log stdout + stderr
    console.log "...Done(clean)"

