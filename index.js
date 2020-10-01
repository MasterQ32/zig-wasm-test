//
// Reading WASM memory
//

let memory;

const utf8Decoder = new TextDecoder('utf-8');
const readUTF8 = (ptr, len) => utf8Decoder.decode(new Uint8Array(memory.buffer, ptr, len));

//
// Exports to WASM
//

const env = {};

// Console

env.consoleLog = (msgPtr, msgLen) => console.log(readUTF8(msgPtr, msgLen));

// GL

const gl = document.querySelector('#canvas').getContext('webgl');

env.glClearColor = (r, g, b, a) => gl.clearColor(r, g, b, a);
env.glClear = (mask) => gl.clear(mask);

//
// Instantiate WASM
//

(async () => {
  const response = await fetch('main.wasm');
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, { env });

  memory = instance.exports.memory;

  if (instance.exports.init) {
    instance.exports.init();
  }

  if (instance.exports.frame) {
    const frame = (t) => {
      if (document.hasFocus()) {
        instance.exports.frame(t);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
})();
