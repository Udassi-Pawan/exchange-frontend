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
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  getCollateralNfts,
  getSignedNftContract,
} from "../../signedContracts/signedC2";
import { ethers } from "ethers";
import NftCardCentralised from "../../components/NftCardCentralised";
import { exchangeAddressFromId } from "../../signedContracts/signedC2";
import abiExchange from "../../contracts/centralised/exchange.json";

let provider: any;

export default function CollateralNfts() {
  const [acc, setAcc] = useState<string | null>(null);

  const collateralTokenId = useRef<HTMLInputElement>(null);
  const collateralNetwork = useRef<HTMLInputElement>(null);
  const [collateralNfts, setCollateralNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: string;
          network: string;
          price: string;
          borrower: string;
        }
      ]
    | null
  >(null);

  useEffect(() => {
    (async function () {
      setCollateralNfts(await getCollateralNfts());
    })();
  }, []);

  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      setAcc((await provider.listAccounts())[0]);
    })();
  }, [acc]);
  const getCollateralHandler = async function (
    e: any,
    network: string,
    borrower: string,
    price: string,
    tokenId: string
  ) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const { chainId } = await provider.getNetwork();
    const chainIdString = String(chainId);
    let cryptoAddress = exchangeAddressFromId.get(chainIdString);
    const exchangeContract = new ethers.Contract(
      cryptoAddress!,
      abiExchange.abi,
      signer
    );
    console.log(exchangeContract);
    const tranferTx = await exchangeContract.setCollateralSold(borrower, {
      value: price,
    });
    console.log(await tranferTx.wait());
    const nftContract = await getSignedNftContract(network);
    const nftTransTx = await nftContract.transferFrom(
      "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
      acc,
      String(tokenId)
    );
    const recTx = await nftTransTx.wait();
    console.log(recTx);
  };

  return (
    <Box>
      <Box>
        <Grid container sx={{ m: 2 }} gap={2}>
          {collateralNfts?.map((i) => (
            <Grid item container direction="column" key={i.image}>
              <Stack alignItems={"center"} spacing={2}>
                <NftCardCentralised
                  image={i.image}
                  desc={i.description}
                  name={i.name}
                  price={String(i.price)}
                ></NftCardCentralised>
                <Button
                  onClick={(e) => {
                    getCollateralHandler(
                      e,
                      i.network,
                      i.borrower,
                      String(i.price),
                      i.tokenId
                    );
                  }}
                  sx={{
                    width: "fit-content",
                  }}
                  variant="contained"
                >
                  Buy
                </Button>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
