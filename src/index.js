import React from 'react';
import ReactDOM from 'react-dom';

import { Grommet } from 'grommet';
import { grommet } from 'grommet/themes';

import App from './App';

ReactDOM.render(
  <Grommet theme={grommet}>
    <App />
  </Grommet>,
  document.getElementById('root')
);
