function KeyStroker() {
    this.strokes = {};
    this.keysDown = {};
    this.keysUp = {};
    this.dictionary = null;
}

KeyStroker.prototype.buildDictionary = function () {
    this.dictionary = {};
    var _this = this;
    _.keys(this.strokes).map(function (key) {
        var compilation = [];
        var quantifier, str;
        var combinations = key.split(/\s/);
        for (var i = 0; i < combinations.length; i++) {
            str = jQuery.trim(combinations[i]);
            if (!str) continue;
            quantifier = str[0];
            str = str.substr(1);
            str || (str = "");
            if (['+', '-', '!'].indexOf(quantifier) > -1) {
                compilation.push([quantifier, str]);
            }
        }
        _this.dictionary[key] = compilation;
    });
};

KeyStroker.prototype.add = function (stroke, fun) {
    this.strokes[stroke] = fun;
};

KeyStroker.prototype.matchFromDictionary = function (keysDownList, keysUpList) {
    if (!this.dictionary) {
        this.buildDictionary();
    }
    var matchedKeys = _.map(this.dictionary, function (combinationList, key) {
        return _.every(combinationList, function (quantifierChar) {
            if (quantifierChar[0] === '+') {
                return keysDownList.indexOf(quantifierChar[1]) > -1;
            } else if (quantifierChar[0] === '-') {
                return keysUpList.indexOf(quantifierChar[1]) > -1;
            } else if (quantifierChar[0] === '!') {
                return keysDownList.indexOf(quantifierChar[1]) < 0;
            } else {
                return false;
            }
        }) && key;
    });
    matchedKeys = _.without(matchedKeys, false);
    //if (_.size(matchedKeys)) console.log(matchedKeys);
    return _.values(_.pick(this.strokes, matchedKeys));
};

KeyStroker.prototype.step = function () {
    var matches = this.matchFromDictionary(_.uniq(_.without(_.values(this.keysDown), undefined)), _.uniq(_.without(_.values(this.keysUp), undefined)));
    matches.length && matches.map(function (f) {
        f.call();
    });
    this.keysDown = _.omit(this.keysDown, _.keys(this.keysUp));
    this.keysUp = {};
};

KeyStroker.prototype.run = function (interval) {
    var _this = this;
    setInterval(function(){
        _this.step();
    }, interval || 100);
    this.listenToKeyboardEvents();
};

KeyStroker.prototype.listenToKeyboardEvents = function () {
    var _this = this;
    var specialKeys = {
        32: "space",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        17: "ctrl",
        16: "shift",
        18: "alt",
        9: "tab",
        46: "del",
        13: "enter",
        8: "backspace",
        20: "caps",
        27: "esc"
    };
    var keyRelations = _.clone(specialKeys);
    var keyDownKeyCode = null;
    $(window).on('keypress', function (evt) {
        if (keyDownKeyCode !== null) {
            keyRelations[keyDownKeyCode] = String.fromCharCode(evt.keyCode).toLowerCase();
            _this.keysDown[keyDownKeyCode] = keyRelations[keyDownKeyCode];
            keyDownKeyCode = null;
        }
    });
    $(window).on('keydown', function (evt) {
        keyDownKeyCode = specialKeys[evt.keyCode] ? null : evt.keyCode;
        _this.keysDown[evt.keyCode] = specialKeys[evt.keyCode];
    });
    $(window).on('keyup', function (evt) {
        if (keyRelations[evt.keyCode]) {
            _this.keysUp[evt.keyCode] = keyRelations[evt.keyCode];
            keyDownKeyCode = specialKeys[evt.keyCode] ? null : evt.keyCode;
            if (keyDownKeyCode){
                delete _this.keysDown[keyDownKeyCode];
            }
            delete _this.keysDown[evt.keyCode];
            keyDownKeyCode = null;
        }
    });
};
