import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Create from "./pages/Create";
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Create />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
