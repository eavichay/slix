
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
        if (typeof initialState[key] === 'object') {
            let self = this;
            this.__storage[key] = new Slix(initialState[key])
            this.__storage[key].subscribe( function (changes, storage) {
                for (let _key in changes) {
                    if (changes[_key]) {
                        self.__collect(key + '.' + _key)
                    }
                }
            })
        } else {
            this.__storage[key] = initialState[key];
        }
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

Slix.bind = (slixModel, watchExpr) => {
    return (target, key, descriptor) => {
        const cFn = target.onBeforeCreated || target.connectedCallback;
        const dFn = target.onRemoved || target.disconnectedCallback;
        let unsubscriber;
        target[cFn.name] = function () {
            unsubscriber = slixModel.subscribe( chg => {
                if (chg[watchExpr]) {
                    this[key]();
                }
            })
            cFn.apply(this);
        }
        target[dFn.name] = function() {
            unsubscriber();
            dFn.apply(this);
        }
        return descriptor;
    }
}


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