const $ = require('jquery')
const { exec } = require('child_process')

$('#drop-file').on('dragover', false).on('drop', function(e) {
  e.preventDefault()
  if (e.originalEvent.dataTransfer.items) {
    [...e.originalEvent.dataTransfer.items].forEach((item, i) => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        $('#drop-file').append(`<div class="drop-item">${file.name}</div>`)
        exec(`unzip -p ${file.path} word/document.xml`, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`)
            return
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`)
              return
          }
          $('.parsed-text').append(`<div>${stdout}</div>`)
          countWords()
        })
      }
    })
  } else {
    [...e.originalEvent.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`)
    })
  }
})

const countWords = () => {
  let words = ['CI/CD', 'Jenkins', 'API', 'Container', 'Kuber', 'Docker', 'React', 'AWS ', 'GCP', 'Azure', 'DevOps']
  $.each(words, (i, word) => {
    $('#drop-file').append(`<div class="drop-item">${word}: ${countWord($('.parsed-text').text().toLowerCase(), word.toLowerCase())}</div>`)
  })
}

const countWord = (text, word) => {
  return text.split(word).length - 1
}