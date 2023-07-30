import { Box, CssBaseline } from "@mui/material";
import NavBarCentralised from "./NavBarCentralised";

const Layout = function (props: any) {
  return (
    <Box>
      <CssBaseline></CssBaseline>
      <NavBarCentralised></NavBarCentralised>
      {props.children}
    </Box>
  );
};
export default Layout;
