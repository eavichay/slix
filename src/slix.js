class Slix {

    static model(namespace, initialState) {
        Slix.__repository = Slix.__repository || {};

        // create a model
        if (initialState) {
            if (Slix.__repository[namespace]) {
                throw "Cannot create model with namespace " + namespace + ": Model in that namespace already exists";
            }
            Slix.__repository[namespace] = new Slix(initialState);
        }

        // return the model within the namespace
        return Slix.__repository[namespace];
    }

    constructor(initialState) {
        this.__storage = {};
        this.__changes = {};
        this.__subscribers = [];
        Object.keys(initialState).forEach( key => {
            this.__defineSetter__(key, function(x) {
                this.__storage[key] = x;
                this.__collect(key);
            });
            this.__storage[key] = initialState[key];
        });
    }

    __collect(key) {
        this.__changes[key] = true;
        !this.__pending && setTimeout( () => {
            this.__dispatch();
        }, 0);
        this.__pending = true;
    }

    __dispatch() {
        this.__subscribers.forEach( subscriber => {
            subscriber(this.__changes, this.__storage);
        });
        this.__changes = {};
        this.__pending = false;
    }

    destroy() {
        this.__subscribers = [];
    }

    subscribe(subscriber) {
        const unSubscribe = () => {
            this.__subscribers = this.__subscribers.filter( (existing) => {
                return existing !== subscriber;
            })
        };
        if (this.__subscribers.indexOf(subscriber) < 0) {
            this.__subscribers.push(subscriber);
        }
        return unSubscribe;
    }
}


if (typeof module !== 'undefined') {
    module.exports = Slix;
} else {
    if (window) {
        window.Slix = Slix;
    }
}