import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import {
  nameFromId,
  networkIdInHex,
} from "../signedContracts/scriptsDecentralised";
import { MyContext } from "../MyContext";

function ResponsiveAppBar(props: any) {
  const { acc } = React.useContext(MyContext);
  const pages: any = props.pages;
  const { setContracts, chainId, setDialogueText } =
    React.useContext(MyContext);
  const networkChangeHandler = async function (e: SelectChangeEvent) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkIdInHex.get(e.target.value) }], // chainId must be in hexadecimal numbers
      });
      await setContracts();
    } catch (e) {
      setDialogueText("Network Change Failed!");
      window.location.reload();
    }
  };
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar sx={{ mb: 7, pb: 1, backgroundColor: "inherit" }} position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Stack
            sx={{
              display: { xs: "none", md: "flex" },
            }}
            alignItems={"center"}
            direction="row"
            mr={5}
          >
            <CurrencyExchangeIcon
              sx={{
                color: "#111",
                fontSize: 80,
              }}
            ></CurrencyExchangeIcon>
            <Stack>
              <Stack>
                <Typography color={"#111"} fontSize={20} variant="h1">
                  {props.centralised ? "" : "DE"}CENTRALISED
                </Typography>
                <Typography color={"#111"} fontSize={25} variant="h1">
                  EXCHANGE
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page: any) => (
                <MenuItem key={page[0]} onClick={handleCloseNavMenu}>
                  <NavLink
                    activeStyle={{
                      textDecoration: "underline",
                      textUnderlineOffset: "0.2rem",
                    }}
                    style={{ textDecoration: "none" }}
                    to={page[1]}
                  >
                    <Typography color={"#000"} textAlign="center">
                      {page[0]}
                    </Typography>
                  </NavLink>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Stack
            sx={{ display: { xs: "flex", md: "none" }, flexGrow: 1 }}
            alignItems={"center"}
            direction="row"
          >
            <CurrencyExchangeIcon
              sx={{
                fontSize: 80,
                color: "#111",
              }}
            ></CurrencyExchangeIcon>
            <Stack>
              <Stack>
                <Typography color={"#111"} fontSize={20} variant="h1">
                  CENTRALISED
                </Typography>
                <Typography color={"#111"} fontSize={25} variant="h1">
                  EXCHANGE
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page: any) => (
              <NavLink
                style={{ textDecoration: "none" }}
                activeStyle={{
                  textDecoration: "underline #000",
                  textUnderlineOffset: "0.2rem",
                }}
                to={page[1]}
              >
                <Button
                  key={page[0]}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    color: "#fff",
                    display: "block",
                  }}
                >
                  {page[0]}
                </Button>
              </NavLink>
            ))}
          </Box>

          <Stack alignItems={"center"} sx={{ flexGrow: 0, mb: 0 }} spacing={0}>
            <FormControl variant="standard" sx={{ m: 0, p: 0, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-label">
                {nameFromId.get(String(chainId!))}
              </InputLabel>
              <Select
                sx={{ color: "black" }}
                renderValue={(p) => {
                  if (p == chainId) return nameFromId.get(p);
                }}
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                onChange={networkChangeHandler}
              >
                {chainId != "11155111" && (
                  <MenuItem value={"11155111"}>Sepolia</MenuItem>
                )}
                {chainId != "80001" && (
                  <MenuItem value={"80001"}>Mumbai</MenuItem>
                )}
                {chainId != "97" && <MenuItem value={"97"}>BSC</MenuItem>}
              </Select>
            </FormControl>
            <Typography mt={1} color="#333">
              {" "}
              acc: {acc?.slice(0, 5) + "..."}
            </Typography>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
