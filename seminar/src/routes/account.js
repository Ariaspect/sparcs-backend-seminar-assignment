const express = require('express');
const authMiddleware = require('../middleware/auth');
const AccountModel = require('../models/account');

const router = express.Router();

class BankDB {
    static _inst_;
    static getInst = () => {
        if ( !BankDB._inst_ ) BankDB._inst_ = new BankDB();
        return BankDB._inst_;
    }

    // #total = 10000;

    constructor() {
        const account = new AccountModel({ accountID: process.env.API_ID, balance: 10000 });
        const res = account.save();
        console.log("[Bank-DB] DB Init Completed");
    }

    getBalance = async ( accID ) => {
        try {
            const OAccountFilter = { accountID: accID };
            const res = await AccountModel.findOne(OAccountFilter);
            return { success: true, data: res };
        } catch(e) {
            console.log(`[Account-DB] Get Error: ${ e }`);
            return { success: false };
        }
    }

    transaction = async ( accID, amount ) => {
        try {
            const OAccountFilter = { accountID: accID };
            const res = await AccountModel.findOneAndUpdate(OAccountFilter, { "$inc": { "balance": amount } }, { returnDocument: "after" });
            console.log(res);
            return { success: true, data: res };
        } catch(e) {
            console.log(`[Account-DB] Transaction Error: ${ e }`);
            return { success: false };
        }
    }
}

const bankDBInst = BankDB.getInst();

router.post('/getInfo', authMiddleware, async (req, res) => {
    try {
        const accID = req.body.credential.id;
        const dbRes = await bankDBInst.getBalance( accID );
        console.log(dbRes)
        if (dbRes.success) return res.status(200).json(dbRes.data);
        else return res.status(500).json({ error: dbRes.data });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post('/transaction', authMiddleware, async (req, res) => {
    try {
        const accID = req.body.credential.id;
        const { amount } = req.body;
        console.log(amount);
        const dbRes = await bankDBInst.transaction( accID, parseInt(amount) );
        if (dbRes.success) res.status(200).json({ success: true, balance: dbRes.data.balance, msg: "Transaction success" });
        else res.status(500).json({ error: dbRes.data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

module.exports = router;