import { Contract } from "ethers";
import React from "react";

export const MyContext = React.createContext<any>(null);

// export const MyContext = React.createContext<{
//     setAcc: React.Dispatch<React.SetStateAction<string | null>>;
//     acc: string | null;
//     dialogueText: string | null;
//     setDialogueText: React.Dispatch<React.SetStateAction<string | null>>;
//     setChainId: React.Dispatch<React.SetStateAction<string | null>>;
//     chainId: string | null;
//     exchangeContractCentralised: Contract | undefined;
//     nftContractCentralised: Contract | undefined;
//     exchangeContractDecentralised: Contract | undefined;
//     nftContractDecentralised: Contract | undefined;
//     setLoading: React.Dispatch<React.SetStateAction<boolean | null>>;
//     changeNetworkEvent: Function;
//     setContracts: Function;
//   } | null>(null);
