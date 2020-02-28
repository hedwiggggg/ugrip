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
      const storeData = store.getAttribute('data-content');

      const { tab, tab_view } = JSON.parse(storeData).store.page.data;
    
      const { song_name, artist_name } = tab;
      const chords = tab_view.wiki_tab.content;
    
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
        <div className="artist">{ artist }</div>
        <div className="song">{ song }</div>
        <div className="chords" dangerouslySetInnerHTML={renderChords(chords)}></div>
      </div>
    </>
  );
}

export default App;
