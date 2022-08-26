const $ = require('jquery')

$('.drop-area').on('dragover', false).on('drop', function (e) {
  console.log('drop')
  console.log(e)
  return false
})