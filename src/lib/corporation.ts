// Industries
// expandIndustry(industryType, divisionName) 	Expand to a new industry
// getIndustryData(industryName) 	Get constant industry definition data for a specific industry
// getMaterialData(materialName) 	Get constant data for a specific material

// Miscellaneous
// nextUpdate() 	Sleep until the next Corporation update has happened.
// getBonusTime() 	Get bonus time. “Bonus time” is accumulated when the game is offline or if the game is inactive in the browser. “Bonus time” makes the game progress faster.
// getConstants() 	Get corporation related constants
// bribe(factionName, amountCash) 	Bribe a faction

// Corporation
// hasCorporation() 	Returns whether the player has a corporation. Does not require API access.
// getCorporation() 	Get corporation data
// goPublic(numShares) 	Go public
// acceptInvestmentOffer() 	Accept investment based on you companies current valuation
// getInvestmentOffer() 	Get an offer for investment based on you companies current valuation
// createCorporation(corporationName, selfFund) 	Create a Corporation
// expandCity(divisionName, city) 	Expand to a new city

// Division
// sellDivision(divisionName) 	Sell a division
// getDivision(divisionName) 	Get division data

// Upgrade
// levelUpgrade(upgradeName) 	Level an upgrade.
// purchaseUnlock(upgradeName) 	Unlock an upgrade
// hasUnlock(upgradeName) 	Check if you have a one time unlockable upgrade
// getUnlockCost(upgradeName) 	Gets the cost to unlock a one time unlockable upgrade
// getUpgradeLevel(upgradeName) 	Get the level of a levelable upgrade
// getUpgradeLevelCost(upgradeName) 	Gets the cost to unlock the next level of a levelable upgrade

// Dividends
// issueDividends(rate) 	Issue dividends

// Shares
// issueNewShares(amount) 	Issue new shares
// sellShares(amount) 	Sell Shares. Transfer shares from the CEO to public traders to receive money in the player's wallet.
// buyBackShares(amount) 	Buyback Shares. Spend money from the player's wallet to transfer shares from public traders to the CEO.
