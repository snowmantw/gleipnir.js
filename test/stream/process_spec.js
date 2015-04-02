/* global describe, it, chai */
'use strict';
import { Process } from 'src/stream/process/process.js';

describe(`Process > `, () => {
  var expect = chai.expect;
  it(`should exist`, () => {
    expect(Process).to.exist;
  });

  it(`should report error when the order of nodes is wrong`, (done) => {
    var process = new Process();
    try {
      process.stop().start().next(() => {
        done('Error: should not execute this step (stop before start)');
      });
    } catch(e) {
      done();
    }
  });

  it(`should build the process with different steps`, (done) => {
    var process = new Process();
    process.start()
      .next(() => 9)
      .next((nine) => {
        expect(nine).to.equal(9);
      })
      .next(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => { resolve(10); }, 200);
        });
      })
      .next((ten) => {
        expect(ten).to.equal(10);
      })
      .next(() => {
        return (new Process())
          .start()
          .next(() => 'foo')
          .next((foo) => foo);
      })
      .next((foo) => {
        expect(foo).to.equal('foo');
      })
      .rescue((err) => {
        done(err);
      })
      .next(() => {
        done();
      });
  });

  it(`should abort the flow when the phase changed`, (done) => {
    var process = new Process();
    process.start()
    .next(() => {
      process.stop()
        .next(() => {
          done();
        });
    })
    .next(() => {
      done(`This step should not be executed, since the
        process had been stoppped`);
    });
  });
});
