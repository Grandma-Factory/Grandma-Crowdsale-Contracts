pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/access/roles/CapperRole.sol";

/**
 * @title IndividuallyCappedCrowdsale
 * @dev Crowdsale with per-beneficiary caps.
 */
contract IndividuallyCappedCrowdsale is Crowdsale, CapperRole {
    using SafeMath for uint256;

    uint256 private _min_cap; // mininum contribution
    uint256 private _max_cap; // maximum contribution
    mapping(address => uint256) private _contributions;

    /**
     * @dev Constructor.
     */
    constructor (uint256 min_cap, uint256 max_cap) public {
        _min_cap = min_cap;
        _max_cap = max_cap;
    }

    /**
     * @dev Returns the min cap by address.
     * @return Min contribution by address.
     */
    function getMinCap() public view returns (uint256) {
        return _min_cap;
    }

    /**
     * @dev Returns the max cap by address.
     * @return Max contribution by address.
     */
    function getMaxCap() public view returns (uint256) {
        return _max_cap;
    }

    /**
     * @dev Returns the amount contributed so far by a specific beneficiary.
     * @param beneficiary Address of contributor
     * @return Beneficiary contribution so far
     */
    function getContribution(address beneficiary) public view returns (uint256) {
        return _contributions[beneficiary];
    }

    /**
     * @dev Extend parent behavior requiring purchase to respect the beneficiary's funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);    
        // solhint-disable-next-line max-line-length
        require(_contributions[beneficiary].add(weiAmount) >= _min_cap, "IndividuallyCappedCrowdsale: beneficiary's min cap not reached");
        // solhint-disable-next-line max-line-length
        require(_contributions[beneficiary].add(weiAmount) <= _max_cap, "IndividuallyCappedCrowdsale: beneficiary's cap exceeded");
    }

    /**
     * @dev Extend parent behavior to update beneficiary contributions.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        super._updatePurchasingState(beneficiary, weiAmount);
        _contributions[beneficiary] = _contributions[beneficiary].add(weiAmount);
    }
}
