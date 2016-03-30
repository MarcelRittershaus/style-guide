import $ from 'jquery'

class ProgressBar {

  constructor(element, options) {
    this.$element = $(element)

    this.defaults = {
      'max': 4
    }

    this.options = $.extend({}, this.defaults, options)
    
    this.init()
  }

  init() {

    if (this.$element.find('ul').children().length > this.options.max) {
      this.$element.addClass('progress-bar__long')
    } else {
      this.$element.removeClass('progress-bar__long')
    }

  }

}

function Plugin() {
  let params = arguments

  return this.each(function () {
    let $this = $(this)
    let data = $this.data('axa.progress-bar')

    if (!data) {
      data = new ProgressBar(this)
      $this.data('axa.progress-bar', data)
    }

    let method = params[0]
    if (typeof(method) === 'string') {
      data[method](...params.slice(1))
    }
  })
}

$.fn.progressBar = Plugin
$.fn.progressBar.Constructor = ProgressBar

$(function () {
  $('[data-progress-bar]').each(function () {
    let $progressBar = $(this)
    let data = $progressBar.data()
    Plugin.call($progressBar, data)
  })
})

// Copyright AXA Versicherungen AG 2015
