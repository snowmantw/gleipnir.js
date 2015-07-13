/* global describe, it, chai, sinon */
'use strict';

import { Component as ComponentBuilder } from 'src/builder/component.js';

describe(`ComponentBuilder >`, () => {
  var expect = chai.expect;
  it(`should exist`, () => {
    expect(ComponentBuilder).to.exist;
  });

  it(`should be able to build a component with all things`, () => {
    var stubQuerySelector = sinon.stub(document, 'querySelector',
    function(id) {
      var div = document.createElement('div');
      div.id = id;
      return div;
    });
    var stubStartStateStart = sinon.spy();
    var stubSetupStateStart = sinon.spy(function() {
        this.component.resources.elements.fooCanvas =
          document.querySelector(this.component.resources.elements.fooCanvas);
        this.component.transferTo(MockStartState);
      });
    var stubStartStateStop = sinon.spy(function() { return this; } );
    var stubSetupStateStop = sinon.spy(function() { return this; } );

    var mockLogger = {
      start: function() {},
      transfer: sinon.spy()
    };
    var MockStartState = function(component) {
      this.component = component;
      this.configs = { type: 'mockStart' };
      this.start = stubStartStateStart.bind(this);
      this.stop = stubStartStateStop.bind(this);
      this.next = function(cb) { cb(); return this; };
    };
    var MockSetupState = function(component) {
      this.component = component;
      this.configs = { type: 'mockSetup' };
      this.start = stubSetupStateStart.bind(this);
      this.stop = stubSetupStateStop.bind(this);
      this.next = function(cb) { cb(); return this; };
    };
    var foo = (new ComponentBuilder()).start().type('Foo')
      .configs({ logger: { debug: true }})
      .resources({ elements: { fooCanvas: '#foo-canvas' } })
      .logger(mockLogger)
      .methods({
        fooMethod() {
          return this.type;
        }
      })
      .setup(MockSetupState)
      .instance();
    foo.start();
    expect(foo.fooMethod()).to.equal('Foo');
    expect(stubSetupStateStart.called).to.be.true;
    expect(stubQuerySelector.calledWith('#foo-canvas')).to.be.true;
    expect(mockLogger.transfer.calledWith('mockSetup', 'mockStart', {}))
      .to.be.true;
    expect(stubStartStateStart.called).to.be.true;
    stubQuerySelector.restore();
  });
});
