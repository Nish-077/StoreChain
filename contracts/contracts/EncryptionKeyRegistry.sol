// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EncryptionKeyRegistry
/// @notice Stores public encryption keys for users to enable decentralized access control.
contract EncryptionKeyRegistry {
    /// @dev Maps user address to their public encryption key (hex-encoded, e.g. from MetaMask)
    mapping(address => string) public publicEncryptionKeys;

    /// @notice Emitted when a user sets or updates their public encryption key
    event PublicEncryptionKeySet(address indexed user, string publicKey);

    /// @notice Set or update the caller's public encryption key
    /// @param publicKey The user's public encryption key (hex or base64 encoded)
    function setPublicEncryptionKey(string calldata publicKey) external {
        publicEncryptionKeys[msg.sender] = publicKey;
        emit PublicEncryptionKeySet(msg.sender, publicKey);
    }

    /// @notice Get the public encryption key for a user
    /// @param user The address of the user
    /// @return The user's public encryption key
    function getPublicEncryptionKey(address user) external view returns (string memory) {
        return publicEncryptionKeys[user];
    }
}