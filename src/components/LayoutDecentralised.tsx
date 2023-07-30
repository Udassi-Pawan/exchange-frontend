import { Box, CssBaseline } from "@mui/material";
import NavBarDecentralised from "./NavBarDecentralised";

const Layout = function (props: any) {
  return (
    <Box>
      <CssBaseline></CssBaseline>
      <NavBarDecentralised></NavBarDecentralised>
      {props.children}
    </Box>
  );
};
export default Layout;
