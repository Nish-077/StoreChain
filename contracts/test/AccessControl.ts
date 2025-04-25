import { expect } from "chai";
import { ethers } from "hardhat";
import { StorageRegistry, AccessControl } from "../typechain-types";

describe("AccessControl", function () {
  let storageRegistry: StorageRegistry;
  let accessControl: AccessControl;
  let owner: any, user1: any, user2: any, user3: any;

  // Dummy encrypted key for testing
  const dummyEncryptedKey = ethers.hexlify(ethers.randomBytes(32));
  const dummyEncryptedKey2 = ethers.hexlify(ethers.randomBytes(32));

  beforeEach(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();
    // Deploy StorageRegistry
    const StorageRegistryFactory = await ethers.getContractFactory(
      "StorageRegistry"
    );
    storageRegistry =
      (await StorageRegistryFactory.deploy()) as StorageRegistry;
    await storageRegistry.waitForDeployment();

    // Deploy AccessControl with StorageRegistry address
    const AccessControlFactory = await ethers.getContractFactory(
      "AccessControl"
    );
    accessControl = (await AccessControlFactory.deploy(
      storageRegistry.getAddress()
    )) as AccessControl;
    await accessControl.waitForDeployment();

    // user1 stores a file
    await storageRegistry.connect(user1).storeFile("QmCID1");
  });

  it("should grant access to a file CID", async () => {
    await expect(
      accessControl.connect(user1).grantAccess("QmCID1", user2.address)
    )
      .to.emit(accessControl, "AccessGranted")
      .withArgs(user1.address, "QmCID1", user2.address);

    expect(
      await accessControl.hasAccess(user1.address, "QmCID1", user2.address)
    ).to.equal(true);
  });

  it("should grant access with encrypted key and allow accessor to get it", async () => {
    await expect(
      accessControl.connect(user1).grantAccessWithKey(
        "QmCID1",
        user2.address,
        dummyEncryptedKey
      )
    )
      .to.emit(accessControl, "AccessGranted")
      .withArgs(user1.address, "QmCID1", user2.address);

    // Accessor can get their encrypted key
    const key = await accessControl.connect(user2).getEncryptedKey(
      user1.address,
      "QmCID1"
    );
    expect(key).to.equal(dummyEncryptedKey);

    // Owner can also get the encrypted key for accessor (should be empty)
    const ownerKey = await accessControl.connect(user1).getEncryptedKey(
      user1.address,
      "QmCID1"
    );
    expect(ownerKey).to.equal("0x");
  });

  it("should allow owner to set or update encrypted key for accessor", async () => {
    await accessControl.connect(user1).grantAccessWithKey(
      "QmCID1",
      user2.address,
      dummyEncryptedKey
    );
    // Update encrypted key
    await expect(
      accessControl.connect(user1).setEncryptedKey(
        "QmCID1",
        user2.address,
        dummyEncryptedKey2
      )
    )
      .to.emit(accessControl, "EncryptedKeySet")
      .withArgs(user1.address, "QmCID1", user2.address);

    const key = await accessControl.connect(user2).getEncryptedKey(
      user1.address,
      "QmCID1"
    );
    expect(key).to.equal(dummyEncryptedKey2);
  });

  it("should not allow non-owner to set encrypted key", async () => {
    await accessControl.connect(user1).grantAccessWithKey(
      "QmCID1",
      user2.address,
      dummyEncryptedKey
    );
    await expect(
      accessControl.connect(user2).setEncryptedKey(
        "QmCID1",
        user2.address,
        dummyEncryptedKey2
      )
    ).to.be.revertedWith("No access granted");
  });

  it("should not allow setting empty encrypted key", async () => {
    await accessControl.connect(user1).grantAccess("QmCID1", user2.address);
    await expect(
      accessControl.connect(user1).setEncryptedKey(
        "QmCID1",
        user2.address,
        "0x"
      )
    ).to.be.revertedWith("Encrypted key required");
  });

  it("should revoke access and remove encrypted key", async () => {
    await accessControl.connect(user1).grantAccessWithKey(
      "QmCID1",
      user2.address,
      dummyEncryptedKey
    );
    await expect(
      accessControl.connect(user1).revokeAccess("QmCID1", user2.address)
    )
      .to.emit(accessControl, "AccessRevoked")
      .withArgs(user1.address, "QmCID1", user2.address);

    expect(
      await accessControl.hasAccess(user1.address, "QmCID1", user2.address)
    ).to.equal(false);

    // Accessor cannot get encrypted key anymore
    await expect(
      accessControl.connect(user2).getEncryptedKey(user1.address, "QmCID1")
    ).to.be.revertedWith("Not authorized");
  });

  it("should not allow getting encrypted key if not authorized", async () => {
    await accessControl.connect(user1).grantAccessWithKey(
      "QmCID1",
      user2.address,
      dummyEncryptedKey
    );
    await expect(
      accessControl.connect(user3).getEncryptedKey(user1.address, "QmCID1")
    ).to.be.revertedWith("Not authorized");
  });

  it("should not grant access if CID does not exist", async () => {
    await expect(
      accessControl.connect(user1).grantAccess("QmFake", user2.address)
    ).to.be.revertedWith("CID does not exist for owner");
  });

  it("should not allow duplicate accessors", async () => {
    await accessControl.connect(user1).grantAccess("QmCID1", user2.address);
    await expect(
      accessControl.connect(user1).grantAccess("QmCID1", user2.address)
    ).to.be.revertedWith("Accessor already in list");
  });

  it("should return all accessors for a file", async () => {
    await accessControl.connect(user1).grantAccess("QmCID1", user2.address);
    await accessControl.connect(user1).grantAccess("QmCID1", user3.address);
    const accessors = await accessControl.getFileAccessors(
      user1.address,
      "QmCID1"
    );
    expect(accessors).to.include.members([user2.address, user3.address]);
    expect(accessors.length).to.equal(2);
  });

  it("should allow owner to always have access", async () => {
    expect(
      await accessControl.hasAccess(user1.address, "QmCID1", user1.address)
    ).to.equal(true);
  });

  it("should not allow granting access to zero address", async () => {
    await expect(
      accessControl.connect(user1).grantAccess("QmCID1", ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid accessor");
  });

  it("should handle granting and revoking access for multiple CIDs per user", async () => {
    // user1 stores two files
    await storageRegistry.connect(user1).storeFile("QmCID2");
    // Grant access to user2 for both CIDs
    await accessControl.connect(user1).grantAccess("QmCID1", user2.address);
    await accessControl.connect(user1).grantAccess("QmCID2", user2.address);

    expect(
      await accessControl.hasAccess(user1.address, "QmCID1", user2.address)
    ).to.equal(true);
    expect(
      await accessControl.hasAccess(user1.address, "QmCID2", user2.address)
    ).to.equal(true);

    // Revoke access for one CID
    await accessControl.connect(user1).revokeAccess("QmCID1", user2.address);

    expect(
      await accessControl.hasAccess(user1.address, "QmCID1", user2.address)
    ).to.equal(false);
    expect(
      await accessControl.hasAccess(user1.address, "QmCID2", user2.address)
    ).to.equal(true);
  });

  it("should not automatically revoke access in AccessControl when file is deleted in StorageRegistry", async () => {
    // Grant access to user2 for QmCID1
    await accessControl.connect(user1).grantAccess("QmCID1", user2.address);

    // Delete the file in StorageRegistry
    await storageRegistry.connect(user1).deleteFile("QmCID1");

    // AccessControl still shows access as granted (since no automatic sync)
    expect(
      await accessControl.hasAccess(user1.address, "QmCID1", user2.address)
    ).to.equal(true);

    // Optionally, you can add a note:
    // In a real application, you may want to add logic to clean up permissions when files are deleted.
  });
});
