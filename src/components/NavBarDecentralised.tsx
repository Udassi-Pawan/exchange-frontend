import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { useContext, useEffect } from "react";
import { ethers } from "ethers";
import {
  nameFromId,
  networkIdInHex,
} from "../signedContracts/scriptsDecentralised";
import { MyContext } from "../MyContext";
const pages = [
  ["NFT", "/decentralised/nft"],
  ["LOAN", "/decentralised/loan"],
  ["STAKE", "/decentralised/stake"],
  ["EXCHANGE", "/decentralised/exchange"],
  ["VALIDATOR", "/decentralised/validator"],
  ["MARKETPLACE", "/decentralised/market"],
];

export default function NavBarDecentralised() {
  const { setDialogueText, chainId, setChainId, setAcc, acc } =
    useContext(MyContext);
  const theme = useTheme();
  useEffect(() => {
    (async function () {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      setAcc((await provider.listAccounts())[0]);
    })();
  }, [chainId, acc]);
  const networkChangeHandler = async function (e: SelectChangeEvent) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkIdInHex.get(e.target.value) }], // chainId must be in hexadecimal numbers
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
    } catch (e) {
      setDialogueText("Network Change Failed!");
      window.location.reload();
    }
  };
  return (
    <Box
      sx={{
        mt: 2,
      }}
    >
      <Stack
        alignItems={"center"}
        direction="row"
        justifyContent="space-between"
      >
        <Stack alignItems={"center"} spacing={10} direction="row">
          <Stack alignItems={"center"} direction="row">
            <CurrencyExchangeIcon
              color="primary"
              sx={{
                fontSize: 80,
              }}
            ></CurrencyExchangeIcon>
            <Stack>
              <Stack>
                <Typography
                  fontSize={20}
                  variant="h1"
                  color={theme.palette.primary.main}
                >
                  DECENTRALISED
                </Typography>
                <Typography
                  fontSize={25}
                  variant="h1"
                  color={theme.palette.primary.main}
                >
                  EXCHANGE
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack spacing={5} direction="row">
            {pages.map((page) => (
              <NavLink
                activeStyle={{
                  color: "blue",
                  border: "1px solid blue",
                  padding: "0 2px",
                  boxSizing: "border-box",
                }}
                key={page[0]}
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                to={page[1]}
              >
                <Typography variant="body2" fontFamily={"Roboto"}>
                  {page[0]}
                </Typography>
              </NavLink>
            ))}
          </Stack>
        </Stack>
        <Stack spacing={3} direction="row" alignItems={"center"}>
          <Typography
            variant="body2"
            color={theme.palette.primary.main}
            fontSize={"0.8rem"}
          >
            {acc}
          </Typography>
          <FormControl variant="standard" sx={{ m: 2, minWidth: 120 }}>
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
              // value={nameFromId.get(String(chainId!))}
            >
              {chainId != "11155111" && (
                <MenuItem value={"11155111"}>Sepolia</MenuItem>
              )}
              {chainId != "80001" && (
                <MenuItem value={"80001"}>Mumbai</MenuItem>
              )}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
}
