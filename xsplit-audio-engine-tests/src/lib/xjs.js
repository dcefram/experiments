const callbacks = {};
window.OnAsyncCallback = (id, ret) => {
  console.log(id);
  if (callbacks[id]) {
    callbacks[id](decodeURIComponent(ret));
    delete callbacks[id];
  }
};

export const get = (prop) =>
  new Promise((r) => {
    const id = external.CallHostFunc("getProperty", prop);
    console.log(
      `external.CallHostFunc('getProperty', ${prop});`,
      `async-id = ${id}`
    );
    callbacks[id] = (value) => {
      console.log(`async-id = ${id}`, value);
      r(value);
    };
  });

export const set = (prop, value) =>
  new Promise((r) => {
    const id = external.CallHostFunc("setProperty", prop, value);
    console.log(
      `external.CallHostFunc('setProperty', ${prop});`,
      `async-id = ${id}`
    );
    callbacks[id] = (value) => {
      console.log(`async-id = ${id}`, value);
      r(value);
    };
  });
