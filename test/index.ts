import { expect } from "chai";
import { ethers } from "hardhat";

describe("Comments", function () {
  it("Should add and fetch successfully", async function () {
    const Comments = await ethers.getContractFactory("Comments");
    const comments = await Comments.deploy();
    await comments.deployed();

    expect(await comments.getComments()).to.be.lengthOf(0);

    const tx1 = await comments.addComment("太郎", "Web3はいいぞ");
    await tx1.wait();

    const res1 = await comments.getComments();
    expect(res1).to.be.lengthOf(1);
    expect(res1[0].id).to.equal(0);
    expect(res1[0].message).to.equal("Web3はいいぞ");
    expect(res1[0].creator).to.equal("太郎");

    const tx2 = await comments.addComment("花子", "Web3は最高だ！");
    await tx2.wait();

    const res2 = await comments.getComments();
    expect(res2).to.be.lengthOf(2);
    expect(res2[1].id).to.equal(1);
    expect(res2[1].creator).to.equal("花子");
    expect(res2[1].message).to.equal("Web3は最高だ！");

    expect(res2[0].id).to.equal(0);
    expect(res2[0].message).to.equal("Web3はいいぞ");
    expect(res2[0].creator).to.equal("太郎");
  });
});
