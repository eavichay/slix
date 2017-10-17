'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
        if (_typeof(initialState[key]) === 'object') {
            var self = _this;
            _this.__storage[key] = new Slix(initialState[key]);
            _this.__storage[key].subscribe(function (changes, storage) {
                for (var _key in changes) {
                    if (changes[_key]) {
                        self.__collect(key + '.' + _key);
                    }
                }
            });
        } else {
            _this.__storage[key] = initialState[key];
        }
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

Slix.bind = function (slixModel, watchExpr) {
    var $ = Symbol.for(Slix);
    return function (target, key, descriptor) {
        descriptor.watchExpr = watchExpr;
        descriptor.key = key;
        target[$] = target[$] ? target[$].concat(descriptor) : [descriptor];
        var cFn = target.onBeforeCreated || target.connectedCallback;
        var dFn = target.onRemoved || target.disconnectedCallback;
        Object.defineProperty(target, cFn.name, {
            writable: true,
            value: function value() {
                var _this2 = this;

                this[$].forEach(function (d) {
                    d.unsubscriber = slixModel.subscribe(function (chg) {
                        if (chg[d.watchExpr]) {
                            console.log(d.watchExpr);
                            _this2[d.key]();
                        }
                    });
                    cFn.apply(_this2);
                });
            }
        });

        Object.defineProperty(target, dFn.name, {
            writable: true,
            value: function value() {
                this[$].forEach(function (d) {
                    d.unsubscriber();
                });
                dFn.apply(this);
            }
        });

        return descriptor;
    };
};

// public methods
Slix.prototype.__collect = function (key) {
    var _this3 = this;

    this.__changes[key] = true;
    !this.__pending && setTimeout(function () {
        _this3.__dispatch();
    }, 0);
    this.__pending = true;
};

Slix.prototype.__dispatch = function () {
    var _this4 = this;

    this.__subscribers.forEach(function (subscriber) {
        subscriber(_this4.__changes, _this4.__storage);
    });
    this.__changes = {};
    this.__pending = false;
};

Slix.prototype.destroy = function () {
    this.__subscribers = [];
};

Slix.prototype.subscribe = function (subscriber) {
    var _this5 = this;

    var unSubscribe = function unSubscribe() {
        _this5.__subscribers = _this5.__subscribers.filter(function (existing) {
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

