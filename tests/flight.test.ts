import {test} from 'node:test';import assert from 'node:assert/strict';import {steer,contact} from '../src/flight.ts';
test('fast acceleration and braking',()=>{let v={x:0,y:0,z:0};for(let i=0;i<12;i++)v=steer(v,{x:36,y:0,z:0},1/60);assert.ok(v.x>33);for(let i=0;i<12;i++)v=steer(v,{x:0,y:0,z:0},1/60);assert.ok(v.x<1)});
test('high speed contact cannot tunnel through target',()=>{assert.equal(contact({x:-100,y:0,z:0},{x:100,y:0,z:0},{x:0,y:0,z:0},2),.49);assert.equal(contact({x:0,y:5,z:0},{x:100,y:5,z:0},{x:0,y:0,z:0},2),null)});
test('stationary and embedded contacts',()=>{assert.equal(contact({x:0,y:0,z:0},{x:0,y:0,z:0},{x:0,y:0,z:0},2),0);assert.equal(contact({x:5,y:0,z:0},{x:5,y:0,z:0},{x:0,y:0,z:0},2),null)});
test('response independent of frame rate',()=>{const sim=(hz:number)=>{let v={x:0,y:0,z:0};for(let i=0;i<hz;i++)v=steer(v,{x:36,y:0,z:0},1/hz);return v.x};assert.ok(Math.abs(sim(30)-sim(144))<1e-8)});
