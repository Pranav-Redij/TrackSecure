const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        rollNoOrPlate : {
            type: String,
            unique : true,
            required: true
        },
        password:{
            type: String,
            required : true,
            unique : true
        },
        role: {
            type : String,
            enum : ['driver','user','admin','security'],
            required : true
        }
    }
);

//pre function to hash the password before saving it to the database
userSchema.pre('save', async function(next) {
    const user = this; // 'this' refers to the document being saved
    //hash the password only if it is modified or new
    if (!user.isModified('password'))return next();

    try{
        //hash password generation 
        const bcrypt = require('bcrypt')
        const salt = await bcrypt.genSalt(10); // generate a salt with 10 rounds
        //normal any salt randomly can also be used
        //hash the password with the salt
        const hashedPassword = await bcrypt.hash(user.password, salt); 

        user.password = hashedPassword; // set the hashed password
        next();
    }
    catch(error){
        return next(error);
    }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
    try{
        const isMatch = await require('bcrypt').compare(candidatePassword, this.password);
        return isMatch; // returns true if the password matches, false otherwise 
    }catch(error){
        throw new Error('Error comparing password');
    }
}

// Static method to update password and hash it
userSchema.statics.updatePasswordById = async function(userId, newPassword) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    user.password = newPassword;
    await user.save(); // This triggers the pre-save hook for hashing
    return user;
};



const userObj = mongoose.model('user',userSchema);
//.   it give the obj of mongodb, by telling mongodb to create model/colletion named user (always convert to small letters) and which follows userSchema
module.exports = userObj;