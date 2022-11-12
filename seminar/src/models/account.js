const mongoose = require('mongoose');

const OSchemaDefinition = {
    balance: {
        type: Number,
        default: 10000,
    },
    accountID: String
};

const schema = new mongoose.Schema(OSchemaDefinition);

const AccountModel = mongoose.model("account", schema);

module.exports = AccountModel;