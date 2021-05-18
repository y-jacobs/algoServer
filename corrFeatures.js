
class corrFeatures {
    constructor(feature1, feature2, line, circle, corr, threshold) {
        this.f1 = feature1;
        this.f2 = feature2;
        this.lin_reg = line;
        this.correlation = corr;
        this.threshold = threshold;
        this.cirle = circle;
        this.dataPoints = [];
        this.linesteps = [];
    }
}

module.exports = corrFeatures;