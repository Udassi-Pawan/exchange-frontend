import { useContext, useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";
import { create as ipfsClient } from "ipfs-http-client";
import getSignedContract, {
  getNfts,
} from "../../signedContracts/scriptsDecentralised";
import {
  Box,
  Button,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NftCard from "../../components/NftCard";
import { useTheme } from "@mui/material/styles";
import { MyContext } from "../../MyContext";

const projectId = process.env.REACT_APP_PROJECT_KEY;
const projectSecret = process.env.REACT_APP_PROJECT_SECRET;

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const mumbaiContract = getSignedContract("80001");
const sepoliaContract = getSignedContract("11155111");

mumbaiContract.on("transactionAttested", async (nonce) => {
  setTimeout(async () => {
    console.log("minting ", nonce);
    const tx = await mumbaiContract.completeAttestedTx(nonce);
    console.log(await tx.wait());
  }, 3000);
});

sepoliaContract.on("transactionAttested", async (nonce) => {
  setTimeout(async () => {
    console.log("minting ", nonce);
    const tx = await sepoliaContract.completeAttestedTx(nonce);
    console.log(await tx.wait());
  }, 3000);
});

export default function Create() {
  const theme = useTheme();
  const {
    acc,
    chainId,
    exchangeContractDecentralised,
    nftContractDecentralised,
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
      setMyNfts(null);
      if (chainId) setMyNfts(await getNfts(acc, chainId));
    })();
  }, [acc, chainId]);

  const image = useRef<HTMLInputElement>(null);
  const destNetwork = useRef<HTMLSelectElement>(null);
  const name = useRef<HTMLInputElement>(null);
  const desc = useRef<HTMLInputElement>(null);
  const itemId = useRef<HTMLInputElement>(null);
  const mintHandler = async function () {
    setLoading(true);
    try {
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
      const mintTx = await nftContractDecentralised.safeMint(
        acc,
        nftIpfsAddress
      );

      await mintTx.wait();

      setMyNfts(await getNfts(acc!, chainId));
    } catch (e) {
      setDialogueText("NFT Minting Failed");
    }
    setMyNfts(null);
    setMyNfts(await getNfts(acc, chainId));
    setLoading();
  };

  const accessHandler = async function () {
    setLoading(true);
    try {
      const tx = await nftContractDecentralised.setApprovalForAll(
        exchangeContractDecentralised.address,
        true
      );
      await tx.wait();
      console.log(await tx.wait());
    } catch (e) {
      setDialogueText("Approval Transaction Failed");
    }
    setLoading();
  };
  const sendHandler = async function () {
    setLoading(true);
    try {
      const checkApproval = await nftContractDecentralised.isApprovedForAll(
        acc,
        exchangeContractDecentralised.address
      );
      if (checkApproval == false) {
        setDialogueText("Please approve access to NFT first.");
        return setLoading();
      }
      const tokenId = itemId.current!.value;
      const sendTx = await exchangeContractDecentralised.transferToDead(
        tokenId
      );
      await sendTx.wait();
    } catch (e) {
      setDialogueText("Transfer Transaction Failed.");
    }
    setLoading();
  };
  return (
    <Stack
      spacing={5}
      alignItems={"center"}
      justifyContent={"space-between"}
      m={2}
    >
      <Box>
        <Grid container sx={{ m: 2 }} direction={"row"} gap={6}>
          {myNfts?.map((i) => (
            <Grid item key={i.image}>
              <NftCard
                image={i.image}
                desc={i.description}
                name={i.name}
                itemId={i.tokenId}
              ></NftCard>
            </Grid>
          ))}
        </Grid>
      </Box>
      {myNfts == null && (
        <Typography variant={"h3"}>Loading NFTs ...</Typography>
      )}
      {myNfts?.length == 0 && (
        <Typography variant={"h3"}>Mint your first NFT now. </Typography>
      )}
      <Stack direction={"row"} alignItems={"center"} spacing={2}>
        <Input
          inputRef={image}
          type="file"
          sx={{ color: theme.palette.primary.main }}
        ></Input>
        <Input inputRef={name} placeholder="name"></Input>
        <TextField
          multiline
          rows={2}
          maxRows={4}
          inputRef={desc}
          placeholder="description"
        ></TextField>
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

      <Stack direction={"row"} alignItems={"center"} spacing={2}>
        <Input inputRef={itemId} placeholder="itemId"></Input>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>Send To</InputLabel>
          <Select inputRef={destNetwork} id="demo-simple-select">
            {chainId != "11155111" && (
              <MenuItem value={"11155111"}>Sepolia</MenuItem>
            )}
            {chainId != "80001" && <MenuItem value={"80001"}>Mumbai</MenuItem>}
          </Select>
        </FormControl>

        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={accessHandler}
        >
          Approve Access
        </Button>
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={sendHandler}
        >
          Transfer
        </Button>
      </Stack>
    </Stack>
  );
}
