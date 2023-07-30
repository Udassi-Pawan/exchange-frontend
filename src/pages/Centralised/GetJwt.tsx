import { Resolver } from "did-resolver";
import { getResolver } from "ethr-did-resolver";
import { EthrDID } from "ethr-did";

import { ethers } from "ethers";
import { Buffer } from "buffer";
import { useEffect, useRef, useState } from "react";
import { Box, Input, Button, Typography } from "@mui/material";
window.Buffer = Buffer;

const addr = "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4";
const regAddr = "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b";

const rpcURL =
  "https://polygon-testnet.blastapi.io/2e3e0777-ba8f-4cf1-8f77-2aac489b3274";
// const rpcURL = "https://rpc-mumbai.maticvigil.com/";

const JRPCprovider = new ethers.providers.JsonRpcProvider(rpcURL);
const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);

const providerConfig = {
  rpcUrl: rpcURL,
  registry: regAddr,
  chainId: "0x13881",
};
let provider;
const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);
let accounts: string;

function GetJwt() {
  const name = useRef<HTMLInputElement>(null);
  const birth = useRef<HTMLInputElement>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [acc, setAcc] = useState<string | null>(null);
  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      setAcc((await provider.listAccounts())[0]);
    })();
  }, []);
  const clickHandler = async () => {
    const ethrDid = new EthrDID({
      identifier: addr,
      chainNameOrId: "0x13881",
      provider: JRPCprovider,
      txSigner: destSigner,
      alg: "ES256K",
    });
    console.log(addr);
    console.log(ethrDid);

    const { kp, txHash } = await ethrDid.createSigningDelegate();
    const creditScore = Math.floor(Math.random() * 20 + 80);
    const helloJWT = await ethrDid.signJWT({
      name: name.current!.value,
      birth: new Date(birth.current!.value).getTime(),
      creditScore,
      address: acc,
    });
    setJwt(helloJWT);
    console.log(helloJWT);
  };

  return (
    <Box>
      <Input inputRef={name} placeholder="name"></Input>
      <input type="date" ref={birth}></input>
      <Button onClick={clickHandler}>Generate JWT</Button>
      <Typography>{jwt}</Typography>
    </Box>
  );
}

export default GetJwt;
