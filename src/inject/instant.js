window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
};

const _parse = JSON.parse;
JSON.parse = function () {
    const resp = _parse.apply(this, arguments);

    try {
        
        for (const evt in window.Quizlet.assistantModeData.metering.meteringData) {
            window.Quizlet.assistantModeData.metering.meteringData[evt].numEvents = 0;
        }

    } catch(e) {}

    return resp;
}