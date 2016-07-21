import $ from 'jquery';
import moment from 'moment';

class Emitter {
  constructor() {
    this.on = this.on.bind(this);
    this.emit = this.emit.bind(this);
    this.events = {select: []};
  }
  on(eventName, cb) {
    return this.events[eventName].push(cb);
  }
  emit(eventName) {
    return this.events[eventName].map((fx) =>
      fx.apply(null, Array.prototype.slice.call(arguments, 1)));
  }
}

let append = function(html, $parent) {
  let $el = $(html);
  $parent.append($el);
  return $el;
};

class Picker extends Emitter {

  constructor(moment1, displayWeek, icons) {
    this.moment = moment1;
    this.displayWeek = displayWeek;
    this.icons = icons;
    super();

    this.date = this.moment();

    this.$element = $('<div class="picker" ></div>');

    if (this.displayWeek) {
      this.$element.addClass('picker--with-weeknumber');
    }

    this.$header = append('<div class="picker__header" ></div>', this.$element);

    this.$prev = append('<div class="picker__prev"></div>', this.$header);
    this.$prev.append(this.createIcon('prev'));
    this.$prev.on('click', this.onPrevClick.bind(this));

    this.$next = append('<div class="picker__next"></div>', this.$header);
    this.$next.append(this.createIcon('next'));
    this.$next.on('click', this.onNextClick.bind(this));

    this.$headline = append('<div class="picker__headline" ></div>', this.$header);
    this.$headline__month = append('<span class="picker__headline__month" ></span>', this.$headline);
    append('<span> </span>', this.$headline);
    this.$headline__year = append('<span></span>', this.$headline);

    this.$content = append('<div class="picker__content" ></div>', this.$element);

    this.$month = append('<div class="picker__month" ></div>', this.$content);

    // TODO: i18n
    let weekdays = moment.localeData()._weekdaysMin;

    this.$weekHeadline = append(`<div class="picker__week picker__week--headline"><div class="picker__day picker__day--headline">${weekdays[1]}</div><div class="picker__day picker__day--headline">${weekdays[2]}</div><div class="picker__day picker__day--headline">${weekdays[3]}</div><div class="picker__day picker__day--headline">${weekdays[4]}</div><div class="picker__day picker__day--headline">${weekdays[5]}</div><div class="picker__day picker__day--headline">${weekdays[6]}</div><div class="picker__day picker__day--headline">${weekdays[0]}</div></div>`, this.$month);

    // @$weeks = append '<div class="picker__weeks" ></div>', @$month

    if (this.displayWeek) {
      this.$weekHeadline.prepend('<div class="picker__weeknumber picker__weeknumber--headline" ></div>');
    }

    this.updateDisplay();
  }

  updateDisplay() {
    this.$headline__month.text(this.date.format('MMMM'));
    this.$headline__year.text(this.date.format('YYYY'));

    this.$month.empty();
    this.$month.append(this.$weekHeadline);

    let dateClone = this.moment(this.date);
    let month = dateClone.get('month');

    // start by the first day of the month
    dateClone.set('date', 1);

    // rewind to the first day of the week
    if (dateClone.get('day') === 0) {
      // if the current day is sunday (week start for moment.js) rewind to monday "last week"
      dateClone.set('day', -6);
    } else {
      dateClone.set('day', 1);
    }

    return (() => { let result = []; while (true) {
      let $week = append('<div class="picker__week" ></div>', this.$month);

      if (this.displayWeek) {
        let $weeknumber = $('<div class="picker__weeknumber" ></div>');
        $weeknumber.text(dateClone.get('week'));
        $week.prepend($weeknumber);
      }

      result.push((() => { let result1 = []; while (true) {

        let modifier = null;

        let currentMonth = dateClone.get('month');

        if (currentMonth < month) {
          modifier = 'picker__day--prev-month';
        } else if (currentMonth > month) {
          modifier = 'picker__day--next-month';
        }

        append(this.createDay(dateClone, modifier), $week);

        result1.push(dateClone.add(1, 'days'));

        if (dateClone.get('day') === 1) // until monday
          break
      } return result1; })());

      if (dateClone.get('month') != month) // until another month
        break
    } return result; })();
  }



