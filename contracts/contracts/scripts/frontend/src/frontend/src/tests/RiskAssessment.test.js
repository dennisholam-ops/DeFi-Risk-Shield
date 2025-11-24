const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFi Risk Shield", function () {
  let riskAssessment;
  let priceCalculator;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const PriceCalculator = await ethers.getContractFactory("PriceCalculator");
    priceCalculator = await PriceCalculator.deploy();
    await priceCalculator.deployed();

    const RiskAssessment = await ethers.getContractFactory("RiskAssessment");
    riskAssessment = await RiskAssessment.deploy();
    await riskAssessment.deployed();
  });

  describe("Risk Assessment", function () {
    it("Should calculate impermanent loss risk correctly", async function () {
      const ilRisk = await riskAssessment.calculateImpermanentLossRisk(25);
      expect(ilRisk).to.equal(40); // 25% price change = medium risk
    });

    it("Should update and retrieve pool risk data", async function () {
      const poolAddress = "0x1234567890123456789012345678901234567890";
      
      await riskAssessment.updatePoolRisk(
        poolAddress,
        30, // volatility risk
        20, // liquidity risk  
        10, // contract risk
        25  // price change
      );

      const riskData = await riskAssessment.getPoolRisk(poolAddress);
      
      expect(riskData.riskScore).to.be.greaterThan(0);
      expect(riskData.impermanentLossRisk).to.equal(40);
    });

    it("Only owner should update risk data", async function () {
      await expect(
        riskAssessment.connect(user1).updatePoolRisk(
          "0x123...",
          30, 20, 10, 25
        )
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Price Calculator", function () {
    it("Should calculate price impact", async function () {
      const impact = await priceCalculator.calculatePriceImpact(
        ethers.utils.parseEther("1"),
        ethers.utils.parseEther("100"), 
        ethers.utils.parseEther("200000")
      );
      
      expect(impact).to.be.greaterThan(0);
    });

    it("Should estimate impermanent loss", async function () {
      const loss = await priceCalculator.estimateImpermanentLoss(50); // 50% price change
      expect(loss).to.be.greaterThan(0);
    });
  });
});
