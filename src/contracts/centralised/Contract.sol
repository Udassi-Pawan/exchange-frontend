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

    function safeMint(address to, string memory uri) public  {
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
    address public owner;
    event ethReceived (uint value,address from );
    exchangeNFT mynft ;
    address public exchangeNftAddr;
    constructor( address _mynft ) {
        owner = msg.sender;
        mynft = exchangeNFT(_mynft);
        exchangeNftAddr = _mynft;
    }

    stakeToken mytok  = new stakeToken();
    address public stakeTokenAddr = address(mytok);
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

    function burnStakedEth(address _who,uint value) public {
     require(msg.sender==owner, "not approved");
     uint allowed;
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
         mytok.burnByAdmin(_who,allowed);
    } 
    function withdrawEth (address _who,uint value) public {
        require(msg.sender==owner);
         payable(_who).transfer(value);
    }
    function acceptEth () payable public {
        emit ethReceived(msg.value, msg.sender);
    }

//////// identity management
struct id  {
    string name;
    uint birth;
    uint creditScore;
}
mapping(address => id ) identity;
mapping (uint => address)  users;
mapping (address => bool)  isUser;
uint public usersCount;

function getUser(uint _who) public view returns (address) {
    require(msg.sender==owner);
    return users[_who];
}

function getIsUser(address _who) public view returns (bool) {
    require(msg.sender==owner);
    return isUser[_who];
}


function checkIdentity (address _who) public view returns (id memory) {
    require(msg.sender == owner);   
    return identity[_who];
}
function checkLoan (address _who) public view returns (loanStruct memory) {
    require(msg.sender == owner);   
    return loan[_who];
}

struct loanStruct  {
    uint amount;
    uint cutOffTimestamp;
    string nftChainId;
    string nftTokenId;
    bool collateralSold;
    bool set;
    }
mapping(address => loanStruct ) loan;

function setIdentity (address _who,string memory _name , uint _birth, uint _creditScore) public {
require(msg.sender==owner);
identity[_who] = id (_name,_birth,_creditScore);
}

event Loan(address _borrower,uint _amount,uint _expireTimestamp, string _nftChainId, string _nftTokenId );
function getLoan(address _borrower,uint _amount,uint _period, string memory _nftChainId, string memory _nftTokenId ) public {
require(msg.sender==owner, "only contract owner is authorised");
require(!(loan[_borrower].set), "applicant already has a loan");
require(_period <= 3600, "Loan period should be less than 3600s.");
loan[_borrower]= loanStruct(_amount,block.timestamp+_period,_nftChainId, _nftTokenId,false,true);
payable(_borrower).transfer(_amount);
if(isUser[_borrower]==false) {users[usersCount++]=_borrower; isUser[_borrower]=true; }
emit Loan(_borrower,_amount,block.timestamp+_period,_nftChainId, _nftTokenId);
}

function returnLoan() public payable {
    loanStruct memory curLoan = loan[msg.sender];
    uint loanAmount = curLoan.amount;
    require(msg.value >= loanAmount);
    require(curLoan.collateralSold==false);
    delete loan[msg.sender];
}

function setCollateralSold (address _borrower) public {
    require(msg.sender==owner);
    loan[_borrower].collateralSold = true;
}

}
