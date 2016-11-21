'use babel';

// var marker = atom.workspace.getActiveTextEditor().markBufferRange(new Range([0, 1], [2, 3]))
// atom.workspace.getActiveTextEditor().decorateMarker(marker, {type: 'highlight', class: 'hola'})

import BrainfuckDebugView from './brainfuck-debug-view';
import { CompositeDisposable } from 'atom';

var bfstep = require('./bfstep/');

function printInfo(obj) {
  console.log('------------------------------------------------');
  // console.log('state:     ', obj.state);
  console.log('cellCount: ', obj.cellCount);
  console.log('cursor:    ', obj.cursor);
  // console.log('source:    ', obj.source);
  // console.log('tape:      ', obj.tape);
  console.log('position:  ', obj.position);
  // console.log('delay: ', obj.delay);
  // console.log('input: ', obj.input);
}

export default {

  view: null,
  panel: null,
  subscriptions: null,
  decorations: {},

  activate(state) {
    console.log('activate', state);
    this.view = new BrainfuckDebugView(state.brainfuckDebugViewState);
    this.panel = atom.workspace.addBottomPanel({
      item: this.view.getElement(),
      visible: false
    });
    
    var bf = bfstep.create(0, 100);
    var toggleButton = this.view.toggle;
    var view = this.view;
    var viewTape = this.view.tape;
    var decorations = {};
    bf.on('step', function(output) {
      printInfo(this);
      var editor = getEditor();
      var range = [[0, (this.position - 1)], [0, this.position]];
      console.log(range);
      var marker = editor.markBufferRange(range, {invalidate: 'never'});
      if (decorations[editor.id]) {
        decorations[editor.id].getMarker().destroy();
      }
      decorations[editor.id] = editor.decorateMarker(marker, {type: 'highlight', class: "highlight-blue"});
      // range = [[0, (this.position - 1)], [0, this.position]];
      // console.log(range);
      // var marker = editor.markBufferRange(range, {invalidate: 'never'});
      // var decoration = editor.decorateMarker(marker, {type: 'highlight', class: "highlight-red"});
      // atom.views.getView(atom.workspace).focus()
      console.log('decoration', decorations);
      
      
      
      var charPos = (this.position - 1);
      viewTape.innerText = this.tape.slice(0, 10).join(' | ');
      console.log([this.source.substring(0, charPos), '\x1b[7m', this.source.substr(charPos, 1), '\x1b[0m', this.source.substring(charPos+1)].join(''));
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
    });
    this.view.toggle.addEventListener("click", function() {
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
      bf.delay = this.value;
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
    console.log('serialize');
    return {
      brainfuckDebugViewState: this.view.serialize()
    };
  },

  toggle() {
    console.log('BrainfuckDebug was toggled!');
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
