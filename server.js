require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());


// ============================================================
// 1. LOAD ROAD NETWORK COORDINATES
// ============================================================

const coordinates = [];

const coordinateFile = fs.readFileSync(
    "road_network/coordinates.txt",
    "utf8"
);

const lines = coordinateFile.trim().split("\n");

for (const line of lines) {

    const parts = line.trim().split(/\s+/);

    if (parts.length !== 3) continue;

    coordinates.push({
        id: Number(parts[0]),
        lat: Number(parts[1]),
        lng: Number(parts[2])
    });
}

console.log("Loaded road nodes:", coordinates.length);


// ============================================================
// 2. FIND NEAREST ROAD NODE
// ============================================================

function findNearestNode(lat, lng) {

    let nearestNode = null;
    let minDistance = Infinity;

    for (const node of coordinates) {

        const distance =
            (lat - node.lat) ** 2 +
            (lng - node.lng) ** 2;

        if (distance < minDistance) {
            minDistance = distance;
            nearestNode = node;
        }
    }

    return nearestNode;
}

function getPathCoordinates(path) {

    return path.map(nodeId => {

        const node = coordinates.find(
            node => node.id === nodeId
        );

        if (!node) {
            throw new Error(`Node ${nodeId} not found in coordinates`);
        }

        return [node.lat, node.lng];
    });
}


// ============================================================
// 3. GEOCODE A LOCATION
// ============================================================

async function geocodeLocation(location) {

    const url =
        `https://api.openrouteservice.org/geocode/search` +
        `?text=${encodeURIComponent(location)}` +
        `&size=1`;

    const response = await fetch(url, {
        headers: {
            Authorization: process.env.ORS_API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
        throw new Error(`Location not found: ${location}`);
    }

    const coordinates =
        data.features[0].geometry.coordinates;

    return {
        lng: coordinates[0],
        lat: coordinates[1]
    };
}


// ============================================================
// 4. RUN C++ DIJKSTRA
// ============================================================

function runShortestPath(src, dest) {

    return new Promise((resolve, reject) => {

        const input = `${src} ${dest}\n`;

        const child = spawn("./algorithm.exe");

        let stdout = "";
        let stderr = "";

        // Get C++ normal output
        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        // Get C++ error output
        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        // When C++ finishes
        child.on("close", (code) => {

            if (code !== 0) {

                reject(
                    new Error(
                        stderr || "C++ algorithm failed"
                    )
                );

                return;
            }

            const outputLines = stdout.trim().split("\n");

            // No path
            if (
                outputLines.length === 0 ||
                outputLines[0].includes("No path")
            ) {

                resolve({
                    found: false,
                    distance: -1,
                    path: []
                });

                return;
            }

            // Example:
            // shortest distance: 25.4
            // shortest path: 123 456 789

            const distance =
                parseFloat(
                    outputLines[0]
                        .split(":")[1]
                        .trim()
                );

            const path =
                outputLines[1]
                    .split(":")[1]
                    .trim()
                    .split(/\s+/)
                    .map(Number);

            resolve({
                found: true,
                distance: distance,
                path: path
            });
        });

        // Send source and destination node IDs to C++
        child.stdin.write(input);
        child.stdin.end();
    });
}


// ============================================================
// 5. LOCATION SUGGESTIONS
// ============================================================

app.get("/geocode", async (req, res) => {

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            error: "Query is required"
        });
    }

    try {

        const response = await fetch(
            `https://api.heigit.org/pelias/v1/search?text=${encodeURIComponent(query)}&size=5`,
            {
                headers: {
                    Authorization: process.env.ORS_API_KEY
                }
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            return res.status(response.status).json({
                error: "Geocoding service failed",
                details: errorText
            });
        }

        const data = await response.json();

        const results = data.features.map(
            (feature) => ({
                name: feature.properties.label,
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0]
            })
        );

        res.json(results);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to geocode location"
        });
    }
});

// ============================================================
// 8. COMPLETE ROUTE ENDPOINT
// ============================================================

app.post("/route", async (req, res) => {

    const { source, destination } = req.body;

    if (!source || !destination) {

        return res.status(400).json({
            error: "Source and destination are required"
        });
    }

    try {

        // ----------------------------------------------------
        // STEP 1: Location names → coordinates
        // ----------------------------------------------------

        const sourceCoordinates =
            await geocodeLocation(source);

        const destinationCoordinates =
            await geocodeLocation(destination);

        console.log(
            "Source coordinates:",
            sourceCoordinates
        );

        console.log(
            "Destination coordinates:",
            destinationCoordinates
        );


        // ----------------------------------------------------
        // STEP 2: Coordinates → nearest road nodes
        // ----------------------------------------------------

        const sourceNode =
            findNearestNode(
                sourceCoordinates.lat,
                sourceCoordinates.lng
            );

        const destinationNode =
            findNearestNode(
                destinationCoordinates.lat,
                destinationCoordinates.lng
            );

        if (!sourceNode || !destinationNode) {

            return res.status(404).json({
                error: "Could not find nearest road node"
            });
        }

        console.log(
            "Source node:",
            sourceNode
        );

        console.log(
            "Destination node:",
            destinationNode
        );


        // ----------------------------------------------------
        // STEP 3: Road nodes → C++ Dijkstra
        // ----------------------------------------------------

        const result =
            await runShortestPath(
                sourceNode.id,
                destinationNode.id
            );

        console.log(
            "C++ result:",
            result
        );


        // ----------------------------------------------------
        // STEP 4: Send complete result to React
        // ----------------------------------------------------

     const pathCoordinates = result.found
        ? getPathCoordinates(result.path)
        : [];

        res.json({
            source: sourceCoordinates,
            destination: destinationCoordinates,
            sourceNode: sourceNode,
            destinationNode: destinationNode,
            found: result.found,
            distance: result.distance,
            path: pathCoordinates
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});


// ============================================================
// 9. START SERVER
// ============================================================

app.listen(8080, () => {

    console.log(
        "Server running on http://localhost:8080"
    );

});