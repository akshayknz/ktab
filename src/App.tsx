import React from 'react';
import { MantineProvider, Navbar, Text } from '@mantine/core';
import Home from './components/pages/home';
import {Layout} from './components/ui/layout';
import { AuthProvider } from './components/data/contexts/AuthProvider';
import { auth } from './components/data/firebaseConfig';
import configureStore from './components/data/contexts/redux/configureStore';
import { Provider } from 'react-redux';

function App() {

  return (
    <AuthProvider>
      <Provider store={configureStore}>
      <MantineProvider theme={{ colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
        <Layout>
          <Home />
        </Layout>
      </MantineProvider>
      </Provider>
    </AuthProvider>
  );
}

export default App;
