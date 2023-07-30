import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getBalance } from "../signedContracts/signedC2";

export default function ContractBalancesCentralised() {
  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);
  const [bscBalance, setBscBalance] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
      setBscBalance(await getBalance("97"));
    })();
  }, []);
  return (
    <Stack alignItems={"center"}>
      <Typography variant="h5">Contract Balances</Typography>
      <Typography>
        <u>Sepolia : {sepoliaBalance} </u>
      </Typography>
      <Typography>
        <u>Mumbai : {mumbaiBalance} </u>
      </Typography>
      <Typography>
        <u>BSC : {bscBalance} </u>
      </Typography>
    </Stack>
  );
}
