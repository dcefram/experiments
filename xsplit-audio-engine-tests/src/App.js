import { useEffect, useState } from "react";

import { get, set } from "./lib/xjs";
import {
  getAvailableDevices,
  getAudioDevices,
  getAudioEffects,
  setAudioDevices,
  setAudioEffects,
} from "./lib/audio";

import "./App.css";

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
          {Object.keys(speakerEffects).map((key) => {
            const item = speakerEffects[key];

            if (Array.isArray(item)) {
              return item.map((_item, index) => (
                <div key={`speaker-${_item.id}-${index}`}>
                  <p>{key}</p>
                  <input
                    value={_item.config}
                    onChange={(event) => {
                      item[index].config = event.target.value;
                      setSpeakerEffects({
                        ...speakerEffects,
                        [key]: item,
                      });
                    }}
                    onBlur={() => {
                      setAudioEffects("1", key, _item.config, index);
                    }}
                  />
                </div>
              ));
            }

            return (
              <div key={`speaker-${key}`}>
                <p>{key}</p>
                <input
                  value={typeof item === "object" ? item.config : item}
                  onChange={(event) => {
                    setSpeakerEffects({
                      ...speakerEffects,
                      [key]:
                        item === "object"
                          ? {
                              ...item,
                              config: event.target.value,
                            }
                          : event.target.value,
                    });
                  }}
                  onBlur={() => {
                    setAudioEffects(
                      "1",
                      key,
                      item === "object" ? item.config : item
                    );
                  }}
                />
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
                setAudioDevices("0", value.target.value);
              }}
            >
              {mics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {Object.keys(micEffects).map((key) => {
            const item = micEffects[key];

            if (Array.isArray(item)) {
              return item.map((_item, index) => (
                <div key={`mic-${_item.id}-${index}`}>
                  <p>{key}</p>
                  <input
                    value={_item.config}
                    onChange={(event) => {
                      item[index].config = event.target.value;
                      setMicEffects({
                        ...micEffects,
                        [key]: item,
                      });
                    }}
                    onBlur={() => {
                      setAudioEffects("0", key, _item.config, index);
                    }}
                  />
                </div>
              ));
            }

            return (
              <div key={`mic-${key}`}>
                <p>{key}</p>
                <input
                  value={typeof item === "object" ? item.config : item}
                  onChange={(event) => {
                    setMicEffects({
                      ...micEffects,
                      [key]:
                        item === "object"
                          ? {
                              ...item,
                              config: event.target.value,
                            }
                          : event.target.value,
                    });
                  }}
                  onBlur={() => {
                    setAudioEffects(
                      "0",
                      key,
                      item === "object" ? item.config : item
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
