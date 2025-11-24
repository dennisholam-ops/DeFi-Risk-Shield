const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Price Calculator
  const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
  const priceCalculator = await PriceCalculator.deploy();
  await priceCalculator.deployed();
  console.log("PriceCalculator deployed to:", priceCalculator.address);

  // Deploy Risk Assessment Contract
  const RiskAssessment = await ethers.getContractFactory("RiskAssessment");
  const riskAssessment = await RiskAssessment.deploy();
  await riskAssessment.deployed();
  console.log("RiskAssessment deployed to:", riskAssessment.address);

  // Save contract addresses to file
  const fs = require("fs");
  const contracts = {
    riskAssessment: riskAssessment.address,
    priceCalculator: priceCalculator.address,
    network: network.name
  };
  
  fs.writeFileSync(
    "frontend/src/contracts/contract-addresses.json",
    JSON.stringify(contracts, null, 2)
  );

  // Save ABIs
  const riskAssessmentArtifact = await artifacts.readArtifact("RiskAssessment");
  const priceCalculatorArtifact = await artifacts.readArtifact("PriceCalculator");
  
  fs.writeFileSync(
    "frontend/src/contracts/RiskAssessment.json",
    JSON.stringify(riskAssessmentArtifact, null, 2)
  );
  
  fs.writeFileSync(
    "frontend/src/contracts/PriceCalculator.json",
    JSON.stringify(priceCalculatorArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
