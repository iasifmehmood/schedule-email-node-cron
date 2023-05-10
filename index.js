const express = require('express');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
});

app.post('/send', (req, res) => {
  const { email, minute, hour, date, month, day } = req.body;
  const valid = cron.validate(`${minute} ${hour} ${date} ${month} ${day} `);
  if (!valid) {
    res.status(400).json({
      status: 'string is not valid cron',
    });
  }
  console.log('entered api');
  cron.schedule(
    `${minute} ${hour} ${date} ${month} ${day} `,
    async () => {
      // '* * * * *'
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      console.log('running email');
      try {
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Fred Foo 👻" <foo@example.com>', // sender address
          to: `${email}`, // list of receivers
          subject: 'Hello ✔', // Subject line
          text: 'Hello world?', // plain text body
          html: '<b>Hello world?</b>', // html body
        });

        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      } catch (error) {
        console.log(error);
        res.status(400).json({
          error: error,
        });
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Karachi',
    }
  );
});

const PORT = 8000;
app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log(`listening to port ${PORT}`);
});
