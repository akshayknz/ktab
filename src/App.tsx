import React from 'react';
import { MantineProvider, Navbar, Text } from '@mantine/core';
import Home from './components/pages/home';
import {Layout} from './components/ui/layout';
import { AuthProvider } from './components/data/contexts/AuthProvider';
import { auth } from './components/data/firebaseConfig';

function App() {

  return (
    <AuthProvider>
      <>
      <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
        <Layout>
          <Home />
        </Layout>
      </MantineProvider>
      </>
    </AuthProvider>
  );
}

export default App;
