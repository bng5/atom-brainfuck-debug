'use babel';

import TextBuffer from 'atom';

export default class BrainfuckDebugView {

  constructor(serializedState) {
    console.log('constructor', serializedState);
    this.element = document.createElement('div');
    this.element.classList.add('brainfuck-debug', 'btn-toolbar');
        
    this.tape = this.element.appendChild(document.createElement('div'));
    var btnGroupDiv = this.element.appendChild(document.createElement('div'));
    var btnGroup = btnGroupDiv.appendChild(document.createElement('section'));
    var message = btnGroup.appendChild(document.createElement('div'));
    message.classList.add('btn-group');//, 'input-block-item', 'input-block-item--flex', 'editor-container'
    this.toggle = message.appendChild(document.createElement('button'));
    this.toggle.classList.add('btn', 'btn-default', 'icon', 'icon-playback-play');
    this.toggle.textContent = "Run";
    
    this.stop = message.appendChild(document.createElement('button'));
    this.stop.classList.add('btn', 'btn-default', 'icon', 'icon-primitive-square');
    this.stop.textContent = "Stop";
    
    this.step = message.appendChild(document.createElement('button'));
    this.step.classList.add('btn', 'btn-default', 'icon', 'icon-jump-right');
    this.step.textContent = "Next";
    
    this.delay = message.appendChild(document.createElement('input'));
    this.delay.setAttribute('type', 'range');
    this.delay.className = 'input-range';
    this.delay.setAttribute('min', 50);
    this.delay.setAttribute('max', 5000);
    var output = this.element.appendChild(document.createElement('div'));
    this.output = output.appendChild(document.createElement('textarea'));
    this.output.classList.add('input-textarea');
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
