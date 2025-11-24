import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import RiskAssessment from './contracts/RiskAssessment.json';
import PriceCalculator from './contracts/PriceCalculator.json';
import contractAddresses from './contracts/contract-addresses.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [riskContract, setRiskContract] = useState(null);
  const [priceContract, setPriceContract] = useState(null);
  const [account, setAccount] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize Ethereum connection
  const initEthereum = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        const web3Signer = web3Provider.getSigner();
        setSigner(web3Signer);
        
        const userAddress = await web3Signer.getAddress();
        setAccount(userAddress.substring(0, 8) + '...');

        // Initialize contracts
        const riskInstance = new ethers.Contract(
          contractAddresses.riskAssessment,
          RiskAssessment.abi,
          web3Signer
        );
        setRiskContract(riskInstance);

        const priceInstance = new ethers.Contract(
          contractAddresses.priceCalculator,
          PriceCalculator.abi,
          web3Signer
        );
        setPriceContract(priceInstance);

      } catch (error) {
        console.error('Error initializing Ethereum:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Check risk score
  const checkRiskScore = async () => {
    if (!riskContract || !poolAddress) return;
    
    setLoading(true);
    try {
      const risk = await riskContract.getPoolRisk(poolAddress);
      
      setRiskData({
        riskScore: risk.riskScore.toNumber(),
        impermanentLossRisk: risk.ilRisk.toNumber(),
        volatilityRisk: risk.volatilityRisk.toNumber(),
        liquidityRisk: risk.liquidityRisk.toNumber(),
        contractRisk: risk.contractRisk.toNumber(),
        lastUpdated: new Date(risk.lastUpdated.toNumber() * 1000).toLocaleDateString()
      });
    } catch (error) {
      console.error('Error fetching risk score:', error);
      alert('Error fetching risk data. The pool might not be registered.');
    }
    setLoading(false);
  };

  // Calculate price impact
  const calculatePriceImpact = async () => {
    if (!priceContract) return;
    
    // Example calculation
    const impact = await priceContract.calculatePriceImpact(
      ethers.utils.parseEther("1"), // 1 ETH
      ethers.utils.parseEther("100"), // 100 ETH reserve
      ethers.utils.parseEther("200000") // 200,000 USDC reserve
    );
    
    console.log("Price Impact:", impact.toString());
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Low Risk', color: '#10B981' };
    if (score >= 60) return { level: 'Medium Risk', color: '#F59E0B' };
    if (score >= 40) return { level: 'High Risk', color: '#EF4444' };
    return { level: 'Very High Risk', color: '#7F1D1D' };
  };

  useEffect(() => {
    initEthereum();
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🛡️ DeFi Risk Shield</h1>
        <p>Protect your DeFi investments from impermanent loss and protocol risks</p>
        {account && <div className="account">Connected: {account}</div>}
      </header>

      <main className="main-content">
        <div className="risk-checker">
          <h2>Liquidity Pool Risk Assessment</h2>
          <div className="input-section">
            <input
              type="text"
              placeholder="Enter liquidity pool address (0x...)"
              value={poolAddress}
              onChange={(e) => setPoolAddress(e.target.value)}
              className="address-input"
            />
            <button 
              onClick={checkRiskScore} 
              disabled={loading || !poolAddress}
              className="check-button"
            >
              {loading ? 'Analyzing...' : 'Check Risk'}
            </button>
          </div>

          {riskData && (
            <div className="risk-results">
              <div className="overall-risk">
                <h3>Overall Risk Score</h3>
                <div 
                  className="risk-score"
                  style={{ color: getRiskLevel(riskData.riskScore).color }}
                >
                  {riskData.riskScore}/100
                </div>
                <div className="risk-level">
                  {getRiskLevel(riskData.riskScore).level}
                </div>
              </div>

              <div className="risk-breakdown">
                <h4>Risk Breakdown</h4>
                <div className="risk-item">
                  <span>Impermanent Loss Risk:</span>
                  <span>{riskData.impermanentLossRisk}/100</span>
                </div>
                <div className="risk-item">
                  <span>Volatility Risk:</span>
                  <span>{riskData.volatilityRisk}/100</span>
                </div>
                <div className="risk-item">
                  <span>Liquidity Risk:</span>
                  <span>{riskData.liquidityRisk}/100</span>
                </div>
                <div className="risk-item">
                  <span>Contract Risk:</span>
                  <span>{riskData.contractRisk}/100</span>
                </div>
                <div className="last-updated">
                  Last Updated: {riskData.lastUpdated}
                </div>
              </div>
            </div>
          )}

          <div className="features">
            <h3>✨ Core Features</h3>
            <div className="feature-grid">
              <div className="feature-card">
                <h4>🔍 Impermanent Loss Analysis</h4>
                <p>Predict potential impermanent loss based on price volatility</p>
              </div>
              <div className="feature-card">
                <h4>📊 Risk Scoring</h4>
                <p>Comprehensive multi-factor risk assessment</p>
              </div>
              <div className="feature-card">
                <h4>🛡️ Contract Security</h4>
                <p>Smart contract vulnerability risk assessment</p>
              </div>
              <div className="feature-card">
                <h4>💧 Liquidity Analysis</h4>
                <p>Liquidity depth and slippage analysis</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ for Alchemy University EVM Certification</p>
      </footer>
    </div>
  );
}

export default App;
