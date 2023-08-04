import { Box, CssBaseline } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveNavBar";
import { useContext, useEffect } from "react";
import { ethers } from "ethers";
import { MyContext } from "../MyContext";
const pages = [
  ["NFT", "/decentralised/nft"],
  ["DEPOSITS", "/decentralised/deposits"],
  ["EXCHANGE", "/decentralised/exchange"],
  ["LOAN", "/decentralised/loan"],
  ["MARKETPLACE", "/decentralised/market"],
  ["VALIDATORS", "/decentralised/validators"],
];
const Layout = function (props: { children: React.ReactNode }) {
  const { setDialogueText } = useContext(MyContext);
  useEffect(() => {
    (async function () {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      if (!(await provider!.listAccounts())[0])
        return setDialogueText(
          "Some features might not work without metamask enabled."
        );
    })();
  }, []);
  return (
    <Box m={2}>
      <CssBaseline></CssBaseline>
      <ResponsiveAppBar pages={pages} />
      {props.children}
    </Box>
  );
};
export default Layout;
