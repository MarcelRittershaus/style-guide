import $ from 'jquery'

class Site {
  constructor(element) {
    this.$element = $(element)
    this.$page = this.$element.find('[data-page]')
    this.$mask = this.$element.find('[data-mask]')
    this.$mobile = this.$element.find('[data-mobile]')
    this.$burger = this.$element.find('[data-burger]')
    this.init()
  }

  init() {
    this.$mask.on('click', (event) => {
      event.preventDefault()
      this.hideMenu()
    })

    this.$burger.on('click', (event) => {
      event.preventDefault()
      this.toggleMenu()
    })
  }

  toggleMenu(show) {
    if (show === undefined) {
      show = !this.$page.hasClass('is-pushed')
    }

    this.$element.toggleClass('is-mobile-nav-open', show)
    this.$page.toggleClass('is-pushed', show)
    this.$mask.toggleClass('is-visible', show)
    this.$mobile.toggleClass('is-visible', show)
    this.$burger.each((i, element) => { element.classList.toggle('is-open', show) })
  }

  showMenu() {
    this.toggleMenu(true)
  }

  hideMenu() {
    this.toggleMenu(false)
  }
}

function Plugin() {
  let params = arguments

  return this.each(function () {
    let $this = $(this)
    let data = $this.data('axa.site')

    if (!data) {
      data = new Site(this)
      $this.data('axa.site', data)
    }

    let method = params[0]
    if (typeof(method) === 'string') {
      data[method](...params.slice(1))
    }
  })
}

$.fn.site = Plugin
$.fn.site.Constructor = Site

$(function () {
  $('[data-site]').each(function () {
    let $site = $(this)
    Plugin.call($site)
  })
})

// Copyright AXA Versicherungen AG 2015
