import dotenv from 'dotenv';
import got from 'got';
dotenv.config();



function callSendAPI(senderPsid, response) {

    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    let requestBody = {
        'recipient': {
            'id': senderPsid
        }, 
        'message': response
    };

    const options = {
        searchParams: { 'access_token': PAGE_ACCESS_TOKEN },
        json: requestBody,
        responseType: 'json'
    };

    (async () => {
        try {
            const response = await got.post('https://graph.facebook.com/v20.0/me/messages', options);
            console.log('Message sent!', response.body);
        }
        catch(err) {
            console.error('Unable to send message:', err.response ? err.response.body : err.message);
        }
    })();
    
}

callSendAPI(7891523274264985, {'text': "hello world"});