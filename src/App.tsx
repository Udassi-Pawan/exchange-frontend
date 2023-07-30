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
import { MyContext } from "./MyContext";
import { useEffect, useState } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import MyDialogue from "./components/MyDialogue";
import { ethers } from "ethers";
import { exchangeAddressFromId } from "./signedContracts/scriptsCentralised";
import abiExchangeCentralised from "./contracts/centralised/exchange.json";

function App() {
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [dialogue, setDialogue] = useState<boolean | null>(null);
  const [dialogueText, setDialogueText] = useState<string | null>("awf");

  async function setCentralised() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    setAcc((await provider.listAccounts())[0]);
    const { chainId } = await provider.getNetwork();
    const chainIdString = String(chainId);
    setChainId(chainIdString);
    let contractAddress = exchangeAddressFromId.get(chainIdString);
    const exchangeContract = new ethers.Contract(
      contractAddress!,
      abiExchange.abi,
      signer
    );
    const nftContractAddress = await exchangeContract.exchangeNftAddr();
    nftContract = new ethers.Contract(nftContractAddress!, abiNFT.abi, signer);
  }
  useEffect(() => {
    setCentralised();
  });
  return (
    <MyContext.Provider
      value={{
        acc,
        setAcc,
        setDialogue,
        dialogue,
        dialogueText,
        setDialogueText,
      }}
    >
      <ThemeProvider theme={mytheme}>
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading! || dialogue!}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyDialogue />
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
    </MyContext.Provider>
  );
}

export default App;
