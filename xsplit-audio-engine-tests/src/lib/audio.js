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
    const details = { id, name, config };

    if (name === "webrtxns" || name === "nvrtxns") {
      return {
        ...stack,
        noise_suppression: {
          label: "Noise Suppression",
          ...details,
        },
      };
    }

    if (name === "gain") {
      return {
        ...stack,
        noise_gate: {
          label: "Noise Gate",
          ...details,
        },
      };
    }

    if (name === "dmo:parameq") {
      return {
        ...stack,
        parametric_equalizer: stack.parametric_equalizer
          ? {
              ...stack.parametric_equalizer,
              data: [...stack.parametric_equalizer.data, details],
            }
          : {
              label: "Parametric Equalizer",
              data: [details],
            },
      };
    }

    if (name === "dmo:compressor") {
      return {
        ...stack,
        compressor: {
          label: "Compressor",
          details,
        },
      };
    }

    return stack;
  }, {});

  // Check if the audio effects that we want to test out is present, if not, we'll just add it
  if (!effects.noise_suppression) {
    effects.noise_suppression = {
      label: "Noise Suppression",
      id: "noise_suppression",
      name: "webrtxns",
      config: "Enabled=0,IntensityRatio=1.0,Level=2",
    };
  }

  if (!effects.noise_gate) {
    effects.noise_gate = {
      label: "Noise Gate",
      id: "noise_gate",
      name: "gain",
      config: "enable:1&gain:0.02&latency:2000000",
    };
  }

  if (!effects.parametric_equalizer) {
    effects.parametric_equalizer = {
      label: "Parametric Equalizer",
      data: [
        {
          id: "dmo:parameq:l",
          name: "dmo:parameq",
          config: "Center:265&Bandwidth:16&Gain:7",
        },
        {
          id: "dmo:parameq:c",
          name: "dmo:parameq",
          config: "Center:3200&Bandwidth:8&Gain:-7",
        },
        {
          id: "dmo:parameq:r",
          name: "dmo:parameq",
          config: "Center:12800&Bandwidth:16&Gain:7",
        },
      ],
    };
  }

  if (!effects.compressor) {
    effects.compressor = {
      label: "Compressor",
      id: "dmo:compressor",
      name: "dmo:compressor",
      config: "Threshold:-16&Ratio:8&Attack:5&Release:100&Gain:4",
    };
  }

  let params = {};
  if (delay !== null) {
    params = {
      delay,
    };
  }

  return {
    params,
    effects,
  };
};

export const setAudioEffect = async (id, name, item) => {
  const ret = await get(`audiodev:${id}`);
  const dom = parser.parseFromString(ret, "application/xml");

  if (name === "noise_suppression") {
    let key = item.name;
    let node = dom.querySelector(`effect[name="${key}"]`);

    if (!node) {
      key = item.name === "webrtxns" ? "nvrtxns" : "webrtxns";
      node = dom.querySelector(`effect[name="${key}"]`);
    }

    if (!node) {
      node = dom.createElement("effect");
      node.setAttribute("name", item.name);
      node.setAttribute("id", item.name);

      const obj = dom.querySelector("object");
      obj.appendChild(node);
    }

    node.setAttribute("config", item.config);
  } else if (name === "parametric_equalizer") {
    // We ought to add all of the data points...
    const nodes = dom.querySelectorAll(`effect[name="${name}"]`);
    let counter = 0;
    nodes.forEach((node, index) => {
      node.setAttribute("config", item.data[index]?.config || "");
      counter++;
    });

    const obj = dom.querySelector("object");
    while (counter < item.data.length) {
      const node = dom.createElement("effect");
      node.setAttribute("name", item.data[counter]?.name);
      node.setAttribute("id", item.data[counter]?.name);
      node.setAttribute("config", item.data[counter]?.config || "");

      obj.appendChild(node);
      counter++;
    }
  } else {
    let node = dom.querySelector(`effect[name="${item.name}"]`);

    if (!node) {
      node = dom.createElement("effect");
      node.setAttribute("name", item.name);
      node.setAttribute("id", item.name);

      const obj = dom.querySelector("object");
      obj.appendChild(node);
    }

    node.setAttribute("config", item.config);
  }

  console.log(dom.documentElement.outerHTML);
  await set(`audiodev:${id}`, dom.documentElement.outerHTML);
};
