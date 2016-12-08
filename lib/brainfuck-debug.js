'use babel';

// var marker = atom.workspace.getActiveTextEditor().markBufferRange(new Range([0, 1], [2, 3]))
// atom.workspace.getActiveTextEditor().decorateMarker(marker, {type: 'highlight', class: 'hola'})

import BrainfuckDebugView from './brainfuck-debug-view';
import { CompositeDisposable } from 'atom';

var bfstep   = require('./bfstep/');

function printInfo(obj) {
  console.log('----------------------------------------');
  // console.log('state:     ', obj.state);
  console.log('cellCount: ', obj.cellCount);
  console.log('cursor:    ', obj.cursor);
  // console.log('source:    ', obj.source);
  // console.log('tape:      ', obj.tape);
  // console.log('delay: ', obj.delay);
  // console.log('input: ', obj.input);
}

var Registry = function(view) {
  var interpreters = {};
  return {
    getInterpreter: function(editor) {
      if (editor && interpreters[editor.id]) {
        return interpreters[editor.id];
      }
      var bf = bfstep.create(100, 500);
      var toggleButton = view.toggle;
      var viewTape = view.tape;
      viewTape.attachData(bf.tape, 0);
      var decorations = {};
      bf.on('step', function(output) {
        printInfo(this);
        console.log([this.source.substring(0, this.position), '\x1b[7m', this.source.substr(this.position, 1), '\x1b[0m', this.source.substring(this.position+1)].join(''));
        //viewTape.moveTo(this.cursor);
        console.log('moveTo %d', this.cursor);
        var line = 0;
        var column = (this.position - 1);
        while(column > (editor.buffer.lines[line].length + editor.buffer.lineEndingForRow(line).length)) {
          column -= (editor.buffer.lines[line].length + editor.buffer.lineEndingForRow(line).length);
          line++;
        }
        var range = [[line, column], [line, (column + 1)]];
        console.log(range);
        var marker = editor.markBufferRange(range, {invalidate: 'never'});
        console.log(editor);
        if (decorations[editor.id]) {
          decorations[editor.id].getMarker().destroy();
        }
        decorations[editor.id] = editor.decorateMarker(marker, {type: 'highlight', class: "highlight-blue"});
        // atom.views.getView(atom.workspace).focus()
        
        //viewTape.update();//getElementsByTagName('li').item(this.cursor).firstChild.innerText = this.tape[this.cursor];
        if (output) {
          console.log(output);
        }
      });
      bf.on('statechange', function(state) {
        var running = (state === bfstep.STATE_RUNNING);
        toggleButton.classList.toggle('selected', running);
        toggleButton.classList.toggle('icon-playback-pause', running);
        toggleButton.classList.toggle('icon-playback-play', !running);
      });
      bf.on('end', function(error, output) {
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
    console.log('activate');
    this.view = new BrainfuckDebugView(state.brainfuckDebugViewState);
    this.panel = atom.workspace.addBottomPanel({
      item: this.view.getElement(),
      visible: false
    });
    registry = Registry(this.view);
    this.view.toggle.addEventListener("click", function() {
      bf = registry.getInterpreter(getEditor());
      // console.log(atom.workspace.getActivePaneItem());
      // if (!atom.workspace.getActiveTextEditor().bfdebug) {
      //   atom.workspace.getActiveTextEditor()
      // }
      bf.source = getEditor().buffer.cachedText;
      bf.toggleRun();
    });
    this.view.stop.addEventListener("click", function() {
      bf.stop();
    });
    this.view.step.addEventListener("click", function() {
      if (bf.state === bf.STATE_PAUSED) {
        bf.step();
      }
    });
    this.view.delay.addEventListener("change", function() {
      bf.delay = parseInt(this.value);
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
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

var getEditor = function() {
  return atom.workspace.getActiveTextEditor();
}
