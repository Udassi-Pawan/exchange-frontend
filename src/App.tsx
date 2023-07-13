import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Create from "./pages/Create";
import Stake from "./pages/Stake";
import Exchange from "./pages/Exchange";
import Loan from "./pages/Loan";
function App() {
  return (
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
      </Switch>
    </Router>
  );
}

export default App;
