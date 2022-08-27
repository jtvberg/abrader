const $ = require('jquery')
const { exec } = require('child_process')
let docList = []

$('body').on('dragover', false).on('drop', function(e) {
  e.preventDefault()
  $('.parsed-text').children().empty()
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
          docList.push(
            {
              doc: file.name,
              wordCount: countWords($('.parsed-text').text()),
              rawText: stdout
            }
          )
        })
      }
    })
  } else {
    [...e.originalEvent.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`)
    })
  }
})

const countWords = (text) => {
  let words = ['CI/CD', 'CD ', 'Jenkins', 'API', 'Container', 'Kuber', 'Docker', 'React', 'AWS ', 'GCP', 'Azure', 'DevOps', 'CDN']
  let wordCount = []
  $.each(words, (i, word) => {
    wordCount.push(
      {
        word: word.trim(), 
        count: countWord(text.toLowerCase(), word.toLowerCase())
      }
    )
  })
  return wordCount
}

const countWord = (text, word) => {
  return text.split(word).length - 1
}

const displayStats = (entry) => {
  console.log(docList)
  $('.doc-stats, .parsed-text').children().empty()
  $('.doc-stats').append(`<div class="stat-item">${entry.doc}</div>`)
  $.each(entry.wordCount, (i, word) => {
    $('.doc-stats').append(`<div class="stat-item">${word.word}: ${word.count}</div>`)
  })
  $('.parsed-text').append(`<div>${entry.rawText}</div>`)
}

$(document).on('click', '.drop-item', function () {
  displayStats(docList.find(i => i.doc === $(this).text()))
})