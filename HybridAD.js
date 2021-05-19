const utils = require("./anomaly_detection_util");
const corrFeatures = require("./corrFeatures");
const line = require("./line");
const point = require("./point");
const parser = require("./parser");
const report = require("./AnomalyReport");
const math = require("mathjs");
const enclosingCircle = require('smallest-enclosing-circle')

class HybridAD {

    // receive data as JSON
    LearnNormal(obj) {
        this.parser = new parser(obj);
        this.corr_features = [];
        let titles = this.parser.colNames;
        this.anomalies = new Map();

        for (let i = 0; i < titles.length - 1; i++) {
            let f1 = titles[i];
            let max_corr_value = 0;
            let most_corr_col = 0;

            for (let j = (i + 1); j < titles.length; j++) {
                let p = math.abs(utils.pearson(this.parser.cols.get(f1), this.parser.cols.get(titles[j])));

                if (p > max_corr_value) {
                    max_corr_value = p;
                    most_corr_col = j;
                }
            }

            let f2 = titles[most_corr_col];
            let x = this.parser.cols.get(f1);
            let y = this.parser.cols.get(f2);

            let points = [];
            for (let k = 0; k < x.length; k++) {
                points.push(new point(parseFloat(x[k]), parseFloat(y[k])));
            }

            let line = utils.linear_reg(points);
            let current_threshold = this.calc_threshold(points, line);

            if (max_corr_value > 0.9) {
                let c = new corrFeatures(f1, f2, line, null, max_corr_value, current_threshold);
                this.corr_features.push(c);
            } else if (max_corr_value > 0.5) {
                let cl = enclosingCircle(points);
                current_threshold = cl.r * 1.1;
                let c = new corrFeatures(f1, f2, null, cl, max_corr_value, current_threshold);
                this.corr_features.push(c);
            }
        }
        return true;
    }

    calc_threshold(points, line) {
        let max = 0;

        // find the biggest threshold between any point and the given line.
        points.forEach((point) => {
            max = math.max(max, utils.dev_line(point, line));
        });

        return math.multiply(max, 1.1);
    }

    Detect(obj) {
        this.parser = new parser(obj);
        this.anomaly_report = [];
        this.corr_features.forEach((cf) => {
            let description = cf.f1 + "-" + cf.f2;
            this.anomaly_report.push(new report(description,-1));
            // gets data for given anomaly data
            let x = this.parser.cols.get(cf.f1);
            let y = this.parser.cols.get(cf.f2);

            let points = [];
            for (let i = 0; i < x.length; i++) {
                points.push(new point(x[i], y[i]));
            }

            let i = 0;
            points.forEach((point) => {
                if (this.is_anomaly(point, cf)) {
                    let desc = cf.f1 + "-" + cf.f2;
                    this.anomaly_report.push(new report(desc, (i+1)));
                    // cf.dataPoints.push(new point(point.X, point.Y));
                    // cf.linesteps.push(i);
                }
                i++;
            });
            let v = 0;
        });

        return true;
    }

    Display() {
        return this.anomaly_report;
    }

    DisplaySpan() {
        let span = "";
        let dis = "";
        let tm1 = 0;
        let tm2 = 0;
        let j = 1;

        if (this.anomaly_report.length===0) {
            return "noSpan";
        }

        for (let i=0; i < this.anomaly_report.length; i++) {
            dis = this.anomaly_report[i].description;
            tm1 = parseInt(this.anomaly_report[i].timestep);
            tm2 = tm1 + 1;
            let lastAno = true;

            while (lastAno && j < this.anomaly_report.length) {
                if (dis === this.anomaly_report[j].description && tm2 === parseInt(this.anomaly_report[j].timestep)) {
                    i = j;
                    tm2 = parseInt(this.anomaly_report[j].timestep) + 1;
                } else {
                    lastAno = false;
                }
                j++;
            }

            span += tm1.toString() + " " + tm2.toString() + " " + dis + "\n";
        }
        return span;
    }

    is_anomaly(point, cf) {
        if (cf.lin_reg != null) {
            let dev = utils.dev_line(point, cf.lin_reg);
            return (dev > cf.threshold);
        } else {
            return (utils.dist(cf.cirle.x, cf.cirle.y, point) > cf.threshold);
        }

    }

}

module.exports = HybridAD;