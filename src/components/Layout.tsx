import { Box, CssBaseline } from "@mui/material";
import NavBar from "./NavBar";

const Layout = function (props: any) {
  return (
    <Box>
      <CssBaseline></CssBaseline>
      <NavBar></NavBar>
      {props.children}
    </Box>
  );
};
export default Layout;
