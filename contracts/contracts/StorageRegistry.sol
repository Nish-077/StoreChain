// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title StorageRegistry
/// @notice Maps users to their stored file CIDs and records upload timestamps. Supports deletion, update, and CID uniqueness.
contract StorageRegistry {
    struct FileMeta {
        string cid;
        uint256 timestamp;
    }

    // user address => array of FileMeta
    mapping(address => FileMeta[]) private userFiles;
    // user address => cid => index+1 (0 means not present)
    mapping(address => mapping(string => uint256)) private userCidIndex;

    event FileStored(address indexed user, string cid, uint256 timestamp);
    event FileDeleted(address indexed user, string cid);
    event FileUpdated(
        address indexed user,
        string oldCid,
        string newCid,
        uint256 timestamp
    );

    /// @notice Store a new file CID for the sender (unique per user)
    /// @param cid The IPFS Content Identifier of the file
    function storeFile(string calldata cid) external {
        require(bytes(cid).length > 0, "CID required");
        require(userCidIndex[msg.sender][cid] == 0, "CID already exists");
        userFiles[msg.sender].push(FileMeta(cid, block.timestamp));
        userCidIndex[msg.sender][cid] = userFiles[msg.sender].length; // index+1
        emit FileStored(msg.sender, cid, block.timestamp);
    }

    /// @notice Delete a file by CID for the sender
    /// @param cid The IPFS Content Identifier of the file to delete
    function deleteFile(string calldata cid) external {
        uint256 idx = userCidIndex[msg.sender][cid];
        require(idx > 0, "CID not found");
        uint256 index = idx - 1;
        uint256 lastIndex = userFiles[msg.sender].length - 1;

        // Swap with last and pop
        if (index != lastIndex) {
            FileMeta memory lastMeta = userFiles[msg.sender][lastIndex];
            userFiles[msg.sender][index] = lastMeta;
            userCidIndex[msg.sender][lastMeta.cid] = index + 1;
        }
        userFiles[msg.sender].pop();
        delete userCidIndex[msg.sender][cid];
        emit FileDeleted(msg.sender, cid);
    }

    /// @notice Update a file's CID for the sender
    /// @param oldCid The old IPFS CID
    /// @param newCid The new IPFS CID
    function updateFile(
        string calldata oldCid,
        string calldata newCid
    ) external {
        require(bytes(newCid).length > 0, "New CID required");
        uint256 idx = userCidIndex[msg.sender][oldCid];
        require(idx > 0, "Old CID not found");
        require(
            userCidIndex[msg.sender][newCid] == 0,
            "New CID already exists"
        );
        uint256 index = idx - 1;
        userFiles[msg.sender][index].cid = newCid;
        userFiles[msg.sender][index].timestamp = block.timestamp;
        userCidIndex[msg.sender][newCid] = idx;
        delete userCidIndex[msg.sender][oldCid];
        emit FileUpdated(msg.sender, oldCid, newCid, block.timestamp);
    }

    /// @notice Get all files stored by a user
    function getUserFiles(
        address user
    )
        external
        view
        returns (string[] memory cids, uint256[] memory timestamps)
    {
        uint256 len = userFiles[user].length;
        cids = new string[](len);
        timestamps = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            cids[i] = userFiles[user][i].cid;
            timestamps[i] = userFiles[user][i].timestamp;
        }
    }

    /// @notice Get the number of files stored by a user
    function getUserFileCount(address user) external view returns (uint256) {
        return userFiles[user].length;
    }
}
