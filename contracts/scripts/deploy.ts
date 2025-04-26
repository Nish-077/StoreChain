import { ethers } from "hardhat";

async function main() {
  const StorageRegistry = await ethers.getContractFactory("StorageRegistry");
  const storageRegistry = await StorageRegistry.deploy();
  await storageRegistry.waitForDeployment();
  console.log(
    "StorageRegistry deployed to:",
    await storageRegistry.getAddress()
  );

  const AccessControl = await ethers.getContractFactory("AccessControl");
  const accessControl = await AccessControl.deploy(
    await storageRegistry.getAddress()
  );
  await accessControl.waitForDeployment();
  console.log("AccessControl deployed to:", await accessControl.getAddress());

  const EncryptionKeyRegistry = await ethers.getContractFactory(
    "EncryptionKeyRegistry"
  );
  const encryptionKeyRegistry = await EncryptionKeyRegistry.deploy();
  await encryptionKeyRegistry.waitForDeployment();
  console.log(
    "EncryptionKeyRegistry deployed to:",
    await encryptionKeyRegistry.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
