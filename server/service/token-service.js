require('dotenv').config()
const jwt = require('jsonwebtoken');
const tokenModel = require('../models/tokenModel');


class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, {expiresIn: '15s'});
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {expiresIn: '30s'});
        return {
            accessToken,
            refreshToken
        }
    }
    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId})
        if(tokenData) {
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();
        }
        const token = await tokenModel.create({user: userId, refreshToken})
        return token;
    }
    async removeToken(refreshToken) {
        const tokendata = await tokenModel.deleteOne({refreshToken})
        return tokendata;
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.ACCESS_SECRET);
            console.log(userData);
            return userData;
        }catch(e) {
            return null;
        } 
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.REFRESH_SECRET);
            return userData;
        }catch(e) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken})
        return tokenData;
    }
}

module.exports = new TokenService()