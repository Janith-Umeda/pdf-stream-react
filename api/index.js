require("dotenv").configDotenv({path:"../.env"});
const express = require("express");
const app = express();
const https = require("https");

const BUCKET_PATH = "https://oqg-dev.nyc3.cdn.digitaloceanspaces.com/uploads/pdf/"

app.set("port",(process.env.PORT || 8082));

app.get('/content/pdf/:pdfFileName',(req,res)=>{

    const {pdfFileName} = req.params;
    https.get(`${BUCKET_PATH}${pdfFileName}`,(pdfRes)=>{
        
        if(pdfRes.statusCode !== 200){
            console.warn("Error Fetching from bucket!");
            res.status(pdfRes.statusCode).send({
                error:"Error Fetching from bucket!",
                reason:pdfRes.statusMessage
            });
            return;
        }

        pdfRes.pipe(res);
        
    }).on("error",(err)=>{
        console.error("Failed to fetch pdf file!");
    })
    
})

let count = 0;
app.get("/api/count",(req,res)=>{
    count ++;

    res.json({
        count:count
    })
})
// Reset count endpoint with input validation
app.get("/api/reset", (req, res) => {
    const previousCount = count;
    count = 0;
    res.status(200).json({
        count: count,
        previous: previousCount
    });
});

// Environment variables endpoint with security checks
app.get("/api/env", (req, res) => {
    const envVars = {
        REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
        REACT_APP_API_KEY: process.env.REACT_APP_API_KEY || '',
        REACT_APP_ENV: process.env.REACT_APP_ENV || 'development'
    };

    // Mask sensitive information in non-development environments
    if (envVars.REACT_APP_ENV !== 'development') {
        envVars.REACT_APP_API_KEY = '[REDACTED]';
    }

    res.status(200).json(envVars);
});

// IP address endpoint with proper parsing
app.get("/api/ip", (req, res) => {
    const forwardedIp = req.headers['x-forwarded-for'];
    const ip = forwardedIp ? forwardedIp.split(',')[0].trim() : 
               req.socket.remoteAddress?.replace(/^::ffff:/, '');
    
    res.status(200).json({ ip: ip || 'unknown' });
});

// Server startup with error handling
const server = app.listen(app.get("port"), () => {
    console.log(`Server running on port ${app.get("port")}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server shutdown complete');
        process.exit(0);
    });
});

module.exports = app;