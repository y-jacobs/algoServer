
class line {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    f(x) {
        return this.a*x + this.b;
    }
}

module.exports = line;
