'use babel';

// var marker = atom.workspace.getActiveTextEditor().markBufferRange(new Range([0, 1], [2, 3]))
// atom.workspace.getActiveTextEditor().decorateMarker(marker, {type: 'highlight', class: 'hola'})

import BrainfuckDebugView from './brainfuck-debug-view';
import { CompositeDisposable } from 'atom';
var utf8 = require('utf8');

var bfstep = require('brainfuck-step');

var outputBuffer = [];

var Registry = function (view) {
  var interpreters = {};
  return {
    getInterpreter: function (editor) {
      if (editor && interpreters[editor.id]) {
        return interpreters[editor.id];
      }
      var bf = bfstep.create(100, 500);
      var toggleButton = view.toggle;
      var viewTape = view.tape;
      viewTape.attachData(bf.tape, 0);
      var decorations = {};
      bf.on('step', function (output) {
        // console.log('step')
        // console.log([this.source.substring(0, this.programPointer), '\x1b[7m', this.source.substr(this.programPointer, 1), '\x1b[0m', this.source.substring(this.programPointer + 1)].join(''));
        viewTape.moveTo(this.dataPointer);
        viewTape.setValue(this.tape[this.dataPointer]);
        var line = 0;
        var column = this.programPointer
        console.log('step programPointer %d', this.programPointer)
        while(column >= (editor.buffer.lines[line].length + editor.buffer.lineEndingForRow(line).length)) {
          column -= (editor.buffer.lines[line].length + editor.buffer.lineEndingForRow(line).length);
          line++;
        }
        var range = [[line, column], [line, (column + 1)]];
        var marker = editor.markBufferRange(range, {invalidate: 'never'});
        if (decorations[editor.id]) {
          decorations[editor.id].getMarker().destroy();
        }
        decorations[editor.id] = editor.decorateMarker(marker, {type: 'highlight', class: 'highlight-bf-pos'});
        // atom.views.getView(atom.workspace).focus()
        
        //viewTape.update();//getElementsByTagName('li').item(this.cursor).firstChild.innerText = this.tape[this.cursor];
        if (output) {
          outputBuffer.push(output.charCodeAt(0));
          view.output.value = new Buffer(outputBuffer).toString('utf8');
          console.log(output, output.charCodeAt(0));
        }
      });
      bf.on('statechange', function (state) {
        console.log('statechange programPointer %d', this.programPointer)
        var running = (state === bfstep.STATE_RUNNING);
        toggleButton.classList.toggle('selected', running);
        toggleButton.classList.toggle('icon-playback-pause', running);
        toggleButton.classList.toggle('icon-playback-play', !running);
      });
      bf.on('end', function (error, output) {
        if (error) {
          view.output.innerText = error.message;
          view.output.classList.add('error');
        }
        toggleButton.classList.remove('selected', 'icon-playback-pause');
        toggleButton.classList.add('icon-playback-play');
        console.log(output);
      });
      interpreters[editor.id] = bf;
      return bf;
    }
  };
};

var registry;

export default {
  view: null,
  panel: null,
  subscriptions: null,
  decorations: {},

  activate(state) {
    this.view = new BrainfuckDebugView(state.brainfuckDebugViewState);
    this.panel = atom.workspace.addBottomPanel({
      item: this.view.getElement(),
      visible: false
    });
    registry = Registry(this.view);
    var view = this.view
    this.view.rendering.addEventListener('click', function (event) {
      var selected = this.getElementsByClassName('selected')[0]
      if (selected === event.target) {
        return
      }
      selected.classList.remove('selected')
      event.target.classList.add('selected')
      view.tape.setRendering(event.target.value, bf.tape)
    }, false)
    this.view.toggle.addEventListener('click', function () {
      bf = registry.getInterpreter(getEditor());
      // console.log(atom.workspace.getActivePaneItem());
      // if (!atom.workspace.getActiveTextEditor().bfdebug) {
      //   atom.workspace.getActiveTextEditor()
      // }
      bf.source = getEditor().buffer.cachedText;
      bf.toggleRun();
    });
    this.view.stop.addEventListener('click', function () {
      bf.stop();
    });
    this.view.step.addEventListener('click', function () {
      if (bf.state === bfstep.STATE_PAUSED) {
        bf.step();
      }
    });
    this.view.delay.addEventListener('change', function () {
      console.log(this.value)
      bf.delay = -(parseInt(this.value));
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'brainfuck-debug:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    console.log('deactivate');
    this.panel.destroy();
    this.subscriptions.dispose();
    this.view.destroy();
  },

  serialize() {
    return {
      brainfuckDebugViewState: this.view.serialize()
    };
  },

  toggle() {
    return (
      this.panel.isVisible() ?
        this.panel.hide() :
        this.panel.show()
    );
  }
};

var getEditor = function () {
  return atom.workspace.getActiveTextEditor();
}
