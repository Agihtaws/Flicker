const hre = require("hardhat");

async function main() {
  // Get the network configuration
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  
  // Get the contract factory
  const SomniaSpeedster = await hre.ethers.getContractFactory("SomniaSpeedster");
  
  // Deploy the contract
  console.log("Deploying SomniaSpeedster...");
  const game = await SomniaSpeedster.connect(deployer).deploy();
  
  // Wait for deployment to complete
  await game.waitForDeployment();
  
  // Get the deployed contract address
  const gameAddress = await game.getAddress();
  console.log("SomniaSpeedster deployed to:", gameAddress);
  console.log("Contract deployment complete!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

