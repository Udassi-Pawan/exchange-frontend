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
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { nameFromId, networkIdInHex } from "../signedContracts/signedC";
const pages = [
  ["CREATE", "/centralised/create"],
  ["STAKE", "/centralised/stake"],
  ["EXCHANGE", "/centralised/exchange"],
  ["KYC", "/centralised/kyc"],
  ["LOAN", "/centralised/loan"],
  ["MARKETPLACE", "/centralised/market"],
];

export default function NavBarCentralised() {
  const theme = useTheme();
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
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
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkIdInHex.get(e.target.value) }], // chainId must be in hexadecimal numbers
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    const chainIdString = String(chainId);
    setChainId(chainIdString);
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
              <Link
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
              </Link>
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
                if (p == chainId) return p;
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
