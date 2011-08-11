function run(module) {
    console.log(module);
    var testSet = require(module).testSet;
    var testIndex = 0;
    for (var testName in testSet) {
        var test = testSet[testName];
        var info = [];
        info[0] = testName;
        var offset = new Date().getTime();
        try {
            test();
            info[2] = 'OK';
        }
        catch (err) {
            info[2] = err;
        }
        info[1] = (new Date().getTime() - offset) + 'ms';
        console.log((testIndex + 1) + ') ' + info.join(' - '));
        testIndex++;
    }
}
run('./test/compile');
run('./test/render');