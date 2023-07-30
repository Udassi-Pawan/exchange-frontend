import {
  Box,
  Button,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import abiCrypto from "../../contracts/centralised/exchange.json";
import abiToken from "../../contracts/centralised/stakeToken.json";
import getSignedContract, {
  exchangeAddressFromId,
  getAccountBalances,
  getBalance,
  getStakes,
  networks,
} from "../../signedContracts/signedC2";
import { networkIdInHex } from "../../signedContracts/signedC";
import { useTheme } from "@mui/material/styles";

let cryptoContract: any;
let tokenContract: any;
let provider: any;

export default function Stake() {
  const theme = useTheme();
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [accBalances, setAccBalances] = useState<any>(null);
  const fromNetwork = useRef<HTMLInputElement>(null);
  const [sepoliaContractBalance, setSepoliaContractBalance] = useState<
    string | null
  >(null);
  const [mumbaiContractBalance, setMumbaiContractBalance] = useState<
    string | null
  >(null);
  const [bscContractBalance, setBscContractBalance] = useState<string | null>(
    null
  );
  const toNetwork = useRef<HTMLInputElement>(null);
  const [stakes, setStakes] = useState<
    [{ value: string; time: string }] | null
  >(null);
  const [unlocked, setUnlocked] = useState<any>(null);
  const stakeValue = useRef<HTMLInputElement>(null);
  const periodValue = useRef<HTMLInputElement>(null);
  const redeemValue = useRef<HTMLInputElement>(null);

  window.ethereum.on("accountsChanged", async function () {
    setAcc((await provider.listAccounts())[0].address);
  });
  window.ethereum.on("chainChanged", async function () {
    window.location.reload();
  });

  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      setAcc((await provider.listAccounts())[0]);
      const signer = await provider.getSigner();
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      let cryptoAddress = exchangeAddressFromId.get(chainIdString);
      cryptoContract = new ethers.Contract(
        cryptoAddress!,
        abiCrypto.abi,
        signer
      );
      const tokenAddress = await cryptoContract.stakeTokenAddr();
      tokenContract = new ethers.Contract(tokenAddress!, abiToken.abi, signer);
      if (!acc) return;
      const [stakesArray, unlockedValue] = await getStakes(acc!);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
      setAccBalances(await getAccountBalances(acc));
      setSepoliaContractBalance(await getBalance("11155111"));
      setMumbaiContractBalance(await getBalance("80001"));
      setBscContractBalance(await getBalance("97"));
    })();
  }, [acc]);

  const stakeHandler = async () => {
    const tx = await cryptoContract.stakeEth(periodValue.current!.value, {
      value: stakeValue.current!.value,
    });
    const receipt = await tx.wait();
    console.log(receipt);
    const [stakesArray, unlockedValue] = await getStakes(acc!);
    setStakes(stakesArray!);
    setUnlocked(unlockedValue);
  };
  const withdrawHandler = async () => {
    let total = 0;
    const redeemAmount = Number(redeemValue.current!.value);
    if (unlocked[0] + unlocked[1] + unlocked[2] < redeemAmount) return;
    for (let i = 0; i < 3; i++) {
      const exchangeContract = getSignedContract(networks[i]);
      if (total + unlocked[i] >= redeemAmount) {
        console.log("burning final");
        const burnTx = await exchangeContract.burnStakedEth(
          acc,
          redeemAmount - total
        );
        const recBurnTx = await burnTx.wait();
        total += redeemAmount - total;
        break;
      } else {
        console.log("burning", unlocked[i], networks[i]);
        const burnTx = await exchangeContract.burnStakedEth(acc, unlocked[i]);
        const recBurnTx = await burnTx.wait();
        total += unlocked[i];
      }
    }
    if (total == redeemAmount) {
      console.log("transfering eth");
      const exchangeContract = getSignedContract(toNetwork.current!.value);

      const transferTx = await exchangeContract.withdrawEth(acc, total);
      const recTransferTx = await transferTx.wait();
      console.log(recTransferTx);
    }

    const [stakesArray, unlockedValue] = await getStakes(acc!);
    setStakes(stakesArray!);
    setUnlocked(unlockedValue);
  };

  const networkChangeHandler = async function (e: SelectChangeEvent) {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkIdInHex.get(e.target.value) }],
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    const chainIdString = String(chainId);
    setChainId(chainIdString);
  };

  return (
    <Stack alignItems={"center"} spacing={5}>
      <Stack alignItems={"center"}>
        <Typography variant="h5">Contract Balances</Typography>
        <Typography>
          <u>Sepolia : {sepoliaContractBalance} </u>
        </Typography>
        <Typography>
          <u>Mumbai : {mumbaiContractBalance} </u>
        </Typography>
        <Typography>
          <u>BSC : {bscContractBalance} </u>
        </Typography>
      </Stack>
      <Box
        sx={{
          backgroundColor: theme.palette.secondary.dark,
          p: 1,
          m: 2,
          borderRadius: "1rem",
        }}
      >
        <Stack mt={2} mb={2} alignItems={"center"}>
          <Typography mb={1.6} fontSize={"1.4rem"}>
            Locked Deposits:
          </Typography>
          {stakes &&
            stakes.map((s) => (
              <Stack direction={"row"} key={s.time} spacing={2}>
                <Stack direction="row" spacing={1}>
                  <Typography fontWeight={"600"}> value: </Typography>
                  <Typography>{s.value}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography fontWeight={"600"}> unlock time:</Typography>
                  <Typography>{s.time}</Typography>
                </Stack>
              </Stack>
            ))}
        </Stack>
      </Box>
      <Box>
        {unlocked && (
          <Box>
            <Typography variant={"h6"}>
              Unlocked tokens :{unlocked[0] + unlocked[1] + unlocked[2]}
            </Typography>
          </Box>
        )}
      </Box>
      <Stack alignItems={"center"} direction={"row"} spacing={2}>
        <FormControl variant="standard" sx={{ mb: 2, minWidth: 100 }}>
          <InputLabel>Network</InputLabel>
          <Select onChange={networkChangeHandler}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>

        <Input placeholder="value" inputRef={stakeValue} />
        <Input sx={{ m: 2 }} placeholder="period" inputRef={periodValue} />
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={stakeHandler}
        >
          Stake
        </Button>
      </Stack>
      <Box>
        <Input placeholder="value" inputRef={redeemValue} />
        <FormControl sx={{ m: 1, minWidth: 80 }}>
          <InputLabel>To</InputLabel>
          <Select inputRef={toNetwork}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={withdrawHandler}
        >
          Withdraw
        </Button>
      </Box>
    </Stack>
  );
}
