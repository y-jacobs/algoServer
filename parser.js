const math = require("mathjs");
const fs = require('fs');
const csv = require('csv-string');

class parser {
    constructor(obj) {
        this.data = csv.parse(obj.slice(0, -5));
        let d_index = obj.indexOf('\n'); // Find the new \n
        this.title = obj.substring(0, d_index); // Cuts off the processed chunk
        this.colNames = this.data[0];
        this.cols_size = this.colNames.length; // get the number of keys in obj
        this.rows_count(); // set this.size to be the max number of rows there is in obj
        this.cols = new Map();
        this.set_cols_map(); // create a map (in this.cols): column name as key, and data as info
    }

    set_cols_map() {
        let j = 0;
        this.colNames.forEach((key) => {
            let column = [];
            for(let i=1; i<this.data.length; i++){
                column.push(this.data[i][j]);
            }
            // extract array data of column "key"
            this.cols.set(key, column);
            j++;
        });
    }

    rows_count() {
        this.size = this.data.length;
        // this.colNames.forEach((key) => {
        //     // finds the longest number of rows
        //     this.size = math.max(this.size, math.max(this.data[key]));
        // });
    }

}

module.exports = parser;