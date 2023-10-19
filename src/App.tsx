import {
  ColorScheme,
  ColorSchemeProvider,
  DefaultMantineColor,
  MantineProvider,
  Navbar,
  Text,
} from "@mantine/core";
import Home from "./components/pages/home";
import { Layout } from "./components/ui/layout";
import { AuthProvider } from "./components/data/contexts/AuthProvider";
import configureStore from "./components/data/contexts/redux/configureStore";
import { Provider, useDispatch } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./components/data/contexts/AuthContext";
import { setUserId } from "./components/data/contexts/redux/actions";
import { BrowserRouter, Route, Routes, useRoutes } from "react-router-dom";
import { DeepPartial } from "@reduxjs/toolkit";
import { useLocalStorage } from "@mantine/hooks";
function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "colorScheme",
    defaultValue: "dark",
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  return (
    <Provider store={configureStore}>
      <AuthProvider>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            theme={{
              colorScheme: colorScheme,
              colors: additionalColors,
            }}
            withGlobalStyles
            withNormalizeCSS
          >
            <Layout>
              <BrowserRouter>
                <Stuff />
              </BrowserRouter>
            </Layout>
          </MantineProvider>
        </ColorSchemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;

const element = <Home />;
const Stuff = () =>
  useRoutes(
    ["/", "/:userid/:id", "/widgets","/org/:orgid"].map((path) => ({ path, element }))
  );

const additionalColors = {
  "black-alpha": [
    "#00000000",
    "#00000020",
    "#00000040",
    "#00000060",
    "#00000080",
    "#000000a3",
    "#000000b3",
    "#000000c3",
    "#000000d3",
    "#000000f3",
  ],
  "white-alpha": [
    "#ffffff00",
    "#ffffff20",
    "#ffffff40",
    "#ffffff60",
    "#ffffff80",
    "#ffffffa3",
    "#ffffffb3",
    "#ffffffc3",
    "#ffffffd3",
    "#fffffff3",
  ],
} as DeepPartial<
  Record<
    DefaultMantineColor,
    [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string
    ]
  >
>;
