import { Box, Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "../../MyContext";
import { ethers } from "ethers";
import abiToken from "../../contracts/decentralised/stakeToken.json";
import { nameFromId } from "../../signedContracts/scriptsDecentralised";

let valTokContract: any;

export default function Validators() {
  const theme = useTheme();
  const [attestor, setAttestor] = useState<boolean | null>(null);
  const {
    exchangeContractDecentralised,
    acc,
    setLoading,
    setDialogueText,
    chainId,
  } = useContext(MyContext);
  const [validationTokens, setValidationTokens] = useState<string | null>(null);
  const withdrawValue = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!acc || !exchangeContractDecentralised) return;
    (async () => {
      console.log("att", attestor);
      console.log(await exchangeContractDecentralised.isAttestor(acc));
      setAttestor(await exchangeContractDecentralised.isAttestor(acc));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      valTokContract = new ethers.Contract(
        await exchangeContractDecentralised.validationTokenAddr(),
        abiToken.abi,
        signer
      );
      setValidationTokens(await valTokContract.balanceOf(acc));
    })();
  }, [exchangeContractDecentralised, acc]);

  const withdrawValTokHandler = async function () {
    setLoading(true);
    try {
      const tx = await exchangeContractDecentralised.withdrawValidationTok(
        withdrawValue.current!.value
      );
      const recTx = await tx.wait();
      console.log(recTx);
      setValidationTokens(await valTokContract!.balanceOf(acc));
    } catch (e) {
      setDialogueText("Withdraw Transaction failed.");
    }
    setLoading();
  };

  return (
    <Box mt={10}>
      <Stack alignItems={"center"}>
        {attestor == null && (
          <Typography variant="h3">
            Getting Account Validator Status ...
          </Typography>
        )}
        {attestor == false && (
          <Stack alignItems={"center"} spacing={2}>
            <Typography variant="h6">
              This decentralised exchange platform uses Proof-Of-Stake Consensus
              Protocol to validate transasctions.
            </Typography>
            <Typography variant="h6">
              Anyone can become a validator by staking 1000wei or more and
              running a transactions validation script node.
            </Typography>
            <Typography variant="h6">
              Validators are rewarded with 20wei for each transaction
              validation.
            </Typography>
            <Typography variant="h6">
              Validators are charged 20wei in case of validation of
              non-existant/incorrect transaction.
            </Typography>
            <Typography variant="h6">
              Follow the instructions{"  "}
              <a
                target="_blank"
                href="https://github.com/Udassi-Pawan/exchange-validator.git"
              >
                here
              </a>
              {"  "}
              in order to become a validator.
            </Typography>
          </Stack>
        )}
        {attestor == true && (
          <Stack alignItems={"center"} spacing={5}>
            <Stack alignItems={"center"}>
              <Typography variant="h3" mb={2}>
                Your are an authorised validator:
              </Typography>
              <Typography variant="h4">
                Your Validation Tokens Balance on {nameFromId.get(chainId)}{" "}
                chain :
              </Typography>
              <Typography variant="h3">{String(validationTokens)}</Typography>
            </Stack>
            <Stack direction={"row"} spacing={3}>
              <Input inputRef={withdrawValue} placeholder="value"></Input>
              <Button
                variant={"contained"}
                sx={{
                  backgroundColor: theme.palette.secondary.dark,
                }}
                onClick={withdrawValTokHandler}
              >
                Withdraw
              </Button>
            </Stack>
            <Stack alignItems={"center"}>
              <Typography variant="h6">
                Please note that if your balance gets less than 1000 tokens,
              </Typography>
              <Typography variant="h6">
                you will lose the validator status
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
