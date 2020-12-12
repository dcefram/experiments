import { get, set } from "./xjs";

const parser = new DOMParser();

export const getAvailableDevices = async () => {
  const devices = parser.parseFromString(
    await get("wasapienum"),
    "application/xml"
  );

  return {
    mics: Array.from(devices.querySelectorAll("dev"))
      .filter((device) => device.getAttribute("DataFlow") === "Capture")
      .map((device) => ({
        id: device.getAttribute("id"),
        name: device.getAttribute("name"),
      })),
    speakers: Array.from(devices.querySelectorAll("dev"))
      .filter((device) => device.getAttribute("DataFlow") === "Render")
      .map((device) => ({
        id: device.getAttribute("id"),
        name: device.getAttribute("name"),
      })),
  };
};

export const getAudioDevices = async () => {
  const ret = await get("audiodev");
  const dom = parser.parseFromString(ret, "application/xml");

  let obj = {};
  dom.documentElement.querySelectorAll("object").forEach((entry) => {
    const tag = entry.getAttribute("tag");
    const source = entry.getAttribute("source");
    const id = entry.getAttribute("id");
    const objId = entry.getAttribute("objid");
    const customNode = entry.querySelector("custom");
    const customName = customNode ? customNode.getAttribute("name") : "";

    obj[tag || String(customName).replace(/\s/g, "_").toLowerCase()] = {
      id,
      source,
      objId,
      customName,
    };
  });

  return obj;
};

export const setAudioDevices = async (id, source) => {
  const ret = await get(`audiodev:${id}`);
  const dom = parser.parseFromString(ret, "application/xml");

  const node = dom.querySelector(`object`);

  if (node) {
    node.setAttribute("source", source);
  }

  await set(`audiodev:${id}`, dom.documentElement.outerHTML);
};

export const getAudioEffects = async (id) => {
  const ret = await get(`audiodev:${id}`);
  const dom = parser.parseFromString(ret, "application/xml");

  const param = dom.querySelector("param");
  const delay = param ? param.getAttribute("delay") : null;

  const effectNodes = dom.querySelectorAll("effect");
  const effects = Array.from(effectNodes).reduce((stack, node) => {
    const name = node.getAttribute("name");
    const id = node.getAttribute("id");
    const config = node.getAttribute("config");

    let entry =
      stack[id] && !Array.isArray(stack[id]) ? [stack[id]] : stack[id];

    if (entry) {
      entry.push({
        id,
        name,
        config,
      });
    } else {
      entry = {
        id,
        name,
        config,
      };
    }

    return {
      ...stack,
      [id]: entry,
    };
  }, {});

  // Check if the audio effects that we want to test out is present, if not, we'll just add it
  if (!effects.webrtxns && !effects.nvrtxns) {
    effects.webrtxns = {
      id: "webrtxns",
      name: "webrtxns",
      config: "Enabled=0,IntensityRatio=1.0,Level=2",
    };
  }

  if (!effects.gain) {
    effects.gain = {
      id: "gain",
      name: "gain",
      config: "enable:1&gain:0.02&latency:2000000",
    };
  }

  if (!effects["dmo:parameq"]) {
    effects["dmo:parameq"] = [
      {
        id: "dmo:parameq",
        name: "dmo:parameq",
        config: "Center:265&Bandwidth:16&Gain:7",
      },
      {
        id: "dmo:parameq",
        name: "dmo:parameq",
        config: "Center:3200&Bandwidth:8&Gain:-7",
      },
      {
        id: "dmo:parameq",
        name: "dmo:parameq",
        config: "Center:12800&Bandwidth:16&Gain:7",
      },
    ];
  }

  if (!effects["dmo:compressor"]) {
    effects["dmo:compressor"] = {
      id: "dmo:compressor",
      name: "dmo:compressor",
      config: "Threshold:-16&Ratio:8&Attack:5&Release:100&Gain:4",
    };
  }

  return {
    delay,
    ...effects,
  };
};

export const setAudioEffects = async (id, name, value, index) => {
  const ret = await get(`audiodev:${id}`);
  const dom = parser.parseFromString(ret, "application/xml");

  if (name === "delay") {
    const node = dom.querySelector("param");
    node.setAttribute("delay", value);
  } else if (typeof index !== "undefined") {
    const nodes = dom.querySelectorAll(`effect[name="${name}"]`);
    let node = nodes[index];

    if (!node) {
      node = dom.createElement("effect");
      node.setAttribute("name", name);
      node.setAttribute("id", name);

      const obj = dom.querySelector("object");
      obj.appendChild(node);
    }

    node.setAttribute("config", value);
  } else {
    let node = dom.querySelector(`effect[name="${name}"]`);

    if (!node) {
      node = dom.createElement("effect");
      node.setAttribute("name", name);
      node.setAttribute("id", name);

      const obj = dom.querySelector("object");
      obj.appendChild(node);
    }

    node.setAttribute("config", value);
  }

  await set(`audiodev:${id}`, dom.documentElement.outerHTML);
};
