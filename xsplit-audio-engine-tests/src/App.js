import { useEffect, useState } from "react";

import { get, set } from "./lib/xjs";
import {
  getAvailableDevices,
  getAudioDevices,
  getAudioEffects,
  setAudioDevices,
  setAudioEffect,
} from "./lib/audio";

import "./App.css";

const objectIds = {
  mic: "0",
  speaker: "1",
};

function insertTo(arr, index, data) {
  return [...arr.slice(0, index), data, ...arr.slice(index + 1, arr.length)];
}

function App() {
  const [mic, setMic] = useState("");
  const [mics, setMics] = useState([]);
  const [micEffects, setMicEffects] = useState({});
  const [speaker, setSpeaker] = useState("");
  const [speakers, setSpeakers] = useState([]);
  const [speakerEffects, setSpeakerEffects] = useState({});

  useEffect(() => {
    (async () => {
      const devices = await getAvailableDevices();

      setMics(devices.mics);

      setSpeakers(devices.speakers);

      const xAudioDevices = await getAudioDevices();

      setMic(xAudioDevices.microphone?.source);
      setSpeaker(xAudioDevices.speakers?.source);

      setMicEffects(await getAudioEffects("0"));
      setSpeakerEffects(await getAudioEffects("1"));
    })();

    window.xget = get;
    window.xset = set;
  }, []);

  return (
    <div className="App">
      <header className="App-header">Testing new audio engine</header>
      <div className="cols">
        <div>
          <h3>Speakers</h3>
          <div className="mb-1">
            <p>Device</p>
            <select
              value={speaker}
              onChange={(value) => {
                setSpeaker(value.target.value);
                setAudioDevices("1", value.target.value);
              }}
            >
              {speakers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {Object.entries(speakerEffects?.effects || {}).map(([key, item]) => {
            return (
              <div key={`speaker-${item.id}`}>
                <p>{item.label}</p>
                {key === "noise_suppression" ? (
                  <input
                    value={item.name}
                    onChange={(event) => {
                      setSpeakerEffects({
                        ...speakerEffects,
                        effects: {
                          ...speakerEffects.effects,
                          [key]: {
                            ...speakerEffects.effects[key],
                            name: event.target.value,
                          },
                        },
                      });
                    }}
                    onBlur={() => {
                      if (item.name === "webrtxns" || item.name === "nvrtxns") {
                        setAudioEffect(objectIds.speaker, key, item);
                      }
                    }}
                  />
                ) : null}
                {item.data ? (
                  item.data.map((entry, index) => (
                    <div key={`speaker-${key}-${index}`}>
                      <input
                        value={entry.config}
                        onChange={(event) => {
                          setSpeakerEffects({
                            ...speakerEffects,
                            effects: {
                              ...speakerEffects.effects,
                              [key]: {
                                ...speakerEffects.effects[key],
                                data: insertTo(
                                  speakerEffects.effects[key].data,
                                  index,
                                  {
                                    ...speakerEffects.effects[key].data[index],
                                    config: event.target.value,
                                  }
                                ),
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          setAudioEffect(objectIds.speaker, key, item);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <input
                    value={item.config}
                    onChange={(event) => {
                      setSpeakerEffects({
                        ...speakerEffects,
                        effects: {
                          ...speakerEffects.effects,
                          [key]: {
                            ...speakerEffects.effects[key],
                            config: event.target.value,
                          },
                        },
                      });
                    }}
                    onBlur={() => {
                      setAudioEffect(objectIds.speaker, key, item);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div>
          <h3>Microphones</h3>
          <div className="mb-1">
            <p>Device</p>
            <select
              value={mic}
              onChange={(value) => {
                setMic(value.target.value);
                setAudioDevices(objectIds.mic, value.target.value);
              }}
            >
              {mics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {Object.entries(micEffects?.effects || {}).map(([key, item]) => {
            return (
              <div key={`mic-${item.id}`}>
                <p>{item.label}</p>
                {key === "noise_suppression" ? (
                  <input
                    value={item.name}
                    onChange={(event) => {
                      setMicEffects({
                        ...micEffects,
                        effects: {
                          ...micEffects.effects,
                          [key]: {
                            ...micEffects.effects[key],
                            name: event.target.value,
                          },
                        },
                      });
                    }}
                    onBlur={() => {
                      if (item.name === "webrtxns" || item.name === "nvrtxns") {
                        setAudioEffect(objectIds.mic, key, item);
                      }
                    }}
                  />
                ) : null}
                {item.data ? (
                  item.data.map((entry, index) => (
                    <div key={`mic-${item.id}-${index}`}>
                      <input
                        value={entry.config}
                        onChange={(event) => {
                          setMicEffects({
                            ...micEffects,
                            effects: {
                              ...micEffects.effects,
                              [key]: {
                                ...micEffects.effects[key],
                                data: insertTo(
                                  micEffects.effects[key].data,
                                  index,
                                  {
                                    ...micEffects.effects[key].data[index],
                                    config: event.target.value,
                                  }
                                ),
                              },
                            },
                          });
                        }}
                        onBlur={() => {
                          setAudioEffect(objectIds.mic, key, item);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <input
                    value={item.config}
                    onChange={(event) => {
                      setMicEffects({
                        ...micEffects,
                        effects: {
                          ...micEffects.effects,
                          [key]: {
                            ...micEffects.effects[key],
                            config: event.target.value,
                          },
                        },
                      });
                    }}
                    onBlur={() => {
                      setAudioEffect(objectIds.mic, key, item);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
