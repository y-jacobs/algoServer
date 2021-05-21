const net = require("net");
const regression = require("./LinearRegression");
const hybrid = require("./HybridAD")
const port = 5000;
const hostname = '127.0.0.1';

let server = new net.createServer();
server.listen(port, hostname,function() {
    console.log("Server listening for connection requests on socket localhost: " + port);
});

server.on('connection', function(socket) {
    console.log('A new connection has been established.');
    let algo;
    let train = false;
    let anomaly = false;

    // let chunk = "";
    let d = "";
    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function(data) {

        let chunk = data.toString();
        let d_index = chunk.indexOf('\n'); // Find the delimiter
        let str;
        str = chunk.substring(0, d_index); // Create string up until the delimiter

        // While loop to keep going until no delimiter can be found
        while (d_index > -1) {
            /////////////////////////////////////////////////////
            if (train) { // train

                d += chunk;
                let d_index2 = chunk.indexOf('done');
                if (d_index2 > -1) {
                    socket.write((algo.LearnNormal(d)).toString());
                    d_index = d.length;
                    d = "";
                    train = false;
                    anomaly = true;
                } else {
                    d_index = chunk.length;
                }

            }
            else if (anomaly) { // anomaly detect
                d += chunk;
                let d_index2 = chunk.indexOf('done');
                if (d_index2 > -1) {
                    socket.write((algo.Detect(d)).toString());
                    d_index = chunk.length;
                    d = "";
                    anomaly = false;
                } else {
                    d_index = chunk.length;
                }
            }
            else {
                switch (str) {
                    case "1":
                        algo = new hybrid();
                        train = true;
                        break;
                    case "2":
                        algo = new regression();
                        train = true;
                        break;
                    case "3":
                        algo.Display().forEach(a =>
                            socket.write(a.description.toString() + " " + a.timestep.toString() + "\n"));
                        break;
                    case "4":
                        socket.write(algo.DisplaySpan());
                        break;
                    case "8":
                        socket.end();
                        break;
                    case algo.parser.title:
                        // another detect if not happy with first one.
                        d="";
                        d += str + '\n';
                        anomaly = true;

                }
            }


            /////////////////////////////////////////////
            chunk = chunk.substring(d_index + 1); // Cuts off the processed chunk
            d_index = chunk.indexOf('\n'); // Find the new \n
        }



    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });

});


