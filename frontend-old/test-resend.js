const data = JSON.stringify({
  from: 'onboarding@resend.dev',
  to: 'lucifer7572@gmail.com',
  subject: 'Test Email',
  html: '<strong>Hello World</strong>'
});

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer re_18Ea7q4W_9y9iPvxSNdr7AC56AKGUDWe9',
    'Content-Type': 'application/json'
  },
  body: data
}).then(res => res.json()).then(console.log).catch(console.error);
