import { expect } from "chai";
import { ethers } from "hardhat";
import { EncryptionKeyRegistry } from "../typechain-types";

describe("EncryptionKeyRegistry", function () {
  let encryptionKeyRegistry: EncryptionKeyRegistry;
  let owner: any, user1: any, user2: any;

  const pubKey1 = "0x1234567890abcdef";
  const pubKey2 = "0xabcdef1234567890";

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const EncryptionKeyRegistryFactory = await ethers.getContractFactory(
      "EncryptionKeyRegistry"
    );
    encryptionKeyRegistry =
      (await EncryptionKeyRegistryFactory.deploy()) as EncryptionKeyRegistry;
    await encryptionKeyRegistry.waitForDeployment();
  });

  it("should allow a user to set their public encryption key", async () => {
    await expect(
      encryptionKeyRegistry.connect(user1).setPublicEncryptionKey(pubKey1)
    )
      .to.emit(encryptionKeyRegistry, "PublicEncryptionKeySet")
      .withArgs(user1.address, pubKey1);

    const storedKey = await encryptionKeyRegistry.getPublicEncryptionKey(
      user1.address
    );
    expect(storedKey).to.equal(pubKey1);
  });

  it("should allow a user to update their public encryption key", async () => {
    await encryptionKeyRegistry.connect(user1).setPublicEncryptionKey(pubKey1);
    await expect(
      encryptionKeyRegistry.connect(user1).setPublicEncryptionKey(pubKey2)
    )
      .to.emit(encryptionKeyRegistry, "PublicEncryptionKeySet")
      .withArgs(user1.address, pubKey2);

    const storedKey = await encryptionKeyRegistry.getPublicEncryptionKey(
      user1.address
    );
    expect(storedKey).to.equal(pubKey2);
  });

  it("should return empty string for users with no key set", async () => {
    const storedKey = await encryptionKeyRegistry.getPublicEncryptionKey(
      user2.address
    );
    expect(storedKey).to.equal("");
  });

  it("should allow multiple users to set and retrieve their keys independently", async () => {
    await encryptionKeyRegistry.connect(user1).setPublicEncryptionKey(pubKey1);
    await encryptionKeyRegistry.connect(user2).setPublicEncryptionKey(pubKey2);

    const key1 = await encryptionKeyRegistry.getPublicEncryptionKey(
      user1.address
    );
    const key2 = await encryptionKeyRegistry.getPublicEncryptionKey(
      user2.address
    );

    expect(key1).to.equal(pubKey1);
    expect(key2).to.equal(pubKey2);
  });
});
