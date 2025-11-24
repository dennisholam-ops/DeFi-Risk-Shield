// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RiskAssessment {
    struct PoolRisk {
        string poolAddress;
        uint256 riskScore; // 1-100, 
        uint256 impermanentLossRisk;
        uint256 volatilityRisk;
        uint256 liquidityRisk;
        uint256 contractRisk;
        uint256 lastUpdated;
    }
    
    mapping(string => PoolRisk) public poolRisks;
    address public owner;
    
    event RiskScoreUpdated(string poolAddress, uint256 riskScore);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function calculateImpermanentLossRisk(
        uint256 priceChange
    ) public pure returns (uint256) {
        // 
        if (priceChange <= 10) return 10;    
        if (priceChange <= 50) return 40;    
        if (priceChange <= 100) return 70;   
        return 90;                          
    }
    
    function updatePoolRisk(
        string memory _poolAddress,
        uint256 _volatilityRisk,
        uint256 _liquidityRisk,
        uint256 _contractRisk,
        uint256 _priceChange
    ) public onlyOwner {
        uint256 ilRisk = calculateImpermanentLossRisk(_priceChange);
        
        // 加權計算總風險分數
        uint256 totalRisk = (
            ilRisk * 40 +        
            _volatilityRisk * 25 + 
            _liquidityRisk * 20 +  
            _contractRisk * 15     
        ) / 100;
        
        poolRisks[_poolAddress] = PoolRisk({
            poolAddress: _poolAddress,
            riskScore: 100 - totalRisk, 
            impermanentLossRisk: ilRisk,
            volatilityRisk: _volatilityRisk,
            liquidityRisk: _liquidityRisk,
            contractRisk: _contractRisk,
            lastUpdated: block.timestamp
        });
        
        emit RiskScoreUpdated(_poolAddress, 100 - totalRisk);
    }
    
    function getPoolRisk(string memory _poolAddress) public view returns (
        uint256 riskScore,
        uint256 ilRisk,
        uint256 volatilityRisk,
        uint256 liquidityRisk,
        uint256 contractRisk,
        uint256 lastUpdated
    ) {
        PoolRisk memory risk = poolRisks[_poolAddress];
        return (
            risk.riskScore,
            risk.impermanentLossRisk,
            risk.volatilityRisk,
            risk.liquidityRisk,
            risk.contractRisk,
            risk.lastUpdated
        );
    }
    
    function batchUpdateRisks(
        string[] memory _pools,
        uint256[] memory _params
    ) public onlyOwner {
        require(_pools.length == _params.length / 4, "Invalid input");
        
        for (uint i = 0; i < _pools.length; i++) {
            uint256 startIndex = i * 4;
            updatePoolRisk(
                _pools[i],
                _params[startIndex],     // volatility
                _params[startIndex + 1], // liquidity
                _params[startIndex + 2], // contract
                _params[startIndex + 3]  // price change
            );
        }
    }
}
