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
    // owner => cid => accessor => encryptedKey (encrypted with accessor's public key)
    mapping(address => mapping(string => mapping(address => bytes)))
        private encryptedKeys;

    // NEW: accessor => list of (owner, cid) pairs they have access to
    struct FileAccess {
        address owner;
        string cid;
    }
    mapping(address => FileAccess[]) private accessibleFiles;

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
    event EncryptedKeySet(
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

    /// @notice Grant access to a file CID to another address and set encrypted key for accessor
    function grantAccessWithKey(
        string calldata cid,
        address accessor,
        bytes calldata encryptedKey
    ) external {
        require(accessor != msg.sender, "Cannot grant access to self");
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
        require(encryptedKey.length > 0, "Encrypted key required");

        accessPermissions[msg.sender][cid][accessor] = true;
        accessorsList[msg.sender][cid].push(accessor);
        encryptedKeys[msg.sender][cid][accessor] = encryptedKey;

        // Add to accessor's accessibleFiles
        accessibleFiles[accessor].push(FileAccess(msg.sender, cid));

        emit AccessGranted(msg.sender, cid, accessor);
        emit EncryptedKeySet(msg.sender, cid, accessor);
    }

    /// @notice Set or update the encrypted key for the owner (self)
    function setOwnerEncryptedKey(
        string calldata cid,
        bytes calldata encryptedKey
    ) external {
        require(_cidExists(msg.sender, cid), "CID does not exist for owner");
        require(encryptedKey.length > 0, "Encrypted key required");
        encryptedKeys[msg.sender][cid][msg.sender] = encryptedKey;
        emit EncryptedKeySet(msg.sender, cid, msg.sender);
    }

    /// @notice Revoke access and remove encrypted key
    function revokeAccess(string calldata cid, address accessor) external {
        require(accessPermissions[msg.sender][cid][accessor], "Not granted");
        accessPermissions[msg.sender][cid][accessor] = false;
        delete encryptedKeys[msg.sender][cid][accessor];
        // Remove accessor from list (swap and pop)
        address[] storage list = accessorsList[msg.sender][cid];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == accessor) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
        // Remove from accessor's accessibleFiles
        FileAccess[] storage files = accessibleFiles[accessor];
        for (uint256 i = 0; i < files.length; i++) {
            if (
                files[i].owner == msg.sender &&
                keccak256(bytes(files[i].cid)) == keccak256(bytes(cid))
            ) {
                files[i] = files[files.length - 1];
                files.pop();
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

    /// @notice Retrieve the encrypted key for the caller (accessor or owner)
    function getEncryptedKey(
        address owner,
        string calldata cid
    ) external view returns (bytes memory) {
        require(
            msg.sender == owner || accessPermissions[owner][cid][msg.sender],
            "Not authorized"
        );
        return encryptedKeys[owner][cid][msg.sender];
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

    /// @notice Get all files (owner, cid) the accessor has access to
    function getAccessibleFiles(
        address accessor
    ) external view returns (FileAccess[] memory) {
        return accessibleFiles[accessor];
    }
}
