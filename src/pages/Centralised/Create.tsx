import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import abiNFT from "../../contracts/centralised/ExchangeNFT.json";
import abiExchange from "../../contracts/centralised/exchange.json";
import { create as ipfsClient } from "ipfs-http-client";
import {
  exchangeAddressFromId,
  getNfts,
  getSignedNftContract,
} from "../../signedContracts/signedC2";
import {
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import NftCardCentralised from "../../components/NftCardCentralised";
import { nameFromId, networkIdInHex } from "../../signedContracts/signedC";

const projectId = process.env.REACT_APP_PROJECT_KEY;
const projectSecret = process.env.REACT_APP_PROJECT_SECRET;

let exchangeContract: any;
let nftContract: any;
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
let provider: any;

export default function Create() {
  const theme = useTheme();

  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [myNfts, setMyNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: Number;
          network: string;
        }
      ]
    | null
  >(null);
  window.ethereum.on("accountsChanged", async function () {
    setAcc((await provider.listAccounts())[0].address);
  });
  window.ethereum.on("chainChanged", async function () {
    window.location.reload();
  });

  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      setAcc((await provider.listAccounts())[0]);
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      let contractAddress = exchangeAddressFromId.get(chainIdString);
      exchangeContract = new ethers.Contract(
        contractAddress!,
        abiExchange.abi,
        signer
      );
      exchangeContract = new ethers.Contract(
        contractAddress!,
        abiExchange.abi,
        signer
      );
      const nftContractAddress = await exchangeContract.exchangeNftAddr();
      nftContract = new ethers.Contract(
        nftContractAddress!,
        abiNFT.abi,
        signer
      );
      setMyNfts(await getNfts(acc!));
    })();
  }, [acc]);

  const image = useRef<HTMLInputElement>(null);
  const destNetwork = useRef<HTMLSelectElement>(null);
  const name = useRef<HTMLInputElement>(null);
  const desc = useRef<HTMLInputElement>(null);
  const itemId = useRef<HTMLInputElement>(null);
  const clickHandler = async function () {
    const client = await ipfsClient({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      apiPath: "/api/v0",
      headers: {
        authorization: auth,
      },
    });
    const result1 = await client.add(image?.current?.files![0]!);
    const imageIpfsAddress = `https://ipfs.io/ipfs/${result1.path}`;
    console.log(imageIpfsAddress);
    const nameString = name.current?.value;
    const descString = desc.current?.value;
    const result2 = await client.add(
      JSON.stringify({
        image: imageIpfsAddress,
        name: nameString,
        description: descString,
      })
    );
    const nftIpfsAddress = `https://ipfs.io/ipfs/${result2.path}`;
    console.log(nftIpfsAddress);
    console.log(acc);
    const mintTx = await nftContract.safeMint(acc, nftIpfsAddress);

    await mintTx.wait();
    console.log(
      await nftContract.balanceOf(acc),
      acc,
      await nftContract.totalSupply()
    );
    setMyNfts(await getNfts(acc!));
  };

  const sendHandler = async function () {
    const destNetworkId = destNetwork.current!.value;
    const tokenId = itemId.current!.value;
    const owner = acc;

    const transferTx = await nftContract.transferFrom(
      acc,
      "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
      tokenId
    );
    await transferTx.wait();
    const destContract = await getSignedNftContract(destNetworkId);
    const srcContractSigned = await getSignedNftContract(chainId!);
    const nftUriLoc = await nftContract.tokenURI(tokenId);
    const checkOwner = await nftContract.ownerOf(tokenId);
    if (checkOwner == "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4") {
      console.log("Minting NFT");
      const burnTx = await srcContractSigned.transferFrom(
        "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
        "0x000000000000000000000000000000000000dead",
        tokenId
      );
      const resBurn = await burnTx.wait();
      console.log(resBurn);
      const mintTx = await destContract.safeMint(owner, nftUriLoc);
      const res = await mintTx.wait();
    } else {
      alert("NFT Not Transfered");
    }
  };

  const networkChangeHandler = async function (e: SelectChangeEvent) {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkIdInHex.get(e.target.value) }], // chainId must be in hexadecimal numbers
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    const chainIdString = String(chainId);
    setChainId(chainIdString);
  };

  return (
    <Stack alignItems={"center"} spacing={5}>
      <Stack>
        {myNfts?.map((i) => (
          <NftCardCentralised
            image={i.image}
            name={i.name}
            itemId={i.tokenId}
            network={i.network}
            desc={i.description}
            key={i.image}
          />
        ))}
      </Stack>
      <Stack direction={"row"} spacing={2}>
        <Input inputRef={image} type="file"></Input>
        <Input inputRef={name} placeholder="name"></Input>
        <Input inputRef={desc} placeholder="description"></Input>
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={clickHandler}
        >
          Mint
        </Button>
      </Stack>

      <Stack direction={"row"} spacing={2}>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
          <InputLabel>From</InputLabel>
          <Select onChange={networkChangeHandler} inputRef={destNetwork}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <Input inputRef={itemId} placeholder="itemId"></Input>

        <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
          <InputLabel>To</InputLabel>
          <Select inputRef={destNetwork}>
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
          onClick={sendHandler}
        >
          Send to Network
        </Button>
      </Stack>
    </Stack>
  );
}
