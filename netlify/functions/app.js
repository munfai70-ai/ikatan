const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // index.html is copied here by build command
    const htmlPath = path.join(__dirname, 'index.html');

    if (!fs.existsSync(htmlPath)) {
      return {
        statusCode: 500,
        body: 'index.html not found at: ' + htmlPath + '\nFiles here: ' + fs.readdirSync(__dirname).join(', ')
      };
    }

    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html.split('__SUPABASE_URL__').join(process.env.SUPABASE_URL || '');
    html = html.split('__SUPABASE_KEY__').join(process.env.SUPABASE_KEY || '');
    html = html.split('__APP_PASSWORD__').join(process.env.APP_PASSWORD || '');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
      body: html,
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};