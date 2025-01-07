class Router {

    static #express;

    static use(express){
        this.#express = express;
    }

    /**
     * 
     * @param {string} router 
     * @param {[controller:class,method:string]|Function} action 
     */
    static get(router,action){
        this.#express.get(router,(...args)=>this.#actionCaller(args,action));
    }

    /**
     * 
     * @param {string} router 
     * @param {[controller:class,method:string]|Function} action 
     */
    static post(router,action){
        this.#express.post(router,(...args)=>this.#actionCaller(args,action));
    }

    static #actionCaller(args,action){
        if(typeof action === 'function'){
            action(...args);
        }else{
            const controller = new action[0]();
            controller[action[1]](...args)
        }
    }
}

module.exports = Router;

