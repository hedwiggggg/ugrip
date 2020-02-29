import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from './vfs_fonts';

pdfMake.vfs = vfsFonts.pdfMake.vfs;

pdfMake.fonts = {
  'Roboto Mono': {
    normal: 'RobotoMono-Regular.ttf',
    bold: 'RobotoMono-Bold.ttf',
  },
};

const isOdd = i => i % 2 === 1;

function processChords(chords) {
  let processedChords = [];

  const tabs = chords.split(/\[tab\]|\[\/tab\]/g);
  const tabsAndChords = tabs.map(w => w.split(/\[ch\]|\[\/ch\]/g));
  const tabsAndChordsNoBr = tabsAndChords
    .map(w => w.map(c => c.replace(/\n/g, '')))
    .filter(w => !(w.length === 1 && w[0].length === 1));
  
  for (let i = 0; i < tabsAndChordsNoBr.length; i++) {
    const tabAndChords = tabsAndChordsNoBr[i];
    let line;
    
    if (Array.isArray(tabAndChords)) {
      let inline = [];

      for (let j = 0; j < tabAndChords.length; j++) {
        const chord = tabAndChords[j];
        
        if (isOdd(j)) {
          inline.push({ text: chord, bold: true });
        } else {
          inline.push(chord);
        }
      }

      line = { text: inline };
    } else {
      line = tabAndChords;
    }

    processedChords.push(line);
  }

  return processedChords;
}

export default (artist, song, chords) => {  
  const fileName = `chords_${artist}_${song}`;
  const fileNameFormatted = fileName.replace(/\W/g, '-').toLocaleLowerCase();

  const docDefinition = {
    pageSize: 'A4',

    content: [
      { text: artist, style: 'artist' },
      { text: song, style: 'song' },
      ' ',
      ...processChords(chords)
    ],

    defaultStyle: {
      font: 'Roboto Mono',
      fontSize: 8,
      preserveLeadingSpaces: true
    },

    styles: {
      artist: {
        fontSize: 12,
        bold: true
      },
      song: {
        fontSize: 10
      }
    },

    pageBreakBefore: (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) => {
      const isLastOnPage = followingNodesOnPage.length === 0;
      const isNotLastOfAll = nodesOnNextPage.length !== 0;

      return isLastOnPage && isNotLastOfAll && Array.isArray(currentNode.text);
    }
  };

  pdfMake.createPdf(docDefinition).download(fileNameFormatted);
};