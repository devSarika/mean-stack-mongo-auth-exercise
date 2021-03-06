const mongoose = require('mongoose')
var bcrypt      = require('bcrypt-nodejs');

const DEFAULT_USER_PROFILE_PICTURE = '/img/default_user_pic.jpg';
const SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema({
    email_address : {type: String, required: true, unique: true},
    password :String,
    full_name: String,
    profile_pic: {type: String, default: DEFAULT_USER_PROFILE_PICTURE}
})

/**
 * Before saving a user , Make sure:
 * 1. User's picture is assigned, if not, assign it to default one.
 * 2. Hash user's password
 */
userSchema.pre('save', function(next) {
    var user = this;

    // ensure user picture is set
    if(!user.picture){
        user.picture = DEFAULT_USER_PROFILE_PICTURE;
    }

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

/**
 * Create an Instance method to validate user's password
 * This method will be used to compare the given password with the passwoed stored in the database
 * 
 */
userSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

module.exports = mongoose.model('user', userSchema);