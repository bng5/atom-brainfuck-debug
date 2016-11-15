'use babel';

import BrainfuckDebugView from './brainfuck-debug-view';
import { CompositeDisposable } from 'atom';

export default {

  brainfuckDebugView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.brainfuckDebugView = new BrainfuckDebugView(state.brainfuckDebugViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.brainfuckDebugView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'brainfuck-debug:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.brainfuckDebugView.destroy();
  },

  serialize() {
    return {
      brainfuckDebugViewState: this.brainfuckDebugView.serialize()
    };
  },

  toggle() {
    console.log('BrainfuckDebug was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
