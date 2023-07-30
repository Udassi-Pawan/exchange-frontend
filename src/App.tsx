import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Create from "./pages/Decentralised/Create";
import Stake from "./pages/Decentralised/Stake";
import Exchange from "./pages/Decentralised/Exchange";
import Loan from "./pages/Decentralised/Loan";
import { ThemeProvider } from "@mui/material/styles";
import mytheme from "./MuiTheme";
import Test from "./pages/Decentralised/Test";
import LayoutDecentralised from "./components/LayoutDecentralised";
import LayoutCentralised from "./components/LayoutCentralised";
import CollateralNfts from "./pages/Decentralised/CollateralNfts";
import CollateralNftsCentralised from "./pages/Centralised/CollateralNfts";
import Start from "./pages/Start";
import GetJwt from "./pages/Centralised/GetJwt";
import SubmitKyc from "./pages/Centralised/SubmitKyc";
import CreateCentralised from "./pages/Centralised/Create";
import StakeCentralised from "./pages/Centralised/Stake";
import ExchangeCentralised from "./pages/Centralised/Exchange";
import LoanCentralised from "./pages/Centralised/Loan";
import centerTheme from "./MuiThemeCentralised";

function App() {
  return (
    <ThemeProvider theme={mytheme}>
      <Router>
        <Switch>
          <Route exact path="/">
            <Start />
          </Route>
          <Route exact path="/decentralised/create">
            <LayoutDecentralised>
              <Create />
            </LayoutDecentralised>
          </Route>
          <Route exact path="/decentralised/stake">
            <LayoutDecentralised>
              <Stake />
            </LayoutDecentralised>
          </Route>
          <Route exact path="/decentralised/exchange">
            <LayoutDecentralised>
              <Exchange />
            </LayoutDecentralised>
          </Route>
          <Route exact path="/decentralised/loan">
            <LayoutDecentralised>
              <Loan />
            </LayoutDecentralised>
          </Route>
          <Route exact path="/decentralised/market">
            <LayoutDecentralised>
              <CollateralNfts />
            </LayoutDecentralised>
          </Route>
          <Route exact path="/test">
            <Test />
          </Route>
          <ThemeProvider theme={centerTheme}>
            <LayoutCentralised>
              <Route path="/centralised/create">
                <CreateCentralised />
              </Route>
              <Route path="/centralised/stake">
                <StakeCentralised />
              </Route>
              <Route path="/centralised/exchange">
                <ExchangeCentralised />
              </Route>
              <Route path="/centralised/getjwt">
                <GetJwt />
              </Route>
              <Route exact path="/centralised/submitkyc">
                <SubmitKyc />
              </Route>
              <Route exact path="/centralised/loan">
                <LoanCentralised />
              </Route>
              <Route exact path="/centralised/market">
                <CollateralNftsCentralised />
              </Route>
            </LayoutCentralised>
          </ThemeProvider>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
