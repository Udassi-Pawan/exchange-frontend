import { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Buffer } from "buffer";
import { create as ipfsClient } from "ipfs-http-client";
import {
  getNfts,
  getSignedNftContract,
} from "../../signedContracts/scriptsCentralised";
import {
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import NftCardCentralised from "../../components/NftCardCentralised";

import { MyContext } from "../../MyContext";

const projectId = process.env.REACT_APP_PROJECT_KEY;
const projectSecret = process.env.REACT_APP_PROJECT_SECRET;

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

export default function Create() {
  const theme = useTheme();
  const {
    nftContractCentralised,
    changeNetworkEvent,
    acc,
    chainId,
    setLoading,
    setDialogueText,
  } = useContext(MyContext);
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
    | []
  >(null);

  useEffect(() => {
    (async function () {
      setMyNfts(await getNfts(acc!));
      console.log(await getNfts(acc!));
    })();
  }, [acc]);

  const image = useRef<HTMLInputElement>(null);
  const destNetwork = useRef<HTMLSelectElement>(null);
  const name = useRef<HTMLInputElement>(null);
  const desc = useRef<HTMLInputElement>(null);
  const itemId = useRef<HTMLInputElement>(null);
  const mintHandler = async function () {
    setLoading(true);
    try {
      console.log(nftContractCentralised);
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

      const mintTx = await nftContractCentralised.safeMint(acc, nftIpfsAddress);
      await mintTx.wait();
      console.log(
        await nftContractCentralised.balanceOf(acc),
        acc,
        await nftContractCentralised.totalSupply()
      );
    } catch (e) {
      setDialogueText("NFT Minting Failed!");
    }
    setLoading(false);
    setMyNfts(await getNfts(acc!));
  };

  const sendHandler = async function () {
    setLoading(true);
    try {
      const destNetworkId = destNetwork.current!.value;
      const tokenId = itemId.current!.value;
      const owner = acc;

      const transferTx = await nftContractCentralised.transferFrom(
        acc,
        "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
        tokenId
      );
      await transferTx.wait();
      const destContract = await getSignedNftContract(destNetworkId);
      const srcContractSigned = await getSignedNftContract(chainId!);
      const nftUriLoc = await nftContractCentralised.tokenURI(tokenId);
      const checkOwner = await nftContractCentralised.ownerOf(tokenId);
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
    } catch (e) {
      setDialogueText("NFT Transfer Failed.");
    }
    setLoading(null);
    setMyNfts(null);
    setMyNfts(await getNfts(acc!));
  };

  return (
    <Stack alignItems={"center"} spacing={5}>
      <Stack direction={"row"} spacing={10}>
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
      {myNfts == null && (
        <Typography variant={"h3"}>Loading NFTs ...</Typography>
      )}
      {myNfts?.length == 0 && (
        <Typography variant={"h3"}>Mint your first NFT now. </Typography>
      )}
      <Stack direction={"row"} spacing={2}>
        <Input inputRef={image} type="file"></Input>
        <Input inputRef={name} placeholder="name"></Input>
        <Input inputRef={desc} placeholder="description"></Input>
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={mintHandler}
        >
          Mint
        </Button>
      </Stack>

      <Stack direction={"row"} spacing={2}>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
          <InputLabel>From</InputLabel>
          <Select onChange={changeNetworkEvent} inputRef={destNetwork}>
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
