import { expect } from "chai";
import { ethers } from "hardhat";
import { StorageRegistry } from "../typechain-types";

describe("StorageRegistry", function () {
  let storageRegistry: StorageRegistry;
  let owner: any, user1: any, user2: any;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const StorageRegistryFactory = await ethers.getContractFactory(
      "StorageRegistry"
    );
    storageRegistry =
      (await StorageRegistryFactory.deploy()) as StorageRegistry;
    await storageRegistry.waitForDeployment();
  });

  it("should store a new file CID", async () => {
    const cid = "QmTestCID1";
    const tx = await storageRegistry.connect(user1).storeFile(cid);
    const receipt = await tx.wait();
    const event = receipt?.logs
      .map((log) => storageRegistry.interface.parseLog(log))
      .find((e) => e && e.name === "FileStored");
    expect(event?.args.user).to.equal(user1.address);
    expect(event?.args.cid).to.equal(cid);
    expect(event?.args.timestamp).to.be.a("bigint");
  });

  it("should not allow storing the same CID twice for the same user", async () => {
    const cid = "QmTestCID2";
    await storageRegistry.connect(user1).storeFile(cid);
    await expect(
      storageRegistry.connect(user1).storeFile(cid)
    ).to.be.revertedWith("CID already exists");
  });

  it("should allow different users to store the same CID", async () => {
    const cid = "QmTestCID3";
    await storageRegistry.connect(user1).storeFile(cid);
    await expect(storageRegistry.connect(user2).storeFile(cid)).to.emit(
      storageRegistry,
      "FileStored"
    );
  });

  it("should delete a file by CID", async () => {
    const cid = "QmTestCID4";
    await storageRegistry.connect(user1).storeFile(cid);
    await expect(storageRegistry.connect(user1).deleteFile(cid))
      .to.emit(storageRegistry, "FileDeleted")
      .withArgs(user1.address, cid);
    const [cids] = await storageRegistry.getUserFiles(user1.address);
    expect(cids.length).to.equal(0);
  });

  it("should revert when deleting a non-existent CID", async () => {
    await expect(
      storageRegistry.connect(user1).deleteFile("QmFakeCID")
    ).to.be.revertedWith("CID not found");
  });

  it("should update a file's CID", async () => {
    const oldCid = "QmOldCID";
    const newCid = "QmNewCID";
    await storageRegistry.connect(user1).storeFile(oldCid);
    const tx = await storageRegistry.connect(user1).updateFile(oldCid, newCid);
    const receipt = await tx.wait();
    const event = receipt?.logs
      .map((log) => storageRegistry.interface.parseLog(log))
      .find((e) => e && e.name === "FileUpdated");
    expect(event?.args.user).to.equal(user1.address);
    expect(event?.args.oldCid).to.equal(oldCid);
    expect(event?.args.newCid).to.equal(newCid);
    expect(event?.args.timestamp).to.be.a("bigint");
  });

  it("should revert when updating to an existing CID", async () => {
    const cid1 = "QmCID1";
    const cid2 = "QmCID2";
    await storageRegistry.connect(user1).storeFile(cid1);
    await storageRegistry.connect(user1).storeFile(cid2);
    await expect(
      storageRegistry.connect(user1).updateFile(cid1, cid2)
    ).to.be.revertedWith("New CID already exists");
  });

  it("should return correct file count", async () => {
    expect(await storageRegistry.getUserFileCount(user1.address)).to.equal(0);
    await storageRegistry.connect(user1).storeFile("QmA");
    await storageRegistry.connect(user1).storeFile("QmB");
    expect(await storageRegistry.getUserFileCount(user1.address)).to.equal(2);
  });

  // Helper to get the current block timestamp
  async function getBlockTimestamp() {
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    if (!block) {
      throw new Error("Failed to fetch the block");
    }
    return block.timestamp;
  }
});
