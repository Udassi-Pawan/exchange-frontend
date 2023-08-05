import { Box, CssBaseline } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveNavBar";
import { useContext, useEffect } from "react";
import { ethers } from "ethers";
import { MyContext } from "../MyContext";

const pages = [
  ["NFT", "/centralised/nft"],
  ["DEPOSITS", "/centralised/deposits"],
  ["EXCHANGE", "/centralised/exchange"],
  ["KYC", "/centralised/kyc"],
  ["LOAN", "/centralised/loan"],
  ["MARKETPLACE", "/centralised/market"],
];

const Layout = function (props: { children: React.ReactNode }) {
  const { setDialogueText } = useContext(MyContext);
  useEffect(() => {
    (async function () {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        if (!(await provider!.listAccounts())[0])
          return setDialogueText(
            "Some features might not work without metamask enabled."
          );
      } catch (e) {
        setDialogueText(
          "Some features might not work without metamask enabled."
        );
      }
    })();
  }, []);
  return (
    <Box m={2}>
      <CssBaseline></CssBaseline>
      <ResponsiveAppBar pages={pages} centralised={true}></ResponsiveAppBar>
      {props.children}
    </Box>
  );
};
export default Layout;
