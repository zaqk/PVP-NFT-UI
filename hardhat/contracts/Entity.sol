// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "./TuringHelper.sol";

contract Entity is ERC721 {

  uint256 public tokenId;
  TuringHelper public turing;
  string public api;

  // tokenId => health
  mapping(uint256 => uint256) public health;

  event NewEntity(address indexed owner, uint256 tokenId);
  event Attack(uint256 indexed attacker, uint256 indexed target);
  event Dead(uint256 indexed tokenId);

  constructor(address _turing, string memory _api) ERC721("Entity", "ENTITY") {
    turing = TuringHelper(_turing);
    api = _api;
  }

  function tokenURI(uint256 _tokenId) public pure override returns (string memory) {
    return "";
  }

  function mint() external returns (uint256) {
    _mint(msg.sender, tokenId++);
    health[tokenId] = 5;
    emit NewEntity(msg.sender, tokenId);
  }

  function attack(uint256 _attacker, uint256 _target) external {
    require(msg.sender == ownerOf[_attacker], "Unauthorized");
    require(health[_attacker] > 0, "Attacker is dead");
    require(health[_target] > 0, "Target is dead");

    // turing proximity check
    bytes memory payload = abi.enccode(_attacker, _target);
    bool isInProximity = turing.TuringTx(api, payload);
    require(isInProximity, "Attacker is out of range");

    health[_target]--;
    emit Attack(_attacker, _target);

    if (health[_target] == 0) emit Dead(_target);
  }

}