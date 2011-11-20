fs     = require 'fs'
path   = require 'path'
{exec} = require 'child_process'

libFiles  = [
  # omit src/ and .js to make the below lines a little shorter
  'header'
  'core'
  'webgl-constants'
  'command'
  'api'
  'canvas'
  'scene'
  'shader'
  'worker'
  'footer'
]

task 'build', "Concatenate source files into a single library file", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  # Concatenate files
  libContents = new Array remaining = libFiles.length
  for file, index in libFiles then do (file, index) ->
    fs.readFile "src/#{file}.js", 'utf8', (err, fileContents) ->
      throw err if err
      libContents[index] = fileContents
      process() if --remaining is 0
  # Translate concatenated file
  process = ->
    fs.writeFile 'dist/glquery.js', libContents.join('\n'), 'utf8', (err) ->
      throw err if err
      console.log "Done."

task 'fetch:npm', "Fetch the npm package manager", ->
  exec "curl http://npmjs.org/install.sh | sudo sh", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "Done."

task 'fetch:uglifyjs', "Fetch the UglifyJS minification tool", ->
  exec "npm install uglify-js", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "Done."

task 'minify', "Minify the resulting application file after build", ->
  path.exists 'node_modules/.bin/uglifyjs', (exists) ->
    if exists
      exec "node_modules/.bin/uglifyjs dist/glquery.js > dist/glquery.min.js", (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log "Done."
    else
      exec "uglifyjs dist/glquery.js > dist/glquery.min.js", (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log "Done."

task 'clean', "Cleanup all build files and distribution files", ->
  exec "rm -rf build;rm dist/glquery.js;rm dist/glquery.min.js", (err, stdout, stderr) ->
    console.log stdout + stderr
    console.log "Done."

