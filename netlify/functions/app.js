const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Netlify bundles functions - try these paths in order
    const attempts = [
      path.join(__dirname, 'index.html'),           // bundled alongside function
      '/var/task/index.html',                        // Netlify Lambda root
      '/var/task/netlify/functions/index.html',      // inside functions folder
    ];

    // Debug: show dirname and list files
    let debugInfo = '__dirname: ' + __dirname + '\n';
    try { debugInfo += '/var/task files: ' + fs.readdirSync('/var/task').join(', ') + '\n'; } catch(e) {}
    try { debugInfo += '__dirname files: ' + fs.readdirSync(__dirname).join(', ') + '\n'; } catch(e) {}

    let html = null;
    for (const p of attempts) {
      if (fs.existsSync(p)) {
        html = fs.readFileSync(p, 'utf8');
        debugInfo += 'Found at: ' + p;
        break;
      }
    }

    if (!html) {
      return { statusCode: 500, body: 'index.html not found.\n' + debugInfo };
    }

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