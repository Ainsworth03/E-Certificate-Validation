// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract certificateValidation{

    address private owner ;
    constructor(){
        owner = msg.sender;
    }

    struct Certificate{
        bytes32 hash;
        uint firstSign;
        uint secondSign;
        uint256 timeStamp;
    }

    mapping (bytes32 => Certificate) private certificates;

    modifier onlyOwner () {
        if (msg.sender != owner){
            revert ("Only OWNER can sign e-certificate!");
        }
        _;
    }

    event CertificateAdded(bytes32 indexed hash, uint firstSign, uint secondSign);
    event UnauthorizedAccess(address indexed sender);
    event HashExist(bytes32 indexed hash);

    // e-certificate adding to Blockchain
    function  addCertificate(bytes32 _hash, uint _firstSign, uint _secondSign) public returns (bool) {
        // check is add certificate the owner
        if (msg.sender != owner) {
            emit UnauthorizedAccess (msg.sender);
            return false;
        }

        if (certificates[_hash].hash != bytes32(0)) {
            emit HashExist (_hash);
            return false;
        }

        certificates[_hash] = Certificate({
            hash : _hash,
            firstSign : _firstSign,
            secondSign : _secondSign,
            timeStamp : block.timestamp
        });
    
        emit CertificateAdded(_hash, _firstSign, _secondSign);

        return true;
    }

    function retrieveCertificate(bytes32 _hash) public view returns(uint, uint, uint256){
        require(certificates[_hash].hash != bytes32(0), "e-certificate NOT exist!");
        
        return (certificates[_hash].firstSign, certificates[_hash].secondSign, certificates[_hash].timeStamp);
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }
}