// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract stakeToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, ERC20Votes {
    constructor() ERC20("stakeToken", "stk") ERC20Permit("stakeToken") {
    }
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }
    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
     function burnByAdmin(address _who,uint256 tokenId) public onlyOwner {
         _burn(_who,tokenId);
    }
}


contract exchangeNFT is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("exchangeNFT", "exNFT") {}

    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}


contract exchange  {
    stakeToken mytok  = new stakeToken();
    stakeToken validationTok  = new stakeToken();
    exchangeNFT mynft;
    address public exchangeNftAddr;
    constructor (address _mynft) {
        mynft = exchangeNFT(_mynft);
        exchangeNftAddr = _mynft;
    }
    address public stakeTokenAddr = address(mytok);
    address public validationTokenAddr = address(validationTok);

    uint public nonce;
    mapping (address=> bool) public isAttestor;
   function becomeAttestor() public payable {
       require(msg.value>=1000);
       isAttestor[msg.sender] = true;
       validationTok.mint(msg.sender,msg.value);
   } 
   function withdrawValidationTok(uint _value) public payable {
       require(validationTok.balanceOf(msg.sender)>=_value,"not enough tokens!");
       validationTok.burnByAdmin(msg.sender,_value);
       payable(msg.sender).transfer(_value);
       if(validationTok.balanceOf(msg.sender)<1000) {
           isAttestor[msg.sender] = false;
       }
   }
    
    event nftBurned (address owner,string uri, uint nonce);

    function transferToDead (uint _tokenId) public {
        address dead = 0x000000000000000000000000000000000000dEaD;
        mynft.transferFrom(msg.sender,dead, _tokenId);
        emit nftBurned(msg.sender,mynft.tokenURI(_tokenId),nonce++);
    }
    event ethReceived (uint amount , address _who, uint nonce);
    function sendEthOver () public payable {
        emit ethReceived((msg.value*9)/10,msg.sender,nonce++);
    }

    struct thisVersion {string uri ; uint attestCount ; mapping (uint => address) attestors; address owner; uint amount; }    
    struct thisTransaction {
        mapping(uint => thisVersion) versions;
        uint versionCount;
        bool minted;
        mapping (address => bool) hasAttested;
    }
    mapping (uint => thisTransaction) public allTransactions;

    event transactionAttested (uint nonce, address requestor);
    function attestTransaction(uint _nonce, string memory _uri , address _owner, uint _amount) public {
        require(isAttestor[msg.sender]);
        require(allTransactions[_nonce].hasAttested[msg.sender] == false);
        thisTransaction storage thisAtt = allTransactions[_nonce];
        bool done;
        for (uint i =0; i<thisAtt.versionCount; i++) 
        {
            thisVersion storage curAtt = thisAtt.versions[i];
            if( keccak256(abi.encodePacked(curAtt.uri)) == keccak256(abi.encodePacked(_uri) )  && _owner == curAtt.owner && curAtt.amount == _amount ) {
                done = true;
                allTransactions[_nonce].versions[i].attestors[allTransactions[_nonce].versions[i].attestCount++] = msg.sender;
                break;
            }
        }
        if(thisAtt.versionCount==0) {
        emit transactionAttested(_nonce, _owner);
        }

        if(done==false) {
    allTransactions[_nonce].versions[thisAtt.versionCount].owner = _owner;
    allTransactions[_nonce].versions[thisAtt.versionCount].uri = _uri;
    allTransactions[_nonce].versions[thisAtt.versionCount].amount= _amount;
    allTransactions[_nonce].versions[thisAtt.versionCount].attestors[allTransactions[_nonce].versions[thisAtt.versionCount].attestCount++] = msg.sender;
    allTransactions[_nonce].versionCount++;
        }
        allTransactions[_nonce].hasAttested[msg.sender] = true;
    }

    function completeAttestedTx (uint _nonce) public {
        require(allTransactions[_nonce].versionCount>0);
        uint winner;
        uint max;
        for(uint i=0; i<allTransactions[_nonce].versionCount;i++){
            if(allTransactions[_nonce].versions[i].attestCount>max){
                max = allTransactions[_nonce].versions[i].attestCount;
                winner = i;
            }
        }
        for(uint i=0; i<allTransactions[_nonce].versionCount;i++){
            if(allTransactions[_nonce].versions[i].attestCount<max){
                for(uint j=0;j<allTransactions[_nonce].versions[i].attestCount;j++){
                    address curAtt = allTransactions[_nonce].versions[i].attestors[j];
                    validationTok.burnByAdmin(curAtt,20);
                }
            }
            else {
                 for(uint j=0;j<allTransactions[_nonce].versions[i].attestCount;j++){
                    address curAtt = allTransactions[_nonce].versions[i].attestors[j];
                    validationTok.mint(curAtt,20);
            }
        }
      if(allTransactions[_nonce].versions[winner].amount == 0)  mynft.safeMint(allTransactions[_nonce].versions[winner].owner,allTransactions[_nonce].versions[winner].uri);
      else payable(allTransactions[_nonce].versions[winner].owner).transfer(allTransactions[_nonce].versions[winner].amount);  
    }
    delete allTransactions[_nonce];
}
struct stake {
    uint tokens;
    uint unlockTimestamp;
} 
    mapping (address =>  mapping(uint => stake) ) public stakes;
    mapping (address => uint ) public stakesNumber;

   function stakeEth(uint period) public payable {
        require(period>30, "staking period must be longer than 30s");
        uint tokenReimburse;
        if(period > 180) {
         tokenReimburse = (msg.value*(100+5))/100;
        }
        else if(period > 120) {
         tokenReimburse = (msg.value*(100+4))/100;
        } 
        else if(period > 60) {
         tokenReimburse = (msg.value*(100+3))/100;
        } 
        else 
         {
         tokenReimburse = (msg.value*(100+2))/100;
             }
        stakes[msg.sender][stakesNumber[msg.sender]++] = stake (
             tokenReimburse, block.timestamp+period
        );
        mytok.mint(msg.sender,tokenReimburse);
    }

     function withdrawStakedEth(uint value) public {
     uint allowed;
     address _who = msg.sender;
     for(uint i=0; i<stakesNumber[_who]; i++){
         uint stakeTimestampp = (stakes[_who][i].unlockTimestamp);
         if(stakeTimestampp<block.timestamp){
         uint curStake = stakes[_who][i].tokens;
             if(allowed + curStake<=value){
             allowed += curStake;
             stakes[_who][i].tokens = 0;
             }
             else {
            uint diff = value-allowed;
             stakes[_who][i].tokens -= (diff);
             allowed += diff ;
             }
         }
     }
        require(allowed==value,"Cannot withdraw tokens!");
         mytok.burnByAdmin(msg.sender,allowed);
         payable(msg.sender).transfer(allowed);
    }
    
struct loanStruct  {
    uint amount;
    uint cutOffTimestamp;
    uint nftTokenId;
    bool set;
    }
mapping(address => loanStruct ) public loan;

function getLoan(uint _amount,uint _period, uint _nftTokenId ) public {
require(!(loan[msg.sender].set), "applicant already has a loan");
require(_amount <1001,"loan amount should be less than 1000wei");
require(_period <3600 ,"loan period should be less than 3600s");
require(mynft.isApprovedForAll(msg.sender, address(this)));
mynft.transferFrom(msg.sender,address(this),_nftTokenId);
loan[msg.sender]= loanStruct(_amount,block.timestamp+_period, _nftTokenId,true);
payable(msg.sender).transfer(_amount);

if(isUser[msg.sender]==false) {
isUser[msg.sender] = true;
users[usersCount++] = msg.sender;
}
}

function returnLoan() public payable {
    loanStruct memory curLoan = loan[msg.sender];
    uint loanAmount = curLoan.amount;
    require(msg.value >= loanAmount);
    mynft.transferFrom(address(this),msg.sender,curLoan.nftTokenId);
    delete loan[msg.sender];
}

function buyCollateralNft (address _borrower) public payable {    
    loanStruct memory curLoan = loan[_borrower];
    require(curLoan.cutOffTimestamp<=block.timestamp);
    require(msg.value >= curLoan.amount);
    mynft.transferFrom(address(this),msg.sender,curLoan.nftTokenId);
    delete loan[_borrower];
}

mapping (uint => address) public users;
uint public usersCount;
mapping (address => bool ) isUser;

}
