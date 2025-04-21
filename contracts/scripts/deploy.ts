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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
