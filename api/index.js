const express = require("express");
const app = express();
const https = require("https");

const BUCKET_PATH = "https://oqg-dev.nyc3.cdn.digitaloceanspaces.com/uploads/pdf/"

app.set("port",(process.env.PORT || 8081));

app.get('/api/pdf/:pdfFileName',(req,res)=>{

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

app.listen(app.get("port"),()=>{console.log(`Server booted on ${app.get("port")}`)})

module.exports = app;