'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Slix = function () {
    function Slix(initialState) {
        var _this = this;

        _classCallCheck(this, Slix);

        this.__storage = {};
        this.__changes = {};
        this.__subscribers = [];
        Object.keys(initialState).forEach(function (key) {
            _this.__defineSetter__(key, function (x) {
                this.__storage[key] = x;
                this.__collect(key);
            });
            _this.__storage[key] = initialState[key];
        });
    }

    _createClass(Slix, [{
        key: '__collect',
        value: function __collect(key) {
            var _this2 = this;

            this.__changes[key] = true;
            !this.__pending && setTimeout(function () {
                _this2.__dispatch();
            }, 0);
            this.__pending = true;
        }
    }, {
        key: '__dispatch',
        value: function __dispatch() {
            var _this3 = this;

            this.__subscribers.forEach(function (subscriber) {
                subscriber(_this3.__changes, _this3.__storage);
            });
            this.__changes = {};
            this.__pending = false;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.__subscribers = [];
        }
    }, {
        key: 'subscribe',
        value: function subscribe(subscriber) {
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
        }
    }]);

    return Slix;
}();

if (typeof module !== 'undefined') {
    module.exports = Slix;
} else {
    if (window) {
        window.Slix = Slix;
    }
}
