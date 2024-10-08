'use strict';

import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import got from 'got';

dotenv.config();
const app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

app.post('/webhook', (req, res) => {
    let body = req.body;

    // Checks if this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhookEvent = entry.messaging[0];
            console.log(webhookEvent);

            // Get the sender PSID
            let senderPsid = webhookEvent.sender.id;
            console.log('Sender PSID: ' + senderPsid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);
            } else if (webhookEvent.postback) {
                handlePostback(senderPsid, webhookEvent.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {

        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});

function handleMessage(senderPsid, receivedMessage) {
    let response;

    // Checks if the message contains text
    if (receivedMessage.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of your request to the Send API
        response = {
            'text': `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`
        };
    } else if (receivedMessage.attachments) {

        // Get the URL of the message attachment
        let attachmentUrl = receivedMessage.attachments[0].payload.url;
        response = {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'generic',
                    'elements': [{
                        'title': 'Is this the right picture?',
                        'subtitle': 'Tap a button to answer.',
                        'image_url': attachmentUrl,
                        'buttons': [
                            {
                                'type': 'postback',
                                'title': 'Yes!',
                                'payload': 'yes',
                            },
                            {
                                'type': 'postback',
                                'title': 'No!',
                                'payload': 'no',
                            }
                        ],
                    }]
                }
            }
        };
    }

    // Send the response message
    callSendAPI(senderPsid, response);
}

// Handles messaging_postbacks events
function handlePostback(senderPsid, receivedPostback) {
    let response;

    // Get the payload for the postback
    let payload = receivedPostback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { 'text': 'Thanks!' };
    } else if (payload === 'no') {
        response = { 'text': 'Oops, try sending another image.' };
    }
    // Send the message to acknowledge the postback
    callSendAPI(senderPsid, response);
}

// Sends response messages via the Send API
function callSendAPI(senderPsid, response) {

    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    let requestBody = {
        'recipient': {
            'id': senderPsid
        },
        'message': response,
        "messaging_type": "RESPONSE"
    };

    const options = {
        searchParams: { 'access_token': 'EAAMQkacNCMEBO284ZByHZCx9rIVBF4CMoPSr88eAhSLrUJsuiOBVp7eGZBg3uZBGVaU0pWlL3PXEiohe8cNCOZCmQt7CqtWxHH3wnWiuIgb53LqSRZAhKudJvZA7d3br27FoWrcUPdnZC5ZArKfcLhMlZC4938aRB3cskUKrKFNazcQBI0wMwCZACaXNIIBVG5Sx1rzbCJ0INvwQfYDrWllAZB4N12DJ' },
        json: requestBody,
        responseType: 'json'
    };

    (async () => {
        try {
            const response = await got.post('https://graph.facebook.com/v20.0/me/messages', options);
            console.log('Message sent!', response.body);
        }
        catch (err) {
            console.error('Unable to send message:', err.response ? err.response.body : err.message);
        }
    })();

}

function alarm() {
    let now = new Date();
    let selectedDate = new Date("2024-09-01T08:55:20")
    let timeUntilAlarm = selectedDate - now;

    let interVal = setTimeout(() => {
        callSendAPI(7891523274264985, { 'text': 'anh nam ben trai cua cuoc doi' });
    }, timeUntilAlarm);
}

alarm()

var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});

