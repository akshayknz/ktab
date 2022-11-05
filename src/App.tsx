import { MantineProvider, Navbar, Text } from "@mantine/core";
import Home from "./components/pages/home";
import { Layout } from "./components/ui/layout";
import { AuthProvider } from "./components/data/contexts/AuthProvider";
import configureStore from "./components/data/contexts/redux/configureStore";
import { Provider } from "react-redux";

function App() {
  return (
    <Provider store={configureStore}>
      <AuthProvider>
        <MantineProvider
          theme={{ colorScheme: "dark" }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Layout>
            <Home />
          </Layout>
        </MantineProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
