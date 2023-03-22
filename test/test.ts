import { ethers } from "hardhat";
import { assert, expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";
import { GrandmaTokenPreSale__factory, GrandmaTokenPreSale, MockToken__factory, MockToken } from "../typechain-types";


describe("GrandmaTokenPreSale", function () {
    let accounts: SignerWithAddress[];
    let deployer: SignerWithAddress;
    let beneficier: SignerWithAddress;
    let provider: SignerWithAddress;
    let contributor1: SignerWithAddress;
    let contributor2: SignerWithAddress;

    let tokenFactory: MockToken__factory;
    let token: MockToken;
    let preSaleFactory: GrandmaTokenPreSale__factory;
    let preSale: GrandmaTokenPreSale;
    let openingTime: number;
    let closingTime: number;
    let lockTime: number;
    const rate = 100;
    const tokenSupply = BigNumber.from("10000000000000000000000000000"); // 10B tokens

    before(async function () {
        accounts = await ethers.getSigners();
        [deployer, beneficier, provider, contributor1, contributor2] = accounts;

        // Deploy the token
        tokenFactory = await ethers.getContractFactory("MockToken");
        token = await tokenFactory.deploy(tokenSupply);
        await token.deployed();

        // Move tokens to token provider
        await token.transfer(provider.address, tokenSupply);

        // Set the pre-sale times
        openingTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        closingTime = openingTime + 7200; // 2 hours after opening
        lockTime = closingTime + 15778800; // 6 months after closing

        // Deploy the pre-sale contract
        preSaleFactory = await ethers.getContractFactory("GrandmaTokenPreSale");
        preSale = (await preSaleFactory.deploy(
            rate,
            beneficier.address,
            token.address,
            provider.address,
            openingTime,
            closingTime
        )) as GrandmaTokenPreSale;

        // Add a few accounts to the pre-sale whitelist
        await preSale.addWhitelisted(contributor1.address);
        await preSale.addWhitelisted(contributor2.address);

        // Approve tokens to pre-sale contract
        await token.connect(provider).approve(preSale.address, tokenSupply);
    });

    it("should deploy the contract", async function () {
        assert.notEqual(preSale.address, null);
    });

    it("should reject contributions before pre-sale opens", async function () {
        const weiAmount = ethers.utils.parseEther("10");
        const response = preSale.connect(contributor1).buyTokens(contributor1.address, { value: weiAmount });
        await expect(response).to.be.revertedWith("TimedCrowdsale: not open");
    });

    it("should reject ot whitelisted contributors", async function () {
        const weiAmount = ethers.utils.parseEther("10");
        const response = preSale.connect(accounts[10]).buyTokens(accounts[10].address, { value: weiAmount });
        await expect(response).to.be.revertedWith("WhitelistCrowdsale: beneficiary doesn't have the Whitelisted role");
    });

    it("Open pre-sale by moving time", async function () {
        await time.increaseTo(openingTime);
    });

    
    it("should reject if minimum cap not reached", async function () {
        const weiAmount = ethers.utils.parseEther("1");
        const response = preSale.connect(contributor1).buyTokens(contributor1.address, { value: weiAmount });
        await expect(response).to.be.revertedWith("IndividuallyCappedCrowdsale: beneficiary's min cap not reached");
    });

    it("should reject if maximum cap reached", async function () { 
        const weiAmount = ethers.utils.parseEther("251");
        const response = preSale.connect(contributor1).buyTokens(contributor1.address, { value: weiAmount });
        await expect(response).to.be.revertedWith("IndividuallyCappedCrowdsale: beneficiary's cap exceeded");
    });

    it("should accept contributions", async function () { 
        const beneficierInitialBalance = await ethers.provider.getBalance(beneficier.address);

        // contributor1 buy 5ETH + 5ETH
        let weiAmount = ethers.utils.parseEther("5");
        await preSale.connect(contributor1).buyTokens(contributor1.address, { value: weiAmount });
        await preSale.connect(contributor1).buyTokens(contributor1.address, { value: weiAmount });
        
        const contributor1TokenBalance = await preSale.balanceOf(contributor1.address);
        expect(contributor1TokenBalance).to.deep.equal(ethers.BigNumber.from("1000000000000000000000"));

        // contributor2 buy 250ETH
        weiAmount = ethers.utils.parseEther("250");
        await preSale.connect(contributor2).buyTokens(contributor2.address, { value: weiAmount });
        
        const contributor2TokenBalance = await preSale.balanceOf(contributor2.address);
        expect(contributor2TokenBalance).to.deep.equal(ethers.BigNumber.from("25000000000000000000000"));

        // beneficiary wallet should have increase by 260ETH
        const beneficierBalance = await ethers.provider.getBalance(beneficier.address);
        expect(beneficierBalance).to.deep.equal(beneficierInitialBalance.add(ethers.utils.parseEther("260")));

        // token provider wallet should have decrease by 260000 tokens
        const providerTokenBalance = await token.balanceOf(provider.address)
        expect(providerTokenBalance).to.deep.equal(tokenSupply.sub(ethers.BigNumber.from("26000000000000000000000")));
    });


    it("should reject contributions after pre-sale closes", async function () {
        await time.increaseTo(closingTime);
        const weiAmount = ethers.utils.parseEther("10");
        const response = preSale.connect(contributor1).buyTokens(contributor1.address, { value: weiAmount });
        await expect(response).to.be.revertedWith("TimedCrowdsale: not open");
    });

    it("should reject token withdraw if lock time not reached", async function () { 
        const response = preSale.connect(contributor1).withdrawTokens(contributor1.address);
        await expect(response).to.be.revertedWith("GrandmaTokenPreSale: lock time period not reached");
    });

    it("should allow token withdraw when lock time not reached", async function () { 
        await time.increaseTo(lockTime);
        
        await preSale.connect(contributor1).withdrawTokens(contributor1.address);
        const contributor1TokenBalance = await token.balanceOf(contributor1.address);
        expect(contributor1TokenBalance).to.deep.equal(ethers.BigNumber.from("1000000000000000000000"));
        
        const contributor1TokenBalanceOnContract = await preSale.balanceOf(contributor1.address);
        expect(contributor1TokenBalanceOnContract).to.deep.equal(ethers.BigNumber.from("0"));
        
        await preSale.connect(contributor2).withdrawTokens(contributor2.address);
        const contributor2TokenBalance = await token.balanceOf(contributor2.address);
        expect(contributor2TokenBalance).to.deep.equal(ethers.BigNumber.from("25000000000000000000000"));

        const contributor2TokenBalanceOnContract = await preSale.balanceOf(contributor1.address);
        expect(contributor2TokenBalanceOnContract).to.deep.equal(ethers.BigNumber.from("0"));
    });


    it("should not be able to withdraw empty balance", async function () {
        let response = preSale.connect(contributor1).withdrawTokens(contributor1.address);
        await expect(response).to.be.revertedWith("PostDeliveryCrowdsale: beneficiary is not due any tokens");
        
        response = preSale.connect(contributor2).withdrawTokens(contributor2.address);
        await expect(response).to.be.revertedWith("PostDeliveryCrowdsale: beneficiary is not due any tokens");
    });
});