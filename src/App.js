import React, { useState, useCallback, useEffect } from 'react';
import { parse, transpose, prettyPrint } from 'chord-magic'

import generatePDF from './lib/generate-pdf';

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
  const [uri, setUri] = useState('https://tabs.ultimate-guitar.com/tab/hillsong-united/heart-of-worship-chords-1012850');

  const [chords, setChords] = useState('paste a ultimate-guitar.com link and press `Load Song`..');
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');

  const [parsingStyle, setParsingStyle] = useState("0");
  const [simplify, setSimplify] = useState(false);

  const [transposeStep, _setTransposeStep] = useState(0);
  const [transposedChords, setTransposedChords] = useState(chords);

  const setTransposeStep = (diff) => {
    const newStep = Math.min(12, Math.max(-12, transposeStep + diff));
    _setTransposeStep(newStep);
  }

  const renderChords = useCallback(() => formatChords(transposedChords), [transposedChords]);
  const downloadPdf = useCallback(() => generatePDF(artist, song, transposedChords), [artist, song, transposedChords]);

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

  useEffect(() => {
    const parseOptions = {};

    let transChords = chords.split(/\[ch\]|\[\/ch\]/g);
    let regex = [];

    switch(parsingStyle) {
      case "1":
        parseOptions.naming = 'NorthernEuropean';
        break;

      case "2":
        parseOptions.naming = 'SouthernEuropean';
        break;

      case "0":
      default:
        break;
    }

    for (let i = 1; i <= transChords.length; i += 2) {
      const chord = transChords[i];      

      if (chord) {
        try {          
          const parsedChord = parse(chord, parseOptions);
          const prettyChord = prettyPrint(parsedChord);

          const transChord = transpose(parsedChord, transposeStep);

          if (simplify) {
            delete transChord.extended;
            delete transChord.suspended;
            delete transChord.added;
            delete transChord.overridingRoot;
          }          

          const prettyTransChord = prettyPrint(transChord);

          const chordsDiff = prettyTransChord.length - prettyChord.length;   
          const chordsDiffPos = Math.abs(chordsDiff);

          const replacer = chordsDiff >= 0 ? '-'.repeat(chordsDiff) : ' '.repeat(chordsDiffPos);          

          transChords[i] = `[ch]${prettyTransChord}[/ch]`;
          transChords[i] += replacer;
  
          if (chordsDiff >= 0) {
            regex.push(replacer + ' '.repeat(chordsDiff));
          }
        } catch (error) {
          console.info('failed to transpose', chord);
        }
      }
    }

    regex = regex.filter(r => r.length > 1);
    regex = [...new Set(regex)];

    transChords = transChords.join('')
    .replace(new RegExp(regex.join('|'), 'gm'), '')
    .replace(new RegExp('-+(\\n|\\r|\\S)', 'gm'), '$1')
    .replace(/\[\/ch\]\s\[ch\]/g, '[/ch]  [ch]')
    .replace(/\[\/ch\]\[ch\]/g, '[/ch] [ch]')
    .replace(/\[\/ch\](\w)/g, '[/ch] $1');

    setTransposedChords(transChords);
  }, [transposeStep, chords, parsingStyle, simplify]);

  return (
    <>
      <div className="controls">
        <input type="text" value={uri} onChange={e => setUri(e.target.value)} />
        <button onClick={loadSong}>LOAD SONG</button>
        <button onClick={downloadPdf}>DOWNLOAD PDF</button>

        <select value={parsingStyle} onChange={(e) => setParsingStyle(e.target.value)}>
            <option value="0">NORMAL</option>
            <option value="1">NORTHERN EUROPEAN</option>
            <option value="2">SOUTHERN EUROPEAN</option>
        </select>

        <div className="transpose">
          <button onClick={() => setTransposeStep(-1)}>-</button>
          TRANSPOSE ({ transposeStep })
          <button onClick={() => setTransposeStep(1)}>+</button>
        </div>

        <label>
          <input type="checkbox" checked={simplify} onChange={(e) => setSimplify(e.target.checked)} />
          SIMPLIFY
        </label>
      </div>

      <div className="sheet">
        <div className="artist">{artist}</div>
        <div className="song">{song}</div>
        <div className="chords" dangerouslySetInnerHTML={renderChords(transposedChords)}></div>
      </div>
    </>
  );
}

export default App;
