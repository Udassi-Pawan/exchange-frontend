import { Box, CssBaseline } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveNavBar";
const pages = [
  ["NFT", "/decentralised/nft"],
  ["LOAN", "/decentralised/loan"],
  ["STAKE", "/decentralised/stake"],
  ["EXCHANGE", "/decentralised/exchange"],
  ["VALIDATORS", "/decentralised/validators"],
  ["MARKETPLACE", "/decentralised/market"],
];
const Layout = function (props: any) {
  return (
    <Box>
      <CssBaseline></CssBaseline>
      <ResponsiveAppBar pages={pages} />
      {props.children}
    </Box>
  );
};
export default Layout;
