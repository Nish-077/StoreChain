// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStorageRegistry {
    function getUserFileCount(address user) external view returns (uint256);
    function getUserFiles(
        address user
    ) external view returns (string[] memory, uint256[] memory);
}

contract AccessControl {
    // file owner => cid => accessor => access granted
    mapping(address => mapping(string => mapping(address => bool)))
        private accessPermissions;
    // file owner => cid => list of accessors
    mapping(address => mapping(string => address[])) private accessorsList;

    IStorageRegistry public storageRegistry;

    event AccessGranted(
        address indexed owner,
        string cid,
        address indexed accessor
    );
    event AccessRevoked(
        address indexed owner,
        string cid,
        address indexed accessor
    );

    constructor(address storageRegistryAddress) {
        require(
            storageRegistryAddress != address(0),
            "Invalid StorageRegistry address"
        );
        storageRegistry = IStorageRegistry(storageRegistryAddress);
    }

    /// @notice Internal helper to check if a CID exists for an owner in StorageRegistry
    function _cidExists(
        address owner,
        string memory cid
    ) internal view returns (bool) {
        (string[] memory cids, ) = storageRegistry.getUserFiles(owner);
        for (uint256 i = 0; i < cids.length; i++) {
            if (keccak256(bytes(cids[i])) == keccak256(bytes(cid))) {
                return true;
            }
        }
        return false;
    }

    /// @notice Grant access to a file CID to another address
    /// @param cid The file's IPFS CID
    /// @param accessor The address to grant access to
    function grantAccess(string calldata cid, address accessor) external {
        require(accessor != address(0), "Invalid accessor");
        require(
            !_isInAccessorsList(msg.sender, cid, accessor),
            "Accessor already in list"
        );
        require(
            !accessPermissions[msg.sender][cid][accessor],
            "Already granted"
        );
        require(_cidExists(msg.sender, cid), "CID does not exist for owner");

        accessPermissions[msg.sender][cid][accessor] = true;
        accessorsList[msg.sender][cid].push(accessor);
        emit AccessGranted(msg.sender, cid, accessor);
    }

    /// @notice Revoke access to a file CID from another address
    /// @param cid The file's IPFS CID
    /// @param accessor The address to revoke access from
    function revokeAccess(string calldata cid, address accessor) external {
        require(accessPermissions[msg.sender][cid][accessor], "Not granted");
        accessPermissions[msg.sender][cid][accessor] = false;
        // Remove accessor from list (swap and pop)
        address[] storage list = accessorsList[msg.sender][cid];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == accessor) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
        emit AccessRevoked(msg.sender, cid, accessor);
    }

    /// @notice Check if an address has access to a file CID
    function hasAccess(
        address owner,
        string calldata cid,
        address accessor
    ) external view returns (bool) {
        return owner == accessor || accessPermissions[owner][cid][accessor];
    }

    /// @notice Get all addresses with access to a file CID
    function getFileAccessors(
        address owner,
        string calldata cid
    ) external view returns (address[] memory) {
        return accessorsList[owner][cid];
    }

    /// @dev Prevent duplicate accessor entries in the accessorsList array
    function _isInAccessorsList(
        address owner,
        string memory cid,
        address accessor
    ) internal view returns (bool) {
        address[] storage list = accessorsList[owner][cid];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == accessor) {
                return true;
            }
        }
        return false;
    }
}
