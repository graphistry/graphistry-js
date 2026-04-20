// Runtime-configurable demo settings. Override via query string:
//   ?host=my-graphistry.local&dataset=<id>
// See apps/core/viz/server/clientParamSafelist.js for the allowed keys.

const qs = new URLSearchParams(window.location.search);

export const HOST = qs.get('host') ?? `${window.location.hostname}:8491`;
export const DATASET = qs.get('dataset') ?? '539faecb680043a5ad8be679cab43117';

/** iframe URL params that strip Graphistry's built-in chrome so only the
 *  floating React panels remain visible. */
export const SCENE_PARAMS = {
  type: 'arrow',
  splashAfter: false,
  menu: false,
  info: false,
  showInspector: false,
  showHistograms: false,
};

/** Token `ink` from index.css. Applied over RPC once the iframe handshake
 *  completes — targets `scene.renderer.background.color`. */
export const SCENE_BG_HEX = '#0A0814';
