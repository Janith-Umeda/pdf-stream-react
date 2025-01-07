const php = require('php-serialization');
const { v4: uuidv4 } = require('uuid');

class AnalyticsService {

    static createJobPayload(jobClass, jobData) {

        const preparedJobClass = this.#prepareJobClass(jobClass);

        return {
            uuid: uuidv4(),
            displayName: preparedJobClass,
            job: "Illuminate\\Queue\\CallQueuedHandler@call",
            maxTries: 2,
            maxExceptions: null,
            failOnTimeout: false,
            backoff: null,
            timeout: null,
            retryUntil: null,
            data: {
                commandName: preparedJobClass,
                command: this.#generateCommand(jobClass,jobData),
            },
        };
        
    };

    static #generateCommand(jobClass,jobData){
        try{
            const command = this.#createClass(jobClass,{
                'private|requestData': this.#createClass(null,jobData), 
                'tries': 5,
                'backoff': 60,
            })
            
            return php.serialize(command, 'object');
        }catch(e){
            console.warn(e);
        }
    }

    static #createClass(className,attributes){
        const phpClass = className ? new php.Class(this.#prepareJobClass(className)) : new php.Class();
        
        if(attributes){

            Object.entries(attributes).forEach(([key, value]) => {

                const {attributeKey,attributeScope} = this.#getProperties(key);
                const valueType = this.#getValueType(value);

                phpClass.__addAttr__(
                    attributeKey,
                    'string',
                    value,
                    valueType,
                    attributeScope
                );
            });
        }

        return phpClass;
    }

    static #prepareJobClass(jobClass){
        return `App\\Jobs\\${jobClass}`;
    }

    static #getProperties(key){
        const splittedKey = key.split('|');
        const isScoped = splittedKey.length > 1;

        return {
            attributeKey: isScoped ? splittedKey[1] : key,
            attributeScope: isScoped ? splittedKey[0] : 'public'
        }
    }

    static #getValueType(value){
        let valueType = typeof value;

        valueType = valueType === 'number' ? 'integer' : valueType;

        if(value instanceof php.Class){
            valueType = value.__name__ === undefined ? 'array' : 'object';
        }

        return valueType;
    }
}


module.exports = AnalyticsService;