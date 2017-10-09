import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

var nodemailer = require('nodemailer');

class Server {
    constructor() {
        this.app = express();
    }

    configureApp() {
        this.app.set('port', (process.env.PORT || 3000));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    configureCORS() {
        // Additional middleware which will set headers that we need on each request.
        this.app.use((req, res, next) => {
            // Set permissive CORS header - this allows this server to be used only as
            // an API server in conjunction with something like webpack-dev-server.
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

            // Disable caching so we'll always get the latest userDetails.
            res.setHeader('Cache-Control', 'no-cache');
            next();
        });
    }

    configureRoutes() {
        this.app.post('/send', (req, res) => {
            const output = `
               <p>New contact request</p>
               <h3>Contact details</h3>
               <ul>
                   <li>FullName: ${req.body.fullName}</li>
                   <li>EmailId: ${req.body.emailId}</li>
                   <li>Subject: ${req.body.subject}</li>
               </ul>
               <h3>Message</h3>
               <p>Message: ${req.body.message}</p>
           `;
            const email = req.body.emailId;
            const subject = req.body.subject;

            //create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'test.arung@gmail.com',
                    pass: 'passwordtest'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            //setup email data
            let mailOptions = {
                from: 'test.arung@gmail.com',
                to: email,
                subject: subject,
                text: 'Hello to all',
                html: output
            };

            //send mail
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                res.json({ msg: 'Email has been sent!' });
                //res.render({ msg: 'Email has been sent' });
            });
        })
    }

    listen(port) {
        this.app.listen(port, () => {
            console.log(`Server started: http://localhost:${port}/`);
        });
    }

    run() {
        this.configureApp();
        this.configureCORS()
        this.configureRoutes();
        this.listen(this.app.get('port'));
    }
}

export default Server;