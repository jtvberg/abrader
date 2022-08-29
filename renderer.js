const $ = require('jquery')
const { exec } = require('child_process')
let docList = []
let wordList = ['CI/CD', 'CD ', 'Jenkins', 'API', 'Container', 'Kubernetes', 'Docker', 'React', 'AWS ', 'GCP', 'Azure', 'DevOps', 'CDN']

$('body').on('dragover', false).on('drop', function(e) {
  e.preventDefault()
  if (e.originalEvent.dataTransfer.items) {
    [...e.originalEvent.dataTransfer.items].forEach((item, i) => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        exec(`unzip -p "${file.path}" word/document.xml`, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`)
            return
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`)
              return
          }
          if (docList.some(i => i.doc === file.name)) { return }
          $('#drop-file').append(`<div class="drop-item">${file.name}</div>`)
          $('.parsed-text').empty()
          $('.parsed-text').append(`<div>${stdout}</div>`)
          $('.parsed-text').html(`<div>${$('.parsed-text').text()}</div>`)
          docList.push(
            {
              doc: file.name,
              wordCount: countWords($('.parsed-text').text()),
              rawText: $('.parsed-text').text()
            }
          )
        })
      }
    })
  }
})

const countWords = (text) => {
  let wordCount = []
  $.each(wordList, (i, word) => {
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
  $('.doc-stats, .parsed-text').empty()
  $('.doc-stats').append(`<div class="stat-item">${entry.doc}</div>`)
  $.each(entry.wordCount, (i, word) => {
    $('.doc-stats').append(`<div class="stat-item" data-term="${word.word}">${word.word}: ${word.count}</div>`)
  })
  $('.parsed-text').html(`<div>${entry.rawText}</div>`)
}

const highlightTerm = (term) => {
  let mark = `<mark>${term}</mark>`
  let hl = $('.parsed-text').text().replace(new RegExp(term, 'gi'), mark)
  $('.parsed-text').html(hl)
}

$(document).on('click', '.drop-item', function () {
  displayStats(docList.find(i => i.doc === $(this).text()))
})

$(document).on('click', '.stat-item', function () {
  highlightTerm($(this).data('term'))
})