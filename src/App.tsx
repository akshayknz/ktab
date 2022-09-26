import React from 'react';
import { MantineProvider, Navbar, Text } from '@mantine/core';
import Home from './components/pages/home';
import {Layout} from './components/ui/layout';

function App() {

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <Layout>
        <Home />
      </Layout>
    </MantineProvider>
  );
}

export default App;
