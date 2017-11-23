const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

const MiningRepository = require('../../src/data/miningRepository');
const FeePaymentService = require('../../src/services/feePaymentService');

describe('FeePaymentService', function() {

    let miningRepositoryStub;

    beforeEach(function () {
        miningRepositoryStub = sinon.createStubInstance(MiningRepository);
    });

    describe('#readLastInsertedFeePayment()', function() {
        it('should return last inserted payment fee', async function() {
            
            miningRepositoryStub.readLastInsertedFeePayment = sinon.stub().returns(getSamplePaymentFee());
            const fps = new FeePaymentService(miningRepositoryStub, {}, {});

            const result = await fps.readLastInsertedFeePayment();

            assert.equal(21, result.block.number);
            assert.equal('0xdf456db6546dcdeda72d2ab42fb2d027d5bd123d684f3663bb9620992d20d4e9', result.block.hash);
        });

        it('should return false when there are no fees', async function() {
            
            miningRepositoryStub.readLastInsertedFeePayment = sinon.stub().returns([]);
            const fps = new FeePaymentService(miningRepositoryStub, {}, {});

            const result = await fps.readLastInsertedFeePayment();

            assert.equal(false, result);
        });
    });
});


function getSamplePaymentFee() {
    const block = { number: 21, hash: '0xdf456db6546dcdeda72d2ab42fb2d027d5bd123d684f3663bb9620992d20d4e9' };

    const feeInfo = {
        block: block,
        sender_tx: '0x2f7816b0bdd1cef3a18bb1ad56bc9fbdb5fcdad357b6cfe09e5a388b81d3aef8',
        to_address: '0x000000000000000000000000dabadabadabadabadabadabadabadabadaba0001',
        amount: 1789
    };

    return [feeInfo];
}