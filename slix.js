'use strict';

// constructor
function Slix(initialState) {
    var _this = this;

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

    Object.keys(initialState).forEach(function (key) {
        _this.__storage[key] = initialState[key];
        _this.__defineSetter__(key, function (x) {
            this.__storage[key] = x;
            this.__collect(key);
        });
        _this.__defineGetter__(key, function () {
            return this.__storage[key];
        });
    });
}

// static
Slix.__repository = {};
Slix.model = function (namespace, initialState) {
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
Slix.prototype.__collect = function (key) {
    var _this2 = this;

    this.__changes[key] = true;
    !this.__pending && setTimeout(function () {
        _this2.__dispatch();
    }, 0);
    this.__pending = true;
};

Slix.prototype.__dispatch = function () {
    var _this3 = this;

    this.__subscribers.forEach(function (subscriber) {
        subscriber(_this3.__changes, _this3.__storage);
    });
    this.__changes = {};
    this.__pending = false;
};

Slix.prototype.destroy = function () {
    this.__subscribers = [];
};

Slix.prototype.subscribe = function (subscriber) {
    var _this4 = this;

    var unSubscribe = function unSubscribe() {
        _this4.__subscribers = _this4.__subscribers.filter(function (existing) {
            return existing !== subscriber;
        });
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

