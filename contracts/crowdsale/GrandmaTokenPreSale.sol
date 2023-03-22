pragma solidity ^0.5.17;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/WhitelistCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "./IndividuallyCappedCrowdsale.sol";

/**
 * @title GrandmaTokenPreSale
 * @dev GrandmaTokenPreSale smart contract, which is a pre-sale contract for GrandmaToken and implements several crowdsale-related features.
 */
contract GrandmaTokenPreSale is 
    Crowdsale,
    IndividuallyCappedCrowdsale,
    TimedCrowdsale,
    WhitelistCrowdsale,
    PostDeliveryCrowdsale,
    AllowanceCrowdsale
{

    // Minimum and maximum contribution amounts for individual contributors.
    uint256 constant private MIN_INDIV_CAP = 5000000000000000000; // 5 ETH minimun contribution
    uint256 constant private MAX_INDIV_CAP = 250000000000000000000; // 250 ETH maximum contribution
    
    // 6 month lock period
    uint256 constant private LOCK_PERIOD = 15778800; 
    
    // Lock time after which the tokens can be withdrawn.
    uint256 public _lockTime;

    constructor(
        uint256 rate,
        address payable benficierWallet,
        IERC20 token,
        address tokenSourceWallet,
        uint256 openingTime,
        uint256 closingTime
    )
        Crowdsale(rate, benficierWallet, token)
        AllowanceCrowdsale(tokenSourceWallet)
        TimedCrowdsale(openingTime, closingTime)
        IndividuallyCappedCrowdsale(MIN_INDIV_CAP, MAX_INDIV_CAP)
        WhitelistCrowdsale()
        PostDeliveryCrowdsale()
        public
    {
        // Set the lock time as the closing time plus the lock period.
        _lockTime = closingTime + LOCK_PERIOD;
    }

    /**
     * @dev Function to withdraw tokens after the lock period has elapsed.
     * @param beneficiary Token purchaser
     */
    function withdrawTokens(address beneficiary) public {
        require(block.timestamp >= _lockTime, "GrandmaTokenPreSale: lock time period not reached");
        super.withdrawTokens(beneficiary);
    }
}