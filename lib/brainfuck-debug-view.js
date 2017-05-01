'use babel';

import TextBuffer from 'atom';
var TapeView = require('./tape-view');

export default class BrainfuckDebugView {
  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('brainfuck-debug');
    var tape = this.element.appendChild(document.createElement('div'));
    tape.classList.add('tape');
    this.tape = TapeView(tape);
    window.tape = this.tape
    var section = this.element.appendChild(document.createElement('section'));
    section.classList.add('block', 'padded')
    var btnGroupDiv = section.appendChild(document.createElement('div'))
    btnGroupDiv.classList.add('inline-block')
    var btnGroup = btnGroupDiv.appendChild(document.createElement('div'))
    btnGroup.classList.add('btn-group', 'input-block-item')
    this.toggle = btnGroup.appendChild(document.createElement('button'));
    this.toggle.classList.add('btn', 'messagebtn-default', 'icon', 'icon-playback-play');
    this.toggle.appendChild(document.createTextNode('Run'))
    this.stop = btnGroup.appendChild(document.createElement('button'));
    this.stop.classList.add('btn', 'btn-default', 'icon', 'icon-primitive-square');
    this.stop.textContent = "Stop";
    this.step = btnGroup.appendChild(document.createElement('button'));
    this.step.classList.add('btn', 'btn-default', 'icon', 'icon-jump-right');
    this.step.textContent = "Next";
    var rangeBlock = section.appendChild(document.createElement('div'))
    rangeBlock.classList.add('inline-block')
    var packagePath = atom.packages.resolvePackagePath('brainfuck-debug')
    var turtle = rangeBlock.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    turtle.classList.add('icono')
    turtle.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'use'))
      .setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', packagePath + '/assets/symbols.svg#turtle')
    this.delay = rangeBlock.appendChild(document.createElement('input'));
    this.delay.setAttribute('type', 'range');
    this.delay.className = 'input-range';
    this.delay.setAttribute('min', -2000);
    this.delay.setAttribute('max', -40);
    this.delay.setAttribute('step', 40);
    if (serializedState && serializedState.delay) {
      console.log('serializedState.delay', serializedState.delay)
      this.delay.value = serializedState.delay;
    }
    var rabbit = rangeBlock.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    rabbit.classList.add('icono')
    rabbit.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'use'))
      .setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', packagePath + '/assets/symbols.svg#rabbit')
    var rendering = section.appendChild(document.createElement('div'))
    rendering.className = 'inline-block'
    this.rendering = rendering.appendChild(document.createElement('div'))
    this.rendering.setAttribute('id', 'rendering')
    this.rendering.classList.add('btn-group', 'input-block-item')
    var dec = this.rendering.appendChild(document.createElement('button'))
    var hex = this.rendering.appendChild(document.createElement('button'))
    var chr = this.rendering.appendChild(document.createElement('button'))
    dec.classList.add('btn', 'btn-sm', 'selected')
    hex.classList.add('btn', 'btn-sm')
    chr.classList.add('btn', 'btn-sm')
    dec.value = 'd'
    hex.value = 'h'
    chr.value = 'c'
    dec.appendChild(document.createTextNode('Dec'))
    hex.appendChild(document.createTextNode('Hex'))
    chr.appendChild(document.createTextNode('Chr'))
    var output = this.element.appendChild(document.createElement('section'));
    this.output = output.appendChild(document.createElement('textarea'));
    this.output.classList.add('input-textarea');
  }

  serialize() {
    return {
      delay: this.delay.value
    };
  }

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}
