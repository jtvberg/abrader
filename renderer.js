const { ipcRenderer } = require('electron')
const $ = require('jquery')
const { exec } = require('child_process')

let docList = []
let wordList = ['CI/CD', 'CD ', 'Jenkins', 'API', 'Container', 'Kubernetes', 'Docker', 'React', 'AWS ', 'Amazon', 'GCP', 'Azure', 'DevOps', 'CDN']

$('body').on('dragover', false).on('drop', function(e) {
  e.preventDefault()
  if (e.originalEvent.dataTransfer.items) {
    [...e.originalEvent.dataTransfer.items].forEach((item, i) => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (docList.some(i => i.doc === file.name)) { return }
        $('#drop-file').append(`<div class="drop-item">${file.name}</div>`)
        if (file.type === 'application/pdf') {
          ipcRenderer.send('parse-pdf', { path: file.path, name: file.name })
          return
        }
        exec(`unzip -p "${file.path}" word/document.xml`, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`)
            return
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`)
              return
          }
          addDoc(file.name, stdout)
        })
      }
    })
  }
})

// IPC channel for return of parsed pdf text
ipcRenderer.on('json-pdf', (e, data) => {
  addDoc(data.name, data.text)
})

/**
 * Funtion that adds documents to document list
 * @param {string} name File name
 * @param {string} text Raw text to store
 */
const addDoc = (name, text) => {
  $('.parsed-text').empty()
  $('.parsed-text').append(`<div>${text}</div>`)
  $('.parsed-text').html(`<div>${$('.parsed-text').text()}</div>`)
  docList.push(
    {
      doc: name,
      wordCount: countWords($('.parsed-text').text()),
      rawText: $('.parsed-text').text()
    }
  )
  displayStats(docList.find(i => i.doc === name))
}

/**
 * Function that iterates on search terms and stores results
 * @param {string} text Raw text to index
 * @return {object[]} Word counts
 */
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

/**
 * Function that returns the count a specifed term
 * @param {string} text Raw text to search
 * @param {string} word Word from search term list (wordList) to count
 * @return {number} Word count
 */
const countWord = (text, word) => {
  return text.split(word).length - 1
}

/**
 * Function that displays the stats of a selected document
 * @param {string} entry Item from Document List (docList) to look up and display
 */
const displayStats = (entry) => {
  $('.doc-stats, .parsed-text').empty()
  $('.doc-stats').append(`<div class="doc-focus">${entry.doc}</div>`)
  $.each(entry.wordCount, (i, word) => {
    $('.doc-stats').append(`<div class="stat-item" data-term="${word.word}">${word.word}</div>`)
    $('.doc-stats').append(`<div class="stat-bar" style="width: ${word.count * 10}px" data-term="${word.word}">${word.count}</div>`)
  })
  $('.parsed-text').html(`<div>${entry.rawText}</div>`)
}

/**
 * Function that highlights a selected term in the raw text
 * @param {string} term String to highlight in the raw doc
 */
const highlightTerm = (term) => {
  let mark = `<mark>${term}</mark>`
  let hl = $('.parsed-text').text().replace(new RegExp(term, 'gi'), mark)
  $('.parsed-text').html(hl)
}

// Display doc stats on doc list item click
$(document).on('click', '.drop-item', function () {
  displayStats(docList.find(i => i.doc === $(this).text()))
  $('.parsed-text').scrollTop(0)
})

// Highlight term in raw text on stat word click
$(document).on('click', '.stat-item, .stat-bar', function () {
  highlightTerm($(this).data('term'))
  if($('mark').get(0)) {
    $('mark').get(0).scrollIntoView()
  }
})