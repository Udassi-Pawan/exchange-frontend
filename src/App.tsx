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
function App() {
  return (
    <ThemeProvider theme={mytheme}>
      <Router>
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
          <Route exact path="/">
            <Loan />
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
