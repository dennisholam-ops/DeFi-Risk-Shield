// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PriceCalculator {
    function calculatePriceImpact(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 priceImpact) {
        // Simplified price impact calculation
        uint256 k = reserveIn * reserveOut;
        uint256 newReserveIn = reserveIn + amountIn;
        uint256 newReserveOut = k / newReserveIn;
        
        uint256 idealPrice = (reserveOut * 1e18) / reserveIn;
        uint256 actualPrice = (newReserveOut * 1e18) / newReserveIn;
        
        if (idealPrice > actualPrice) {
            priceImpact = ((idealPrice - actualPrice) * 100) / idealPrice;
        } else {
            priceImpact = 0;
        }
    }
    
    function estimateImpermanentLoss(
        int256 priceRatioChange // Price change percentage (e.g., 20 for 20%)
    ) public pure returns (uint256 lossPercentage) {
        // Impermanent loss estimation formula
        uint256 absChange = uint256(priceRatioChange > 0 ? priceRatioChange : -priceRatioChange);
        uint256 p = absChange * 1e16; // Convert to decimal
        
        // IL ≈ (sqrt(p) - 1)^2 / (2 * sqrt(p))
        if (p == 0) return 0;
        
        uint256 sqrtP = sqrt(p * 1e18);
        uint256 numerator = (sqrtP > 1e18) ? (sqrtP - 1e18) ** 2 : 0;
        uint256 denominator = (2 * sqrtP) / 1e9;
        
        lossPercentage = numerator / denominator / 1e16;
    }
    
    // Square root calculation
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
