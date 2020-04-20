// populate history right away
loadHistory();

// todo this should be wrapped in a method/class/constructor and not floating out here
const actionButton = document.getElementById('brand-color-button');

actionButton.addEventListener('click', () => {
    // add contents of the text entry to local storage
    let userInput = document.getElementById('brand-color-field').value;
    // todo: check if local storage available
    // todo: add logic to prevent adding empty values to storage

    // todo: abstract this out to it's own method for re-use
    // Retrieve local storage or default to empty array
    let storage = JSON.parse(localStorage.getItem('palettes'));
    if (storage) {
        // todo: prevent adding duplicate items
        storage.push(userInput);
    }
    else {
        storage = [userInput];
    }

    // add our item to it and store back to local storage
    localStorage.setItem('palettes', JSON.stringify(storage));

    // Update our history section
    let itemsAsArray = extractValues(userInput);
    let markup = createPaletteFromValues(itemsAsArray);

    updateHistory(markup);
});

/**
 * Event listener to clear local storage.
 */
document.getElementById('clear-history').addEventListener('click', () => {
    clearHistory();
});

/**
 * Used for initial population from localStorage.
 */
function loadHistory() {
    // todo: hide the palette history if local storage is not available
    const storedPalettes = JSON.parse(localStorage.getItem('palettes'));
    // clear out any existing palettes (to support delete and update)
    historyMarkupDelete();
    if (storedPalettes && storedPalettes.length > 0) {
        let markup = '';
        storedPalettes.map(palette => {
            let values = extractValues(palette);
            markup = createPaletteFromValues(values);
            updateHistory(markup);
        });
    }
}

/**
 * Update the input history content.
 *
 * @param {String} markup
 */
function updateHistory(markup) {
    const historySection = document.getElementById('input-history');
    historySection.appendChild(markup);
}

/**
 * Create markup for a single palette.
 *
 * @param {array} items
 */
function createPaletteFromValues(items) {
    if (Array.isArray(items) === false) {
        return;
    }

    // create wrapper for this set
    let element = document.createElement('div');
    element.className = 'palette-set';

    // create each color swatch and add to the set
    // todo: replace this for with a different loop structure
    for (let i=0;i<items.length;i++) {
        let swatch = document.createElement('span');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = items[i];
        swatch.title = items[i];
        element.appendChild(swatch);

    }
    // todo: add copy-to-clipboard-link
    // add button to populate textarea
    const popButton = document.createElement('button');
    popButton.value = items;
    popButton.innerHTML = 'use this palette';
    // popButton.onclick = loadPalette;
    popButton.addEventListener('click', (e) => {
        const target = document.getElementById('brand-color-field');
        target.value = onePerLine(e.target.value);
    });
    element.appendChild(popButton);

    // Trash button for single element
    const trashButton = document.createElement('span');
    trashButton.className = 'swatch__delete';
    trashButton.title = 'delete this swatch';
    trashButton.dataset.swatch = items;
    // todo: make this text, change with css
    trashButton.innerHTML = '&#128465;'; // trash can icon
    trashButton.addEventListener('click', (e) => {
      deletePalette(items);
    });

    element.appendChild(trashButton);

    return element;
}

/**
 * Deletes stored palettes and refreshes interface.
 */
function clearHistory () {
    localStorage.removeItem('palettes');
    // remove the palettes from the page
    historyMarkupDelete();
}

/**
 * Removes palette set elements from DOM.
 */
function historyMarkupDelete() {
  let palettes = document.getElementsByClassName('palette-set');
  while (palettes[0]) {
    palettes[0].parentNode.removeChild(palettes[0]);
  }
}
/**
 * Delete a single item from the palette history
 *
 * @param {Array} paletteArray The palette to delete from local storage.
 *
 */
function deletePalette(paletteArray) {
  // stored values are \n separated strings so we change to that format
  const paletteString = onePerLine(paletteArray.toString());

  // Load storage and filter it to remove the palette
  const storage = JSON.parse(localStorage.getItem('palettes'));
  const updatedStorage = storage.filter((value, index, arr) => value != paletteString);

  // update local storage with remaining values and reload the interface
  localStorage.setItem('palettes', JSON.stringify(updatedStorage));
  loadHistory();
}

/**
 * Take comma separated color values and make one per line.
 *
 * @param {String} list
 * A comma separated string containing rgb or hex color values.
 *
 * @return {String}
 */
function onePerLine(list) {
    // First split hex values
    let string = list.replace(/(,#)/g, '\n#');
    // next split off rgb values
    string = string.replace(/(,r)/g, "\nr");

    return string;
}

/**
 * Extract separate color values from input.
 *
 * @param {String} stringInput
 *
 * @return {Array}
 */
function extractValues(stringInput) {
    // todo: validation and error handling
    let itemArray = stringInput.split('\n');

    return itemArray;
}

/**
 * Check if local storage is supported by client browser
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 */
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}


