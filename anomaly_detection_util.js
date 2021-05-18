const math = require("mathjs");
const line = require("./line");
const point = require("./point");

class anomaly_detection_util {
    static avg(x) {
        let sum = math.sum(x);
        return (sum / x.length);
    }

    // returns the variance of X and Y
    static var(x) {
        let sum = 0;
        math.forEach(x, function (value) {
            sum+= math.square(value);
        });
        return (sum / x.length) - math.square(anomaly_detection_util.avg(x));
    }

    // returns the covariance of X and Y
    static cov(x, y) {
        let sum = 0;
        for(let i=0; i<x.length; i++) {
            sum+= math.multiply(x[i], y[i]);
        }
        sum /= x.length;
        return sum - math.multiply(anomaly_detection_util.avg(x), anomaly_detection_util.avg(y));
    }

    // returns the Pearson correlation coefficient of X and Y
    static pearson(x, y) {
        return anomaly_detection_util.cov(x, y) / math.multiply(math.sqrt(anomaly_detection_util.var(x)), math.sqrt(anomaly_detection_util.var(y)));
    }

    // performs a linear regression and returns the line equation
    static linear_reg(points) {
        let x = [];
        let y = [];
        let i = 0;
        points.forEach((point) => {
            x[i] = point.x;
            y[i] = point.y;
            i++;
        });

        let a = anomaly_detection_util.cov(x,y) / anomaly_detection_util.var(x);
        let b = anomaly_detection_util.avg(y) - math.multiply(a, anomaly_detection_util.avg(x));

        return new line(a, b);
    }

    // returns the deviation between point p and the line equation of the points
    static dev_points(p, points) {
        let l = anomaly_detection_util.linear_reg(points);
        return anomaly_detection_util.dev_line(p, l);
    }

    // returns the deviation between point p and the line
    static dev_line(p, l) {
        return math.abs(p.y - l.f(p.x));
    }

    static dist(x , y, p2) {
        return math.sqrt(math.pow(y - p2.y , 2) + math.pow(x - p2.x , 2));
    }
}

module.exports = anomaly_detection_util;