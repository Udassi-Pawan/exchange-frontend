import { useTheme } from "@mui/material/styles";
import { getSignedContract } from "../../signedContracts/scriptsCentralised";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Input,
  Stack,
} from "@mui/material";
import { useContext, useRef } from "react";
import ContractBalancesCentralised from "../../components/ContractBalancesCentralised";
import { MyContext } from "../../MyContext";

export default function Exchange() {
  const theme = useTheme();
  const { acc, exchangeContractCentralised, changeNetworkEvent } =
    useContext(MyContext);
  const transferValue = useRef<HTMLInputElement>(null);
  const toNetwork = useRef<HTMLInputElement>(null);

  const transferHandler = async function () {
    const destNetworkId = toNetwork.current?.value;
    const value = transferValue.current?.value;
    let transferTx;
    try {
      transferTx = await exchangeContractCentralised.acceptEth({
        value,
      });
    } catch (e) {
      return alert("cancelled");
    }
    const transferReceipt = await transferTx.wait();
    console.log("transfer", transferReceipt);
    const signedDestContract = getSignedContract(destNetworkId!);
    const withdrawTx = await signedDestContract.withdrawEth(acc, value);
    const withdrawTxReceipt = await withdrawTx.wait();
    console.log("withdraw", withdrawTxReceipt);
  };
  return (
    <Stack alignItems="center" spacing={10} sx={{ mt: 5 }}>
      <ContractBalancesCentralised />
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"flex"}
        justifyContent={"space-between"}
      >
        <FormControl variant="standard" sx={{ minWidth: 80 }}>
          <InputLabel>From</InputLabel>
          <Select onChange={changeNetworkEvent} id="demo-simple-select">
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ minWidth: 80 }}>
          <InputLabel>To</InputLabel>
          <Select inputRef={toNetwork} id="demo-simple-select">
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <Input
          sx={{ mt: "10" }}
          inputRef={transferValue}
          placeholder="value"
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
  );
}
