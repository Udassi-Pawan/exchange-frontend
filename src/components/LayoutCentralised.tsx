import { Box, CssBaseline } from "@mui/material";
import ResponsiveAppBar from "./ResponsiveNavBar";

const pages = [
  ["NFT", "/centralised/nft"],
  ["STAKE", "/centralised/stake"],
  ["EXCHANGE", "/centralised/exchange"],
  ["KYC", "/centralised/kyc"],
  ["LOAN", "/centralised/loan"],
  ["MARKETPLACE", "/centralised/market"],
];

const Layout = function (props: any) {
  return (
    <Box>
      <CssBaseline></CssBaseline>
      <ResponsiveAppBar pages={pages} centralised={true}></ResponsiveAppBar>
      {props.children}
    </Box>
  );
};
export default Layout;
