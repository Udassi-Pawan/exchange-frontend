import { Button, Stack, TextField, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { EthrDID } from "ethr-did";
import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";
import { getSignedContract } from "../../signedContracts/scriptsCentralised";
import { MyContext } from "../../MyContext";

const ownerAddr = "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4";
const regAddr = "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b";

const rpcURL =
  "https://polygon-testnet.blastapi.io/2e3e0777-ba8f-4cf1-8f77-2aac489b3274";

const JRPCprovider = new ethers.providers.JsonRpcProvider(rpcURL);
const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
const providerConfig = {
  rpcUrl: rpcURL,
  registry: regAddr,
  chainId: "0x13881",
};
const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);
const signedExchangeContract = getSignedContract("80001");

const ethrDid = new EthrDID({
  identifier: ownerAddr,
  chainNameOrId: "0x13881",
  provider: JRPCprovider,
  txSigner: destSigner,
  alg: "ES256K",
});

let metaProvider;

const checkIdentity = async function (acc: string) {
  const identity = await signedExchangeContract.checkIdentity(acc);
  return identity;
};

export default function SubmitKyc() {
  const [acc, setAcc] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [creditScore, setCreditScore] = useState<string | null>(null);
  const theme = useTheme();
  const { setLoading, setDialogueText } = useContext(MyContext);
  useEffect(() => {
    (async function () {
      metaProvider = new ethers.providers.Web3Provider(window.ethereum);
      await metaProvider.send("eth_requestAccounts", []);
      setAcc((await metaProvider.listAccounts())[0]);
      let identity;
      if (!acc) return;
      identity = await checkIdentity(acc!);
      setName(identity.name);
      setCreditScore(String(identity.creditScore));
    })();
  }, [acc]);

  const jwt = useRef<HTMLInputElement>(null);
  const submitHandler = async function () {
    setLoading(true);
    try {
      const { payload, issuer } = await ethrDid.verifyJWT(
        jwt.current!.value,
        didResolver
      );
      console.log(ownerAddr, issuer);
      const { address: subject, name, birth, creditScore } = payload;
      if (subject != acc) {
        setDialogueText("KYC code not issued for this account!");
        return setLoading();
      }
      console.log(payload);
      if (issuer.split(":")[3] == ownerAddr) {
        console.log(subject, name, birth, creditScore);
        const idTx = await signedExchangeContract.setIdentity(
          subject,
          name,
          birth,
          creditScore
        );
        const recIdTx = await idTx.wait();
        const identity = await checkIdentity(acc!);
        setName(identity.name);
        setCreditScore(String(identity.creditScore));
      }
    } catch (e) {
      setDialogueText("KYC process failed.");
    }
    setLoading();
  };
  return (
    <Stack alignItems={"center"}>
      {name == null && (
        <Typography mt={5} variant="h3">Getting KYC Status ...</Typography>
      )}
      {name == "" && (
        <Stack alignItems={"center"} spacing={8} sx={{ mt: 5 }}>
          <Stack alignItems={"center"} spacing={2}>
            <Typography variant={"h3"}> KYC Pending. </Typography>
            <Typography variant={"h3"}>
              Please complete KYC to use more features.
            </Typography>
            <Typography variant={"h5"}>Get Your KYC code here</Typography>
          </Stack>
          <Stack alignItems={"center"} direction={"row"} spacing={3}>
            <TextField inputRef={jwt} placeholder="KYC Code"></TextField>
            <Button
              variant={"contained"}
              sx={{
                backgroundColor: theme.palette.secondary.dark,
              }}
              onClick={submitHandler}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      )}
      {name != null && name != "" && (
        <Stack mt={6} alignItems={"center"} spacing={3}>
          <Typography mb={5} variant="h4">
            KYC Complete. Enjoy the added features.
          </Typography>
          <Typography variant="h3"> Name : {name}</Typography>
          <Typography variant="h3"> Credit Score: {creditScore}</Typography>
        </Stack>
      )}
    </Stack>
  );
}
