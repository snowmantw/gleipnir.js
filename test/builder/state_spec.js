/* global describe, it, chai */
'use strict';
import { Process } from 'src/process/process.js';
import { State as StateBuilder } from 'src/builder/state.js';

describe(`StateBuilder > `, () => {
  var expect = chai.expect;
  it(`should exist`, () => {
    expect(StateBuilder).to.exist;
  });

  it(`should at least give a type`, (done) => {
    try {
      (new StateBuilder()).start().create();
      done(`Error: should not completely creat a state without type`);
    } catch(e) {
      done();
    }
  });

  it(`should be able to build a state with all things`, (done) => {
    var stubHandler = function(evt) {
      switch(evt.type) {
        case 'fooevent':
          return (new Process()).start();
        case 'barevent':
          return (new Process()).start().next(() => {
            done(`Error: shouldn't execute to this step,
              since the interrupt came`);
          });
        case 'foointerrupt':
          done();
          break;
      }
    };
    var mockSource = {
      start: () => {},
      stop: () => {},
      onchange: stubHandler
    };
    var foo = (new StateBuilder()).start().type('Foo')
      .component({ transferTo() {} })
      .events(['fooevent, barevent'])
      .interrupts(['foointerrupt'])
      .sources([mockSource])
      .handler(stubHandler)
      .methods({
        fooMethod() {
          return this.configs.type;
        }
      })
      .instance();
    expect(foo.fooMethod()).to.equal('Foo');
    mockSource.onchange({ 'type': 'fooevent' });
    mockSource.onchange({ 'type': 'barevent' });
    mockSource.onchange({ 'type': 'foointerrupt' });
  });
});
