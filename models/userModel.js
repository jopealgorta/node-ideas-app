const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Un usuario debe tener nombre']
        },
        email: {
            type: String,
            required: [true, 'Por favor introduzca su email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'El email provisto no es valido']
        },
        photo: {
            type: String,
            default: 'default.jpg'
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        likedIdeas: [
            {
                ref: 'Idea',
                type: mongoose.Types.ObjectId
            }
        ],
        chats: [
            {
                ref: 'Idea',
                type: mongoose.Types.ObjectId
            }
        ],
        password: {
            type: String,
            required: [true, 'Por favor ingrese su contraseña.'],
            minlength: 8,
            select: false
        },
        confirmPassword: {
            type: String,
            required: [true, 'Confirme su contraseña, por favor.'],
            validate: {
                // This only works on Save or Create
                validator: function(el) {
                    return el === this.password;
                },
                message: 'Las contraseñas no coinciden.'
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return changedTimestamp > JWTTimestamp;
    }
    return false;
};

userSchema.methods.correctPassword = async function(password, realPassword) {
    return await bcrypt.compare(password, realPassword);
};

module.exports = mongoose.model('User', userSchema);