  createIcon(iconName) {
    let icon = this.icons[iconName];

    if (icon == null) {
      $.error(`Please define the ${iconName} icon`);
    }

    let $icon = $(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${icon}" /></svg>`);

    // can't use addClass here since $icon is svg
    $icon.attr('class', `picker__icon picker__icon--${iconName}`);

    return $icon;
  }

  createDay(d, modifier) {
    let date = this.moment(d); // create a clone

    let $day = $('<div class="picker__day" ></div>');

    if (modifier != null) {
      $day.addClass(modifier);
    }

    if ((this.selectedDate != null) && date.format('DD.MM.YYYY') === this.selectedDate.format('DD.MM.YYYY')) {
      $day.addClass('is-active');
    }

    if (date.format('DD.MM.YYYY') === this.moment().format('DD.MM.YYYY')) {
      $day.addClass('picker__day--today');
    }

    let self = this;

    $day.text(date.get('date'));
    $day.on('click', function(e) {
        e.preventDefault();

        self.setSelectedDate(date);
        self.emit('select', date.format('DD.MM.YYYY'));
        return self.toggle();
      }
    );

    return $day;
  }

  getDOMNode() {
    return this.$element;
  }

  toggle() {
    return this.$element.toggleClass('is-active');
  }

  setSelectedDate(selectedDate) {
    this.date = selectedDate;
    this.selectedDate = this.moment(selectedDate);
    return this.updateDisplay();
  }

  onPrevClick(e) {
    e.preventDefault();

    this.date.add(-1, 'months');
    return this.updateDisplay();
  }

  onNextClick(e) {
    e.preventDefault();

    this.date.add(1, 'months');
    return this.updateDisplay();
  }
}

class Datepicker {

  constructor(element, moment1, input, displayWeek, icons) {
    this.onChange = this.onChange.bind(this);
    this.moment = moment1;
    this.$element = $(element);

    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/(iOS|iPhone|iPad|iPod)/i) || navigator.userAgent.match(/Windows Phone/i)) {

      this.$input = $(input);

      this.$input.prop('type', 'date');

      this.$input.focus();

    } else {

      this.picker = new Picker(this.moment, displayWeek, icons);

      if (input != null) {
        this.$input = $(input);

        this.$input.on('change', this.onChange);

        this.onChange();
      }

      this.picker.on('select', (date => {
          this.$input.val(date);
          return this.$input.trigger('change');
        })
      );

      this.$element.append(this.picker.getDOMNode());
    }
  }

  onChange() {
    let dat = this.moment(this.$input.val(), 'DD.MM.YYYY');

    if (dat.isValid()) {
      return this.picker.setSelectedDate(dat);
    }
  }

  toggle() {

    return this.picker.toggle();
  }
}

// Plugin definition
let Plugin = function(options) {
  let opts = $.extend( {}, $.fn.datepicker.defaults, options );

  return this.each(function() {
    let $this = $(this);
    let data = $this.data('axa.datepicker');

    if (!data) {
      if (opts.moment != null) {
        ({ moment } = opts);
      } else if (window.moment != null) {
        ({ moment } = window);
      } else {
        $.error("Moment.js must either be passed as an option or be available globally");
      }

      data = new Datepicker(this, moment, opts.input, opts.displayWeek, opts.icons);
      $this.data('axa.datepicker', data);
    }

    if (opts.action != null) {
      return data[opts.action]();
    }
  });
};

// Plugin registration
$.fn.datepicker = Plugin;
$.fn.datepicker.Constructor = Datepicker;

// DATA-API
$(document).on('click.axa.datepicker.data-api', '[data-datepicker]', function(e) {
    e.preventDefault();

    let $target = $($(this).data('datepicker'));

    let $input = $($target.data('datepicker-watch'));

    let displayWeek = $target.data('datepicker-display-week');

    let icons = {
      prev: $target.data('datepicker-icon-prev'),
      next: $target.data('datepicker-icon-next')
    };

    displayWeek = displayWeek && displayWeek !== 'false';

    return Plugin.call($target, { input: $input, action: 'toggle', displayWeek, icons });
  }
);

//! Copyright AXA Versicherungen AG 2015
