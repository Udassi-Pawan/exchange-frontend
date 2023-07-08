import { Box, Button, Input, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { EthrDID } from "ethr-did";
import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";
import getSignedContract from "../signedContracts/signedC";

const ownerAddr = "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4";
const regAddr = "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b";

// const rpcURL =
//   "https://matic.getblock.io/04f401f9-44f5-4841-b934-71157c95af64/testnet/";
const rpcURL =
  "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78";
// const rpcURL = "https://rpc-mumbai.maticvigil.com/";

const JRPCprovider = new ethers.providers.JsonRpcProvider(rpcURL);
const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
const providerConfig = {
  rpcUrl: rpcURL,
  registry: regAddr,
  chainId: "0x13881",
};
const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);
const signedExchangeContract = getSignedContract("11155111");

const ethrDid = new EthrDID({
  identifier: ownerAddr,
  chainNameOrId: "0x13881",
  provider: JRPCprovider,
  txSigner: destSigner,
  alg: "ES256K",
});

let metaProvider;

const checkIdentity = async function (acc: string) {
  const sepoliaContract = getSignedContract("11155111");
  const mumbaiContract = getSignedContract("80001");
  const bscContract = getSignedContract("97");
  let identity;
  identity = await mumbaiContract.checkIdentity(acc);
  if (Number(identity.creditScore) != 0) return identity;
  identity = await bscContract.checkIdentity(acc);
  if (Number(identity.creditScore) != 0) return identity;
  identity = await sepoliaContract.checkIdentity(acc);
  if (Number(identity.creditScore) != 0) return identity;
  return null;
};

export default function SubmitKyc() {
  const [acc, setAcc] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [creditScore, setCreditScore] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      metaProvider = new ethers.providers.Web3Provider(window.ethereum);
      await metaProvider.send("eth_requestAccounts", []);
      setAcc((await metaProvider.listAccounts())[0]);
      let identity;
      if (acc) identity = await checkIdentity(acc!);
      if (identity != undefined) {
        setName(identity.name);
        setCreditScore(String(identity.creditScore));
      }
    })();
  }, [acc]);

  const jwt = useRef<HTMLInputElement>(null);
  const submitHandler = async function () {
    console.log(jwt.current!.value);

    const { payload, issuer } = await ethrDid.verifyJWT(
      jwt.current!.value,
      didResolver
    );
    console.log(ownerAddr, issuer);
    const { address: subject, name, birth, creditScore } = payload;
    console.log(payload);
    if (issuer.split(":")[3] == ownerAddr) {
      console.log("same");
      const idTx = await signedExchangeContract.setIdentity(
        subject,
        name,
        birth,
        creditScore
      );
      const recIdTx = await idTx.wait();
      console.log(recIdTx);
    }
  };
  return (
    <Box>
      <Typography>{name}</Typography>
      <Typography>{creditScore}</Typography>
      <Input inputRef={jwt} placeholder="jwt"></Input>
      <Button onClick={submitHandler}>Submit</Button>
    </Box>
  );
}

// eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE2ODg2NTM2NDMsIm5hbWUiOiJ1ZGFzc2kiLCJiaXJ0aCI6MTY4ODYwMTYwMDAwMCwiY3JlZGl0U2NvcmUiOjgyLCJhZGRyZXNzIjoiMHhhN0JDYTMxNWIzN2RGNUNmZGYxRTRCZGM3YzM4OTc3MjkwNzFjNTk0IiwiaXNzIjoiZGlkOmV0aHI6MHgxMzg4MToweGUyNGZCMTBjMTM4QjFlQjI4RDE0NmRGRDJCYjQwNkZBRTU1MTc2YjQifQ.o_3cda-zqtKo0ecRX9y_68Jqb1pnH63aYhjccvEf2fkj0b-dy0jTw506TQdbMfHntQNO1frv7DeXzt7C4g0SzAE
