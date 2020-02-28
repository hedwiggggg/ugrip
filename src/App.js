import React, { useState, useCallback } from 'react';
import generatePdf from './lib/generate-pdf';

import './App.css';

function formatChords(chords) {
  let formattedChords = chords;

  formattedChords = formattedChords.replace(/\[ch\]/g, '<b>');
  formattedChords = formattedChords.replace(/\[\/ch\]/g, '</b>');

  formattedChords = formattedChords.replace(/\[tab\]/g, '<div>');
  formattedChords = formattedChords.replace(/\[\/tab\]/g, '</div>');

  return { __html: formattedChords };
}

// taken from YagoLopez
// https://gist.github.com/YagoLopez
// https://gist.github.com/YagoLopez/1c2fe87d255fc64d5f1bf6a920b67484
function findInObject(obj, key) {
  let objects = [];

  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == 'object') {
      objects = objects.concat(findInObject(obj[i], key));
    } else if (i === key) {
      objects.push(obj[i]);
    }
  }

  return objects;
}

function App() {
  const [uri, setUri] = useState('https://tabs.ultimate-guitar.com/tab/chris-renzema/youre-the-only-one-chords-2709621');

  const [chords, setChords] = useState('paste a ultimate-guitar.com link and press `Load Song`..');
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');

  const renderChords = useCallback(() => formatChords(chords), [chords]);

  const loadSong = useCallback(() => {
    fetch(`https://cors-anywhere.glitch.me/${uri}`)
      .then(res => res.text())
      .then(text => {
        const div = document.createElement('div');
        div.innerHTML = text;

        const [store] = div.getElementsByClassName('js-store');
        const storeJson = store.getAttribute('data-content');
        const storeData = JSON.parse(storeJson);

        const [song_name] = findInObject(storeData, 'song_name');
        const [artist_name] = findInObject(storeData, 'artist_name');
        const [chords] = findInObject(storeData, 'content');        

        setArtist(artist_name);
        setSong(song_name);
        setChords(chords);
      });
  }, [uri]);

  const donwloadPdf = useCallback(() => generatePdf(artist, song, chords), [artist, song, chords]);

  return (
    <>
      <div className="controls">
        <input type="text" value={uri} onChange={e => setUri(e.target.value)} />
        <button onClick={loadSong}>Load Song</button>
        <button onClick={donwloadPdf}>Download PDF</button>
      </div>

      <div className="sheet">
        <div className="artist">{artist}</div>
        <div className="song">{song}</div>
        <div className="chords" dangerouslySetInnerHTML={renderChords(chords)}></div>
      </div>
    </>
  );
}

export default App;
