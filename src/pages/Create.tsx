import { useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import abiNFT from "../contracts/ExchangeNFT.json";
import { create as ipfsClient } from "ipfs-http-client";

const projectId = process.env.REACT_APP_PROJECT_KEY;
const projectSecret = process.env.REACT_APP_PROJECT_SECRET;
const addressSet = function (chainIdString: string): string | undefined {
  if (chainIdString == "11155111")
    return "0x0fBFFDfFA75d47d4d60047523946820Be611AceB";
  else if (chainIdString == "80001")
    return "0x670E9c8cb57b2C924dac907b214415C26D656693";
  else if (chainIdString == "97")
    return "0x70AB09705d2182690BB5366fa643D2C017BB8bE0";
};
let contract: any;
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
let provider: any;

const getNfts = async function (curAcc: string): Promise<any> {
  const count = Number(await contract?.totalSupply());
  const myNfts = [];
  for (let i = 0; i < count; i++) {
    let thisOwner = await contract.ownerOf(i);
    if (thisOwner == curAcc) {
      const nftUriLoc = await contract.tokenURI(i);
      let nftData = await fetch(nftUriLoc);
      nftData = await nftData.json();
      myNfts.push(nftData);
    }
  }
  return myNfts;
};

export default function Create() {
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [myNfts, setMyNfts] = useState<
    [{ name: string; description: string; image: string }] | null
  >(null);
  window.ethereum.on("accountsChanged", async function () {
    setAcc((await provider.listAccounts())[0].address);
  });
  window.ethereum.on("chainChanged", async function () {
    window.location.reload();
  });

  useEffect(() => {
    (async function () {
      provider = new ethers.BrowserProvider(window.ethereum);
      setAcc((await provider.listAccounts())[0].address);
      const signer = await provider.getSigner();
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      let contractAddress = addressSet(chainIdString);
      contract = new ethers.Contract(contractAddress!, abiNFT.abi, signer);
      // if (acc) console.log(await getNfts(acc));
      setMyNfts(await getNfts(acc!));
    })();
  }, [acc]);

  const image = useRef<HTMLInputElement>(null);
  const name = useRef<HTMLInputElement>(null);
  const desc = useRef<HTMLInputElement>(null);
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

    await contract.safeMint(acc, nftIpfsAddress);
    console.log(
      await contract.balanceOf(acc),
      acc,
      await contract.totalSupply()
    );
    getNfts(acc!);
  };
  return (
    <div>
      <h1>{chainId}</h1>
      <h2>{acc} </h2>
      <input ref={image} type="file"></input>
      <input ref={name} placeholder="name"></input>
      <input ref={desc} placeholder="description"></input>
      <button onClick={clickHandler}>Mint</button>

      <div>
        {myNfts?.map((i) => (
          <div key={i.image}>
            <p>name : {i.name}</p>
            <p> description: {i.description}</p>
            <img src={i.image}></img>
          </div>
        ))}
      </div>
    </div>
  );
}
