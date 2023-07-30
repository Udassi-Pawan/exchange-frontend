import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useContext, useEffect, useRef, useState } from "react";
import abiToken from "../../contracts/centralised/stakeToken.json";
import {
  getSignedContract,
  getStakes,
  networks,
} from "../../signedContracts/scriptsCentralised";
import { useTheme } from "@mui/material/styles";
import ContractBalancesCentralised from "../../components/ContractBalancesCentralised";
import { MyContext } from "../../MyContext";

let tokenContract: any;
let provider: any;

export default function Stake() {
  const theme = useTheme();
  const { exchangeContractCentralised, acc , changeNetworkEvent} = useContext(MyContext);

  const toNetwork = useRef<HTMLInputElement>(null);
  const [stakes, setStakes] = useState<
    [{ value: string; time: string }] | null
  >(null);
  const [unlocked, setUnlocked] = useState<any>(null);
  const stakeValue = useRef<HTMLInputElement>(null);
  const periodValue = useRef<HTMLInputElement>(null);
  const redeemValue = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenAddress = await exchangeContractCentralised.stakeTokenAddr();
      tokenContract = new ethers.Contract(tokenAddress!, abiToken.abi, signer);
      if (!acc) return;
      const [stakesArray, unlockedValue] = await getStakes(acc!);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
    })();
  }, [acc]);

  const stakeHandler = async () => {
    const tx = await exchangeContractCentralised.stakeEth(
      periodValue.current!.value,
      {
        value: stakeValue.current!.value,
      }
    );
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

  return (
    <Stack alignItems={"center"} spacing={5}>
      <ContractBalancesCentralised />
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
          <Select onChange={changeNetworkEvent}>
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
