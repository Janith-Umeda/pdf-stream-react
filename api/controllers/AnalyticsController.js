const { SendMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");
const AnalyticsService = require("../services/AnalyticsService");

class AnalyticsController {

    sqsClient;
    static sqsClientConnection;
    #region =  process.env.AWS_DEFAULT_REGION;
    #accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    #secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    #queueUrl = process.env.SQS_QUEUE_URL;

    /**
     * 
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     */
    index(req, res) {

        const ip = this.#getIpAddress(req);
        
        console.log({
            region:  process.env.AWS_DEFAULT_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            queueUrl: process.env.SQS_QUEUE_URL,
        });

        try{
            this.sqsClient = this.initConnection();

            const jobPayload = AnalyticsService.createJobPayload('StoreStatisticsJob',{
                ...req.body,
                ip:ip
            });
            
            this.sendMessage(jobPayload)
            .then(()=>{
                return res.status(200).json({});
            })
            .catch((e)=>{
                console.error('Payload Failed to send!.','qrId',req.body.qr_code_id,'ip',ip,'reason',e);
                return res.status(500)
                .setHeader('X-Error','Failed to send message to SQS')
                .json({
                    reason:'Payload Failed to send!',
                    qId:req.body.qr_code_id,
                    ip,
                });
            })

        }catch(e){
            console.error('Connection Failed!.','qrId',req.body.qr_code_id,'ip',ip,'reason',e);
            return res.status(500)
                .setHeader('X-Error','Internal Server Error')
                .json({
                    reason:'Internal Server Error',
                    qId:req.body.qr_code_id,
                    ip,
                })
        }
    }

    initConnection() {

        if(AnalyticsController.sqsClientConnection){
            return AnalyticsController.sqsClientConnection;
        }

        AnalyticsController.sqsClientConnection = new SQSClient({
            region: this.#region,
            credentials: {
                accessKeyId: this.#accessKeyId,
                secretAccessKey: this.#secretAccessKey,
            },
        });

        return AnalyticsController.sqsClientConnection;
    }

    async sendMessage(messageBody) {
        try {
            const params = {
                QueueUrl: this.#queueUrl,
                MessageBody: JSON.stringify(messageBody),
            };

            const command = new SendMessageCommand(params);
            const response = await this.sqsClient.send(command);

            return "Message sent successfully:"+response.MessageId;
        } catch (error) {           
            throw new Error(error);
        }
    }

    #getIpAddress(req){
        const forwardedIp = req.headers['x-forwarded-for'];
        return forwardedIp ? forwardedIp.split(',')[0].trim() : req.socket.remoteAddress?.replace(/^::ffff:/, '');
    }
}

module.exports = AnalyticsController;