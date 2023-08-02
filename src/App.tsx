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
import { exchangeAddressFromIdCentralised } from "./signedContracts/scriptsCentralised";
import abiExchangeCentralised from "./contracts/centralised/exchange.json";
import abiExchangeDecentralised from "./contracts/decentralised/exchange.json";
import abiNFTCentralised from "./contracts/centralised/ExchangeNFT.json";
import abiNFTDecentralised from "./contracts/decentralised/ExchangeNFT.json";
import { exchangeAddressFromIdDecentralised } from "./signedContracts/scriptsDecentralised";
import Validators from "./pages/Decentralised/Validators";

function App() {
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [dialogueText, setDialogueText] = useState<string | null>("");

  const [exchangeContractCentralised, setExchangeContractCentralised] =
    useState<any>(null);

  const [exchangeContractDecentralised, setExchangeContractDecentralised] =
    useState<any>(null);
  const [nftContractCentralised, setNftContractCentralised] =
    useState<any>(null);
  const [nftContractDecentralised, setNftContractDecentralised] =
    useState<any>(null);

  window.ethereum.on("accountsChanged", async function () {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setAcc((await provider.listAccounts())[0]);
  });

  async function setContracts() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    setAcc((await provider.listAccounts())[0]);
    const { chainId } = await provider.getNetwork();
    const chainIdString = String(chainId);
    setChainId(chainIdString);
    let contractAddressCentralised =
      exchangeAddressFromIdCentralised.get(chainIdString);
    const exchangeConCen = new ethers.Contract(
      contractAddressCentralised!,
      abiExchangeCentralised.abi,
      signer
    );
    let contractAddressDecentralised =
      exchangeAddressFromIdDecentralised.get(chainIdString);
    const exchangeConDec = new ethers.Contract(
      contractAddressDecentralised!,
      abiExchangeDecentralised.abi,
      signer
    );
    setExchangeContractCentralised(exchangeConCen);
    setExchangeContractDecentralised(exchangeConDec);
    const nftContractAddress = await exchangeConCen.exchangeNftAddr();
    const nftContractAddressDec = await exchangeConDec.exchangeNftAddr();
    setNftContractCentralised(
      new ethers.Contract(nftContractAddress!, abiNFTCentralised.abi, signer)
    );
    setNftContractDecentralised(
      new ethers.Contract(
        nftContractAddressDec!,
        abiNFTDecentralised.abi,
        signer
      )
    );
  }

  async function changeNetworkEvent(e: any) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x" + String(Number(e.target.value).toString(16)),
          },
        ],
      });
      await setContracts();
    } catch (e) {
      setDialogueText("Transaction Failed!");
      window.location.reload();
    }
  }

  useEffect(() => {
    setContracts();
  }, [chainId, acc]);

  return (
    <MyContext.Provider
      value={{
        setAcc,
        acc,
        dialogueText,
        setDialogueText,
        chainId,
        setChainId,
        exchangeContractCentralised,
        nftContractCentralised,
        exchangeContractDecentralised,
        nftContractDecentralised,
        setLoading,
        changeNetworkEvent,
        setContracts,
      }}
    >
      <ThemeProvider theme={mytheme}>
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading!}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyDialogue />
        <Router>
          <Switch>
            <Route exact path="/">
              <Start />
            </Route>
            <Route exact path="/decentralised/nft">
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
            <Route exact path="/decentralised/validators">
              <LayoutDecentralised>
                <Validators />
              </LayoutDecentralised>
            </Route>
            <Route exact path="/test">
              <Test />
            </Route>
            <ThemeProvider theme={centerTheme}>
              <LayoutCentralised>
                <Route path="/centralised/nft">
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
                <Route exact path="/centralised/kyc">
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
