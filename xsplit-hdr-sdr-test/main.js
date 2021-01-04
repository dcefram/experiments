import 'regenerator-runtime/runtime'

import Xjs from 'xjs-framework/core/xjs';
import Scene from 'xjs-framework/core/scene';
import Item from 'xjs-framework/core/item';

const xjs = new Xjs();
const scene = new Scene(xjs);
let selectedItem = { id: '', srcId: '' };

scene.getActive().then(async sceneInfo => {
  const items = await scene.getItems(sceneInfo.id);

  // Render items of current scene to combobox
  const combobox = document.getElementById('items');

  items.forEach((item, index) => {
    const option = document.createElement('option');
    option.innerText = item.name;
    option.value = item.id;
    option.dataset.srcId = item.srcid;

    if (index === 0) {
      selectedItem = { id: item.id, srcId: item.srcid };
    }

    combobox.appendChild(option);
  });

  combobox.addEventListener('change', (event) => {
    console.log(`selected item changed: ${event.target.value}`);
    selectedItem = { id: event.target.value, srcId: event.target.dataset.srcId };
  });

  // Add button event
  const button = document.getElementById('toggle');
  button.addEventListener('click', async () => {
    const effectsProp = {
      key: 'prop:effects',
    };

    const item = new Item(xjs);

    // check if it currently has the effect
    const output = document.getElementById('output');
    const curr = await item.getProperty(effectsProp, {
      id: selectedItem.id,
      srcId: selectedItem.srcId
    });

    let value = '<effects><effect id="internal:hdr_to_sdr" cfg="" /></effects>';
    if (curr.includes('internal:hdr_to_sdr')) {
      value = '<effects/>'
      output.textContent = 'Enabled';
    }

    await item.setProperty(effectsProp, {
      id: selectedItem.id,
      srcId: selectedItem.srcId,
      value,
    });
    output.textContent = output.textContent === 'Enabled' ? 'Disabled' : 'Enabled';
  });
});
