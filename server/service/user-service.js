const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const MailService = require('../service/mail-service');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-errors');
  
class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if(candidate) {
            throw ApiError.BadRequest(`Пользователь с почтой ${email} уже существует`)
        }
        const hashedPass = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf - example result
       
        const user = await UserModel.create({email, password: hashedPass, activationLink})
        await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        
        const user_dto = new UserDto(user) // id, email, isActivated
        const tokens = tokenService.generateTokens({...user_dto});
        await tokenService.saveToken(user_dto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: user_dto
        }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink});
        if(!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if(!user) {
            throw ApiError.BadRequest('Пользователь с таким мылом не был найден');

        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if(!isPassEquals) {
            throw ApiError.BadRequest('Неправильный пароль')
        }
        const user_dto = new UserDto(user);
        const tokens = tokenService.generateTokens({...user_dto})
    
        await tokenService.saveToken(user_dto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: user_dto
        }
    }
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
    
        return token;
    }
    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = await tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDB) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const user_dto = new UserDto(user);
        const tokens = tokenService.generateTokens({...user_dto})
    
        await tokenService.saveToken(user_dto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: user_dto
        }
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }
}

module.exports = new UserService()