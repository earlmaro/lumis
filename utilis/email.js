const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');



module.exports = class Email {
    constructor(user, url){
        this.to = user.email
        this.firstName = user.first_name
        this.url = user.url
        this.from = process.env.EMAIL_FROM
    }
    newTransport(){
        if(process.env.NODE_ENV === 'PRODUCTION'){
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
        
    }

   async send(template, subject){


        const mailOptions = {
            from:this.from,
            to: this.to,
            subject ,
            text: `${template}`
        };
        this.newTransport();
await this.newTransport().sendMail(mailOptions)

    }

    async sendWelcome(){
        let message = `hdhdhdhdhdhdhdh ${this.url}`
        await this.send(message, 'welcome to eazzy financials')
    }
    async sendPasswordReset(){
    // const message = `Forgot your password? Submit a PATCH request with your new password and password confirmation to: ${reserURL},\n if you didnt forget your password then ignore this mail!`;

        await this.send(template, 'Your password reset token valid for 10 minutes')
    }
    
}




