
// constructor
function Slix(initialState) {

    Object.defineProperty(this, '__changes', {
        enumerable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this, '__subscribers', {
        enumerable: false,
        writable: true,
        value: []
    });

    Object.defineProperty(this, '__storage', {
        enumerable: false,
        writable: true,
        value: {}
    });

    Object.defineProperty(this, '__pending', {
        enumerable: false,
        writable: true,
        value: false
    });

    Object.keys(initialState).forEach( key => {
        this.__storage[key] = initialState[key];
        this.__defineSetter__(key, function(x) {
            this.__storage[key] = x;
            this.__collect(key);
        });
        this.__defineGetter__(key, function() {
            return this.__storage[key];
        });
    });
}

// static
Slix.__repository = {};
Slix.model = function(namespace, initialState) {
    if (initialState) {
        if (Slix.__repository[namespace]) {
            throw "Cannot create model with namespace " + namespace + ": Model in that namespace already exists";
        }
        Slix.__repository[namespace] = new Slix(initialState);
    }

    // return the model within the namespace
    return Slix.__repository[namespace];
};


// public methods
Slix.prototype.__collect = function(key) {
    this.__changes[key] = true;
    !this.__pending && setTimeout( () => {
        this.__dispatch();
    }, 0);
    this.__pending = true;
};

Slix.prototype.__dispatch = function() {
    this.__subscribers.forEach( subscriber => {
        subscriber(this.__changes, this.__storage);
    });
    this.__changes = {};
    this.__pending = false;
};

Slix.prototype.destroy = function() {
    this.__subscribers = [];
};

Slix.prototype.subscribe = function(subscriber) {
    const unSubscribe = () => {
        this.__subscribers = this.__subscribers.filter( (existing) => {
            return existing !== subscriber;
        })
    };
    if (this.__subscribers.indexOf(subscriber) < 0) {
        this.__subscribers.push(subscriber);
    }
    return unSubscribe;
};

// export
if (typeof module !== 'undefined') {
    module.exports = Slix;
} else {
    if (window) {
        window.Slix = Slix;
    }
}