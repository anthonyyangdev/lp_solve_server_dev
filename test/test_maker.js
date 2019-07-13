module.exports = /** @class */ (function () {
    function RegexTests(test_cases, regex) {
        this.test_cases = test_cases;
        this.regex = regex;
    }
    RegexTests.prototype.test = function (e) {
        return this.regex.test(e);
    };
    RegexTests.prototype.runTest = function () {
        var _this = this;
        this.test_cases.forEach(function (e) {
            var res = _this.test(e);
            if (!res) {
                throw new Error("Test failed for case " + e + ".");
            }
        });
        console.log('Passed all test cases.');
    };
    RegexTests.prototype.mustFail = function (e) {
        if (this.regex.test(e)) {
            throw new Error(`${e} was expected to fail, but it passed.`)
        }
        console.log(`${e} failed successfully.`)
    }
    return RegexTests;
}());
