module.exports = function (el) {
  var data;
  var start = 0
  var end = 0
  var index = 0;
  var ul = el.appendChild(document.createElement('ul'));
  ul.classList.add('soft', 'dec');
  var li, span;
  li = ul.appendChild(document.createElement('li'));
  span = li.appendChild(document.createElement('span'));
  var cellWidth = span.offsetWidth;
  var padding, fit, half, cellWidth;
  var current = el.appendChild(document.createElement('span'));
  var formatValue = function (value, element) {
    element.removeChild(element.firstChild)
    element.appendChild(document.createTextNode(value))
    return value
  }

  setTimeout(function() {
    padding = Math.round(el.clientWidth / 2 - span.offsetWidth / 2);
    fit = Math.ceil(el.clientWidth / span.offsetWidth);
    half = Math.ceil(fit / 2);
    cellWidth = span.offsetWidth;
    current.style.left = (padding - 3) + 'px';
  }, 0);

  var indexEl = el.appendChild(document.createElement('em'));
  indexEl.setAttribute('id', 'index');
  var dragging = false;
  var moveTo = function (k) {
    // console.log('moveTo', index, k);
    ul.classList.remove('soft');
    if (k > index) {
      if (start < (k - fit - fit)) {
        var newStart = (k - fit - half);
        while(start <= newStart) {
          ++start;
          ul.removeChild(ul.firstChild);
          ul.style.left = (ul.offsetLeft - cellWidth).toString() + 'px';
        }
      }
      if ((k + fit) > end) {
        var newEnd = (k + fit + half);
        if (newEnd >= data.length) {
          newEnd = (data.length - 1);
        }
        while(end <= newEnd) {
          end++;
          li = ul.appendChild(document.createElement('li'));
          span = li.appendChild(document.createElement('span'));
          span.appendChild(document.createTextNode(data[end]));
        }
      }
    } else if (k < index) {
      if ((k - fit) < start) {
        var newStart = (k - fit - half);
        if (newStart < 0) {
          newStart = 0;
        }
        var li, span;
        while(start > newStart) {
          --start;
          li = document.createElement('li');
          span = li.appendChild(document.createElement('span'));
          span.appendChild(document.createTextNode(data[start]));
          ul.insertBefore(li, ul.firstChild);
          ul.style.left = (ul.offsetLeft + cellWidth).toString()+'px';
        }
      }
      if (end > (k + fit + fit)) {
        var newEnd = (k + fit + half);
        while(end >= newEnd) {
          --end;
          ul.removeChild(ul.lastChild);
        }
      }
    }
    index = k;
    ul.classList.add('soft');
    ul.style.left = (padding - (k - start) * cellWidth)+'px';
    indexEl.textContent = k;
  };
  window.addEventListener('resize', function (event) {
    padding = (el.clientWidth / 2 - span.offsetWidth / 2);
    current.style.left = (padding - 3) + 'px';
  }, false);
  ul.addEventListener('mousedown', function (event) {
    dragging = true;
    ul.classList.remove('soft');
  }, false);
  document.addEventListener('mousemove', function (event) {
    if (!dragging) {
      return;
    }
    var k = (Math.round((ul.offsetLeft - padding) / cellWidth) - start);
    indexEl.textContent = (k <= 0 && k > -data.length) ? Math.abs(k) : ' ';
    ul.style.left = (ul.offsetLeft + event.movementX).toString()+'px';
  }, false);
  document.addEventListener('mouseup', function () {
    if (!dragging) {
      return;
    }
    dragging = false;
    var offset = Math.round((ul.offsetLeft - padding) / cellWidth);
    offset -= start;
    if (offset > 0) {
      offset = 0;
    } else if (offset < -data.length) {
      offset = (data.length - 1);
    }
    moveTo(Math.abs(offset));
    ul.classList.add('soft');
  }, false);
  // el.addEventListener("wheel", function(event) {
  //   if (!dragging) {
  //     var k = (index + (event.deltaY > 0 ? 1 : -1));
  //     if (k >= 0 && k < data.length) {
  //       moveTo(k);
  //     }
  //   }
  //   event.preventDefault();
  // }, false);
  /*
  var tapeOffset = (function(cellWidth, tapeWidth) {
      var pos = (tapeWidth / 2 - cellWidth / 2);
      return function(index) {
          return (pos - index * cellWidth)+'px';
      }
  })(span.offsetWidth, tape.clientWidth);
  */
  return {
    /**
     * Mueve el puntero al índice indicado
     */
    moveTo: moveTo,
    
    /*calcular: function() {
      li = ul.appendChild(document.createElement('li'));
      span = li.appendChild(document.createElement('span'));
      var cellWidth = span.offsetWidth;
      var padding = Math.round(el.clientWidth / 2 - span.offsetWidth / 2);
      var fit = Math.ceil(el.clientWidth / span.offsetWidth);
      var half = Math.ceil(fit / 2);
      current.style.left = (padding - 3)+'px';
    },*/
    
    /**
     * Fija el valor del byte actual
     */
    setValue: function (value) {
      // console.log('Tape setValue %d', value)
      // ul.childNodes.item(index).firstChild.textContent = value.toString(16)
      // ul.childNodes.item(index).firstChild.textContent = formatValue(value)
      formatValue(value, ul.childNodes.item(index).firstChild)
    },
    
    /**
     * Obtener el valor del byte actual
     */
    getValue: function () {
      console.log('Tape getValue')
      return parseInt(ul.childNodes.item(index).firstChild.textContent);
    },
    
    /**
     * Fija el array y la posición del puntero
     */
    attachData: function (tape, k) {
      console.log('Tape attachData')
      console.log(tape, k);
      data = tape;
      index = k;
      while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
      }
      start = (index - fit);
      if (start < 0) {
        start = 0;
      }
      end = (index + fit);
      if (end >= tape.length) {
        end = (tape.length - 1);
      }
      console.log('Tape length %d, fit %d, start %d, end %d', tape.length, fit, start, end);
      for (var i = start; i <= end; i++) {
        li = ul.appendChild(document.createElement('li'));
        span = li.appendChild(document.createElement('span'));
        span.appendChild(document.createTextNode(tape[i]));
      }
      moveTo(index);
    },
    
    /**
     * Actualiza el valor del byte actual al valor correspondiente en el array
     */
    update: function (data) {
      // console.log('Tape update')
      // ul.childNodes.item(index).firstChild.textContent = data[index];
      console.log('start %d, end %d, index %d', start, end, index);
      var _start = start
      for (var li of ul.childNodes) {
        console.log(_start, data[_start], li.firstChild)
        formatValue(data[_start], li.firstChild)
        _start++
      }
    },
    
    setRendering: function (format, data) {
      switch (format) {
        case 'd':
          ul.classList.remove('hex', 'chr')
          ul.classList.add('dec')
          formatValue = function(value, element) {
            element.removeChild(element.firstChild)
            element.appendChild(document.createTextNode(value))
            return value
          }
          break;
        case 'h':
          ul.classList.remove('dec', 'chr')
          ul.classList.add('hex')
          formatValue = function(value, element) {
            element.removeChild(element.firstChild)
            element.appendChild(document.createTextNode(('0' + value.toString(16).toUpperCase()).slice(-2)))
            return ('0' + value.toString(16).toUpperCase()).slice(-2)
          }
          break;
        case 'c':
          ul.classList.remove('dec', 'hex')
          ul.classList.add('chr')
          var controlCharacters = ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'TAB', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US']
          // var controlCharacters = ['\u2400', '\u2401', '\u2402', '\u2403', '\u2404', '\u2405', '\u2406', '\u2407', '\u2408', '\u2409', '\u240A', '\u240B', '\u240C', '\u240D', '\u240E', '\u240F', '\u2410', '\u2411', '\u2412', '\u2413', '\u2414', '\u2415', '\u2416', '\u2417', '\u2418', '\u2419', '\u241A', '\u241B', '\u241C', '\u241D', '\u241E', '\u241F']
          formatValue = function(value, element) {
            var child
            if (value < controlCharacters.length) {
              child = document.createElement('kbd')
              child.appendChild(document.createTextNode(controlCharacters[value]))
            } else if (value === 32) {
              child = document.createTextNode('\u2423')
            } else if (value >= 127 && value <= 159) {
              child = document.createElement('kbd')
              child.appendChild(document.createTextNode('00' + value.toString(16)))
            } else {
              child = document.createTextNode(String.fromCharCode(value))
            }
            element.removeChild(element.firstChild)
            element.appendChild(child)
          }
          break
        default:
          throw new Error('Unrecognizable format')
      }
      this.update(data)
    }
  }
}
