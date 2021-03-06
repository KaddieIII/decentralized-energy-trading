/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const Utility = artifacts.require("Utility");
const {
  BN,
  constants,
  expectEvent,
  shouldFail,
  time
} = require("openzeppelin-test-helpers");
const expect = require("chai").use(require("chai-bn")(BN)).expect;

contract("Utility", ([owner, hh1, hh2, hh3, hh4, hh5, hh6, hh7]) => {
  beforeEach(async () => {
    this.instance = await Utility.new({
      from: owner
    });
  });

  describe("Households", () => {
    context("with a new household", async () => {
      beforeEach(async () => {
        ({ logs: this.logs } = await this.instance.addHousehold(hh1, {
          from: owner
        }));
      });

      it("should store addresses in householdList", async () => {
        expect((await this.instance.householdList(0)) === hh1);

        await this.instance.addHousehold(hh2, {
          from: owner
        });
        expect((await this.instance.householdList(1)) === hh2);
      });
    });
  });

  describe("Settlement", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1, {
        from: owner
      });
      await this.instance.addHousehold(hh2, {
        from: owner
      });
      await this.instance.addHousehold(hh3, {
        from: owner
      });
      await this.instance.addHousehold(hh4, {
        from: owner
      });
      await this.instance.addHousehold(hh5, {
        from: owner
      });
      await this.instance.addHousehold(hh6, {
        from: owner
      });
      await this.instance.addHousehold(hh7, {
        from: owner
      });
    });

    context("totalRenewableEnergy = 0", async () => {
      it("availableRenewableEnergy = 200, neededRenewableEnergy = -200; households do not need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 100, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("0");
      });

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -200; households need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 40, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("40");

        await this.instance.updateRenewableEnergy(hh2, 160, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 160, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("40");

        await this.instance.updateRenewableEnergy(hh4, 0, 40, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("0");
      });
    });

    context("totalRenewableEnergy > 0", async () => {
      it("availableRenewableEnergy = 400, neededRenewableEnergy = -200; households need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 200, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh2, 200, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("400");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("100");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("100");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("0");
      });

      it("availableRenewableEnergy = 300, neededRenewableEnergy = -200; households need to split energy; rounded values therefore FIFS", async () => {
        await this.instance.updateRenewableEnergy(hh1, 200, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("68");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("34");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-2");
      });
    });

    context("totalRenewableEnergy < 0", async () => {
      it("availableRenewableEnergy = 200, neededRenewableEnergy = -400; households need to split energy", async () => {
        await this.instance.updateRenewableEnergy(hh1, 100, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 200, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.updateRenewableEnergy(hh4, 0, 200, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-200");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("-100");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-100");
      });

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -400; with 7 households", async () => {
        await this.instance.updateRenewableEnergy(hh1, 50, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("50");

        await this.instance.updateRenewableEnergy(hh2, 70, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("120");

        await this.instance.updateRenewableEnergy(hh3, 40, 0, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("160");

        await this.instance.updateRenewableEnergy(hh4, 40, 0, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh5, 0, 200, {
          from: hh5
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.updateRenewableEnergy(hh6, 0, 100, {
          from: hh6
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-100");

        await this.instance.updateRenewableEnergy(hh7, 0, 25, {
          from: hh7
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-125");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("4");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh5)
        ).to.be.bignumber.equal("-78");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh6)
        ).to.be.bignumber.equal("-40");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh7)
        ).to.be.bignumber.equal("-11");
      });

      it("availableRenewableEnergy = 200, neededRenewableEnergy = -300; households need to split energy, round values therefore FIFS", async () => {
        await this.instance.updateRenewableEnergy(hh1, 100, 0, {
          from: hh1
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("100");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.updateRenewableEnergy(hh3, 0, 200, {
          from: hh3
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("0");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        });
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("-100");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("2");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("-68");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-34");
      });
    });
  });

  describe("Consecutive settlements", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1, {
        from: owner
      });
      await this.instance.addHousehold(hh2, {
        from: owner
      });
      await this.instance.addHousehold(hh3, {
        from: owner
      });
      await this.instance.addHousehold(hh4, {
        from: owner
      });

      await this.instance.updateRenewableEnergy(hh1, 200, 0, {
        from: hh1
      });
      // 68
      await this.instance.updateRenewableEnergy(hh2, 100, 0, {
        from: hh2
      });
      // 34
      await this.instance.updateRenewableEnergy(hh3, 0, 100, {
        from: hh3
      });
      // 0
      await this.instance.updateRenewableEnergy(hh4, 0, 100, {
        from: hh4
      });
      // -2

      await this.instance.settle();
    });

    context("totalRenewableEnergy > 0", async () => {
      it("availableRenewableEnergy = 402, neededRenewableEnergy = -202; households need to split energy; rounded values therefore FIFS", async () => {
        await this.instance.updateRenewableEnergy(hh1, 200, 0, {
          from: hh1
        }); // 268
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh2, 100, 0, {
          from: hh2
        }); // 134
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("400");

        await this.instance.updateRenewableEnergy(hh3, 0, 100, {
          from: hh3
        }); // -100
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("300");

        await this.instance.updateRenewableEnergy(hh4, 0, 100, {
          from: hh4
        }); // -102
        expect(
          await this.instance.totalRenewableEnergy()
        ).to.be.bignumber.equal("200");

        await this.instance.settle();

        expect(
          await this.instance.balanceOfRenewableEnergy(hh1)
        ).to.be.bignumber.equal("135");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh2)
        ).to.be.bignumber.equal("68");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh3)
        ).to.be.bignumber.equal("0");
        expect(
          await this.instance.balanceOfRenewableEnergy(hh4)
        ).to.be.bignumber.equal("-3");
      });
    });
  });

  describe("Transfers", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1, {
        from: owner
      });
      await this.instance.addHousehold(hh2, {
        from: owner
      });
      await this.instance.addHousehold(hh3, {
        from: owner
      });
      await this.instance.addHousehold(hh4, {
        from: owner
      });

      await this.instance.updateRenewableEnergy(hh1, 200, 0, {
        from: hh1
      });
      await this.instance.updateRenewableEnergy(hh2, 100, 0, {
        from: hh2
      });
      await this.instance.updateRenewableEnergy(hh3, 0, 100, {
        from: hh3
      });
      await this.instance.updateRenewableEnergy(hh4, 0, 100, {
        from: hh4
      });
    });

    it("check transfers in transfers mapping", async () => {
      await this.instance.settle();
      const settleBlockNumber = await time.latestBlock();
      const transfersArrayLength = await this.instance
        .transfersLength(settleBlockNumber)
        .then(result => result.toNumber());

      const transfers = [];
      for (let i = 0; i < transfersArrayLength; i++) {
        transfers.push(await this.instance.transfers(settleBlockNumber, i));
      }

      expect(transfers[0].active).to.be.true; // active
      expect(transfers[0].from === hh1); // from
      expect(transfers[0].to === hh3); // to
      expect(transfers[0].renewableEnergyTransferred).to.be.bignumber.equal("100"); // renewableEnergyTransferred
      expect(transfers[0].nonRenewableEnergyTransferred).to.be.undefined; // nonRenewableEnergyTransferred

      expect(transfers[1].active).to.be.true; // active
      expect(transfers[1].from === hh1); // from
      expect(transfers[1].to === hh4); // to
      expect(transfers[1].renewableEnergyTransferred).to.be.bignumber.equal("32"); // renewableEnergyTransferred
      expect(transfers[1].nonRenewableEnergyTransferred).to.be.undefined; // nonRenewableEnergyTransferred

      expect(transfers[2].active).to.be.true; // active
      expect(transfers[2].from === hh2); // from
      expect(transfers[2].to === hh4); // to
      expect(transfers[2].renewableEnergyTransferred).to.be.bignumber.equal("66"); // renewableEnergyTransferred
      expect(transfers[2].nonRenewableEnergyTransferred).to.be.undefined; // nonRenewableEnergyTransferred
    });
  });

  describe("Official Utility", () => {
    beforeEach(async () => {
      await this.instance.addHousehold(hh1, {
        from: owner
      });
      await this.instance.addHousehold(hh2, {
        from: owner
      });
      await this.instance.addHousehold(hh3, {
        from: owner
      });
      await this.instance.addHousehold(hh4, {
        from: owner
      });

      // totalRenewableEnergy < 0
      // availableRenewableEnergy = 200, neededRenewableEnergy = -400
      await this.instance.updateRenewableEnergy(hh1, 100, 0, {
        from: hh1
      });
      await this.instance.updateRenewableEnergy(hh2, 100, 0, {
        from: hh2
      });
      await this.instance.updateRenewableEnergy(hh3, 0, 200, {
        from: hh3
      });
      await this.instance.updateRenewableEnergy(hh4, 0, 200, {
        from: hh4
      });

      ({ logs: this.logs } = await this.instance.settle()); // 0 0 -100 -100
    });

    context("request non-renewable energy", async () => {
      it("emit events RequestNonRenewableEnergy", async () => {
        expectEvent.inLogs(this.logs, "RequestNonRenewableEnergy", {
          household: hh3,
          energy: new BN(100)
        });

        expectEvent.inLogs(this.logs, "RequestNonRenewableEnergy", {
          household: hh4,
          energy: new BN(100)
        });
      });
    });

    context("compensate energy", async () => {
      beforeEach(async () => {
        await this.instance.addHousehold(hh5, {
          from: owner
        });

        await this.instance.updateNonRenewableEnergy(hh3, 100, 0, {
          from: hh3
        });
        await this.instance.updateNonRenewableEnergy(hh4, 80, 0, {
          from: hh4
        });
        await this.instance.updateRenewableEnergy(hh5, 100, 0, {
          from: hh5
        });
        await this.instance.updateNonRenewableEnergy(hh5, 0, 80, {
          from: hh5
        });
      });

      it("emit event EnergyCompensated", async () => {
        ({ logs: this.logs } = await this.instance.compensateEnergy(hh3));
        expectEvent.inLogs(this.logs, "EnergyCompensated", {
          household: hh3,
          energy: new BN(100),
          isRenewable: true
        });

        ({ logs: this.logs } = await this.instance.compensateEnergy(hh4));
        expectEvent.inLogs(this.logs, "EnergyCompensated", {
          household: hh4,
          energy: new BN(80),
          isRenewable: true
        });

        ({ logs: this.logs } = await this.instance.compensateEnergy(hh5));
        expectEvent.inLogs(this.logs, "EnergyCompensated", {
          household: hh5,
          energy: new BN(80),
          isRenewable: false
        });
      });

      it("fully compensate negative renewable energy with non-renewable energy", async () => {
        await this.instance.compensateEnergy(hh3);

        const hh3Data = await this.instance.getHousehold(hh3, {
          from: hh3
        });

        expect(hh3Data[0]).to.be.true; // initialized
        expect(hh3Data[1]).to.be.bignumber.that.is.zero; // renewableEnergy
        expect(hh3Data[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
        expect(hh3Data[3]).to.be.bignumber.that.is.zero; // producedRenewableEnergy
        expect(hh3Data[4]).to.be.bignumber.equal("200"); // consumedRenewableEnergy
        expect(hh3Data[5]).to.be.bignumber.equal("100"); // producedNonRenewableEnergy
        expect(hh3Data[6]).to.be.bignumber.that.is.zero; // consumedNonRenewableEnergy
      });

      it("partly compensate negative renewable energy with non-renewable energy", async () => {
        await this.instance.compensateEnergy(hh4);

        const hh4Data = await this.instance.getHousehold(hh4, {
          from: hh4
        });

        expect(hh4Data[0]).to.be.true; // initialized
        expect(hh4Data[1]).to.be.bignumber.equal("-20"); // renewableEnergy
        expect(hh4Data[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
        expect(hh4Data[3]).to.be.bignumber.that.is.zero; // producedRenewableEnergy
        expect(hh4Data[4]).to.be.bignumber.equal("200"); // consumedRenewableEnergy
        expect(hh4Data[5]).to.be.bignumber.equal("80"); // producedNonRenewableEnergy
        expect(hh4Data[6]).to.be.bignumber.that.is.zero; // consumedNonRenewableEnergy
      });

      it("not over compensate negative non-renewable energy with renewable energy", async () => {
        await this.instance.compensateEnergy(hh5);

        const hh5Data = await this.instance.getHousehold(hh5, {
          from: hh5
        });

        expect(hh5Data[0]).to.be.true; // initialized
        expect(hh5Data[1]).to.be.bignumber.equal("20"); // renewableEnergy
        expect(hh5Data[2]).to.be.bignumber.that.is.zero; // nonRenewableEnergy
        expect(hh5Data[3]).to.be.bignumber.equal("100"); // producedRenewableEnergy
        expect(hh5Data[4]).to.be.bignumber.that.is.zero; // consumedRenewableEnergy
        expect(hh5Data[5]).to.be.bignumber.that.is.zero; // producedNonRenewableEnergy
        expect(hh5Data[6]).to.be.bignumber.equal("80"); // consumedNonRenewableEnergy
      });
    });
  });
});
