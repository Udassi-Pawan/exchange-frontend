import { Box, Typography } from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { getBalance } from "../signedContracts/signedC";

export default function Balance() {
  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);
  
  useEffect(() => {
    (async function () {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    })();
  }, []);

  return (
    <Box>
      <Typography>Sepolia Balance : {sepoliaBalance}</Typography>
      <Typography>Mumbai Balance : {mumbaiBalance}</Typography>
    </Box>
  );
}
