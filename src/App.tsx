import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Create from "./pages/Create";
import Stake from "./pages/Stake";
import Exchange from "./pages/Exchange";
import Loan from "./pages/Loan";
import { ThemeProvider } from "@mui/material/styles";
import mytheme from "./MuiTheme";
import Test from "./pages/Test";
import Layout from "./components/Layout";
import CollateralNfts from "./pages/CollateralNfts";
function App() {
  return (
    <ThemeProvider theme={mytheme}>
      <Router>
        <Switch>
          <Route path="/create">
            <Layout>
              <Create />
            </Layout>
          </Route>
          <Route path="/stake">
            <Layout>
              <Stake />
            </Layout>
          </Route>
          <Route path="/exchange">
            <Layout>
              <Exchange />
            </Layout>
          </Route>
          <Route exact path="/">
            <Layout>
              <Loan />
            </Layout>
          </Route>
          <Route exact path="/market">
            <Layout>
              <CollateralNfts />
            </Layout>
          </Route>
          <Route path="/test">
            <Test />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
