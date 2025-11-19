import { describe, expect, it } from 'vitest';

import * as traversal from '../traversal';
import type * as types from '../types';

describe('getOrderedNodes', () => {
  it('creates proper ordering of simple node structure', () => {
    const demoNodes: Array<types.Node> = [
      { id: 'foo', data: 'silly node 1' },
      { id: 'bar', data: 'silly node 2' },
      { id: 'bog', data: 'silly node 3' },
    ];
    const demoEdges: Array<types.Edge> = [
      { id: 'bug', source: 'foo', target: 'bar' },
      { id: 'baz', source: 'bar', target: 'bog' },
    ];

    const resultingOrder = traversal.getOrderedNodes('bog', demoNodes, demoEdges);
    expect(resultingOrder).toEqual([demoNodes[0], demoNodes[1], demoNodes[2]]);
  });

  it('creates proper ordering of branching node structure', () => {
    const demoNodes: Array<types.Node> = [
      { id: 'a', data: 'silly node 1' },
      { id: 'b', data: 'silly node 2' },
      { id: 'c', data: 'silly node 3' },
      { id: 'd', data: 'silly node 3' },
      { id: 'e', data: 'silly node 3' },
      { id: 'f', data: 'silly node 3' },
    ];
    const demoEdges: Array<types.Edge> = [
      { id: '1', source: 'a', target: 'b' },
      { id: '2', source: 'a', target: 'c' },
      { id: '3', source: 'b', target: 'd' },
      { id: '4', source: 'b', target: 'e' },
      { id: '5', source: 'c', target: 'e' },
      { id: '6', source: 'd', target: 'f' },
      { id: '7', source: 'e', target: 'f' },
    ];

    const resultingOrder = traversal.getOrderedNodes('f', demoNodes, demoEdges);
    const nodeIndices = Object.fromEntries(
      [...Array(6).keys()].map((idx) => {
        const char = String.fromCharCode(97 + idx);
        return [char, resultingOrder.findIndex((node) => node.id === char)];
      }),
    );

    expect(resultingOrder).toHaveLength(6);
    expect(nodeIndices['a']).toBeLessThan(nodeIndices['b']);
    expect(nodeIndices['a']).toBeLessThan(nodeIndices['c']);
    expect(nodeIndices['b']).toBeLessThan(nodeIndices['d']);
    expect(nodeIndices['b']).toBeLessThan(nodeIndices['e']);
    expect(nodeIndices['c']).toBeLessThan(nodeIndices['e']);
    expect(nodeIndices['d']).toBeLessThan(nodeIndices['f']);
    expect(nodeIndices['e']).toBeLessThan(nodeIndices['f']);
  });

  it('creates proper ordering of branching node structure, with random order', () => {
    const demoNodes: Array<types.Node> = [
      { id: 'd', data: 'silly node 3' },
      { id: 'f', data: 'silly node 3' },
      { id: 'c', data: 'silly node 3' },
      { id: 'e', data: 'silly node 3' },
      { id: 'b', data: 'silly node 2' },
      { id: 'a', data: 'silly node 1' },
    ];
    const demoEdges: Array<types.Edge> = [
      { id: '1', source: 'a', target: 'b' },
      { id: '4', source: 'b', target: 'e' },
      { id: '7', source: 'e', target: 'f' },
      { id: '2', source: 'a', target: 'c' },
      { id: '5', source: 'c', target: 'e' },
      { id: '6', source: 'd', target: 'f' },
      { id: '3', source: 'b', target: 'd' },
    ];

    const resultingOrder = traversal.getOrderedNodes('f', demoNodes, demoEdges);
    const nodeIndices = Object.fromEntries(
      [...Array(6).keys()].map((idx) => {
        const char = String.fromCharCode(97 + idx);
        return [char, resultingOrder.findIndex((node) => node.id === char)];
      }),
    );

    expect(resultingOrder).toHaveLength(6);
    expect(nodeIndices['a']).toBeLessThan(nodeIndices['b']);
    expect(nodeIndices['a']).toBeLessThan(nodeIndices['c']);
    expect(nodeIndices['b']).toBeLessThan(nodeIndices['d']);
    expect(nodeIndices['b']).toBeLessThan(nodeIndices['e']);
    expect(nodeIndices['c']).toBeLessThan(nodeIndices['e']);
    expect(nodeIndices['d']).toBeLessThan(nodeIndices['f']);
    expect(nodeIndices['e']).toBeLessThan(nodeIndices['f']);
  });

  it("omits nodes which aren't connected", () => {
    const demoNodes: Array<types.Node> = [
      { id: 'd', data: 'silly node 3' },
      { id: 'f', data: 'silly node 3' },
      { id: 'e', data: 'silly node 3' },
      { id: 'g', data: 'silly node 3' }, // extraneous node
      { id: 'c', data: 'silly node 3' },
      { id: 'b', data: 'silly node 2' },
      { id: 'a', data: 'silly node 1' },
    ];
    const demoEdges: Array<types.Edge> = [
      { id: '1', source: 'a', target: 'b' },
      { id: '4', source: 'b', target: 'e' },
      { id: '7', source: 'e', target: 'f' },
      { id: '2', source: 'a', target: 'c' },
      { id: '5', source: 'c', target: 'e' },
      { id: '6', source: 'd', target: 'f' },
      { id: '8', source: 'b', target: 'g' },
      { id: '3', source: 'b', target: 'd' },
    ];

    const resultingOrder = traversal.getOrderedNodes('f', demoNodes, demoEdges);

    expect(resultingOrder).toHaveLength(6);
    expect(resultingOrder).not.toContain({ id: 'g', data: 'silly node 3' });
  });
});
