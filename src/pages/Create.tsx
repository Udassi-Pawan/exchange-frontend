import { useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import abiNFT from "../contracts/ExchangeNFT.json";
import abiExchange from "../contracts/exchange.json";
import { create as ipfsClient } from "ipfs-http-client";
import getSignedContract, {
  exchangeAddressFromId,
  getNfts,
} from "../signedContracts/signedC";

const sepoliaURL = String(process.env.REACT_APP_SEPOLIA_URL);

const projectId = process.env.REACT_APP_PROJECT_KEY;
const projectSecret = process.env.REACT_APP_PROJECT_SECRET;

let exchangeContract: any;
let nftContract: any;
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
let provider: any;

const mumbaiContract = getSignedContract("80001");
const sepoliaContract = getSignedContract("11155111");

mumbaiContract.on("nftTransferAttested", async (nonce) => {
  setTimeout(async () => {
    console.log("minting ", nonce);
    const tx = await mumbaiContract.mintTransferedNft(nonce);
    console.log(await tx.wait());
  }, 3000);
});

sepoliaContract.on("nftTransferAttested", async (nonce) => {
  setTimeout(async () => {
    console.log("minting ", nonce);
    const tx = await sepoliaContract.mintTransferedNft(nonce);
    console.log(await tx.wait());
  }, 3000);
});

export default function Create() {
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
      setAcc((await provider.listAccounts())[0]);
      const signer = await provider.getSigner();
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      let contractAddress = exchangeAddressFromId.get(chainIdString);
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
      if (acc) setMyNfts(await getNfts(acc!));
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

  const accessHandler = async function () {
    const tx = await nftContract.setApprovalForAll(
      exchangeContract.address,
      true
    );
    console.log(await tx.wait());
  };
  const sendHandler = async function () {
    const tokenId = itemId.current!.value;
    const sendTx = await exchangeContract.transferToDead(tokenId);
    console.log(await sendTx.wait());
  };
  return (
    <div>
      <h1>{chainId}</h1>
      <h2>{acc} </h2>
      <input ref={image} type="file"></input>
      <input ref={name} placeholder="name"></input>
      <input ref={desc} placeholder="description"></input>
      <button onClick={clickHandler}>Mint</button>

      <div style={{ display: "flex", gap: "1rem" }}>
        {myNfts?.map((i) => (
          <div key={i.image}>
            <p>name : {i.name}</p>
            <p>tokenId : {String(i.tokenId)}</p>
            <p> description: {i.description}</p>
            <p> network: {i.network}</p>
            <img style={{ height: "200px" }} src={i.image}></img>
          </div>
        ))}
      </div>
      <div>
        <input ref={itemId} placeholder="itemId"></input>
        <select ref={destNetwork}>
          {chainId != "11155111" && <option value="11155111">Sepolia</option>}
          {chainId != "80001" && <option value="80001">Polygon</option>}
        </select>
        <button onClick={accessHandler}>Approve Access</button>
        <button onClick={sendHandler}>Send to Network</button>
      </div>
    </div>
  );
}
