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
        <Layout>
          <Switch>
            <Route path="/create">
              <Create />
            </Route>
            <Route path="/stake">
              <Stake />
            </Route>
            <Route path="/exchange">
              <Exchange />
            </Route>
            <Route exact path="/loan">
              <Loan />
            </Route>
            <Route exact path="/market">
              <CollateralNfts />
            </Route>
            <Route path="/test">
              <Test />
            </Route>
            <Route path="/">
              
            </Route>
          </Switch>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
