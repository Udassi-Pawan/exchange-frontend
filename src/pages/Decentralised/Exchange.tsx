import { getBalance } from "../../signedContracts/scriptsDecentralised";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Input,
  Typography,
  Stack,
} from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "../../MyContext";
import { useTheme } from "@mui/material/styles";
import getSignedContract from "../../signedContracts/scriptsDecentralised";
const timers = require("timers-promises");


const mumbaiContract = getSignedContract("80001");
const sepoliaContract = getSignedContract("11155111");

export default function Exchange() {
  const theme = useTheme();
  const {
    chainId,
    exchangeContractDecentralised,
    setLoading,
    setDialogueText,
    acc,
  } = useContext(MyContext);
  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);
  const transferValue = useRef<HTMLInputElement>(null);
  const toNetwork = useRef<HTMLInputElement>(null);
  useEffect(() => {
    (async function () {
      mumbaiContract.on("transactionAttested", async (nonce, requestor) => {
        console.log(requestor, acc);
        if (requestor != acc) return;
        await timers.setTimeout(3000);
        try {
          console.log("completing ", nonce);
          const tx = await mumbaiContract.completeAttestedTx(nonce);
          console.log(await tx.wait());
        } catch (e) {}
        setSepoliaBalance(await getBalance("11155111"));
        setMumbaiBalance(await getBalance("80001"));
        setLoading();
      });

      sepoliaContract.on("transactionAttested", async (nonce, requestor) => {
        console.log(requestor, acc, typeof requestor, typeof acc);
        if (requestor != acc) return;

        await timers.setTimeout(3000);
        try {
          console.log("completing ", nonce);
          const tx = await sepoliaContract.completeAttestedTx(nonce);
          console.log(await tx.wait());
        } catch (e) {}
        setSepoliaBalance(await getBalance("11155111"));
        setMumbaiBalance(await getBalance("80001"));
        setLoading();
      });
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    })();
  }, [acc]);

  const transferHandler = async function () {
    try {
      if (!transferValue.current?.value) throw new Error();
      if (
        Number(transferValue.current?.value) >
        Number(await getBalance(toNetwork.current!.value))
      )
        return setDialogueText(
          "Not enough funds available with the exchange. Please try again later."
        );
      setLoading(true);
      const value = transferValue.current?.value;
      const tx = await exchangeContractDecentralised.sendEthOver({ value });
      console.log(await tx.wait());
    } catch (e) {
      setDialogueText("Transfer Transaction Failed");
      setLoading();
    }
  };
  return (
    <Box>
      <Stack m={10} alignItems={"center"} spacing={8}>
        <Stack spacing={2}>
          <Typography sx={{ textDecoration: "underline" }}>
            Contract Sepolia Balance : {sepoliaBalance}
          </Typography>
          <Typography sx={{ textDecoration: "underline" }}>
            Contract Mumbai Balance : {mumbaiBalance}
          </Typography>
        </Stack>
        <Typography textAlign={"center"} variant={"h6"}>
          10% flat charges on all transfers.
        </Typography>
        <Stack direction={"row"} alignItems={"center"} spacing={2}>
          <FormControl variant="standard" sx={{ mb: 2, minWidth: 80 }}>
            <InputLabel>To</InputLabel>
            <Select inputRef={toNetwork}>
              {chainId != "11155111" && (
                <MenuItem value={"11155111"}>Sepolia</MenuItem>
              )}
              {chainId != "80001" && (
                <MenuItem value={"80001"}>Mumbai</MenuItem>
              )}
            </Select>
          </FormControl>

          <Input
            placeholder="Value"
            type="number"
            inputRef={transferValue}
          ></Input>
          <Button
            variant={"contained"}
            sx={{
              backgroundColor: theme.palette.secondary.dark,
            }}
            onClick={transferHandler}
          >
            Transfer
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
