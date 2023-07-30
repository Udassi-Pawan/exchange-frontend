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

export default function Exchange() {
  const { acc, chainId, exchangeContractDecentralised } = useContext(MyContext);
  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);
  const transferValue = useRef<HTMLInputElement>(null);
  const toNetwork = useRef<HTMLInputElement>(null);
  useEffect(() => {
    (async function () {
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    })();
  }, [acc]);

  const transferHandler = async function () {
    const value = transferValue.current?.value;
    const tx = await exchangeContractDecentralised.sendEthOver({ value });
    console.log(await tx.wait());
  };
  return (
    <Box>
      <Stack m={10} alignItems={"center"} spacing={20}>
        <Stack spacing={2}>
          <Typography sx={{ textDecoration: "underline" }}>
            Contract Sepolia Balance : {sepoliaBalance}
          </Typography>
          <Typography sx={{ textDecoration: "underline" }}>
            Contract Mumbai Balance : {mumbaiBalance}
          </Typography>
        </Stack>
        <Stack direction={"row"} alignItems={"center"}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
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
          <Button onClick={transferHandler}>Transfer</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
