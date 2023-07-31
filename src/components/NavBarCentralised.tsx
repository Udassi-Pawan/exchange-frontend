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
import { useContext } from "react";
import {
  nameFromId,
  networkIdInHex,
} from "../signedContracts/scriptsDecentralised";
import { MyContext } from "../MyContext";
const pages = [
  ["NFT", "/centralised/nft"],
  ["STAKE", "/centralised/stake"],
  ["EXCHANGE", "/centralised/exchange"],
  ["KYC", "/centralised/kyc"],
  ["LOAN", "/centralised/loan"],
  ["MARKETPLACE", "/centralised/market"],
];

export default function NavBarCentralised() {
  const theme = useTheme();
  const { acc, setContracts, chainId, setDialogueText } = useContext(MyContext);

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
              color="secondary"
              sx={{
                fontSize: 80,
              }}
            ></CurrencyExchangeIcon>
            <Stack>
              <Stack>
                <Typography
                  fontSize={20}
                  variant="h1"
                  color={theme.palette.secondary.main}
                >
                  CENTRALISED
                </Typography>
                <Typography
                  fontSize={25}
                  variant="h1"
                  color={theme.palette.secondary.main}
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
                  color: "red",
                  border: "1px solid red",
                  padding: "0 2px",
                }}
                key={page[0]}
                style={{
                  color: theme.palette.secondary.main,

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
            color={theme.palette.secondary.main}
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
        </Stack>
      </Stack>
    </Box>
  );
}
