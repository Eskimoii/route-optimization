const graph = {
  n: 5,

  edges: [
    [0, 1, 4],
    [0, 2, 2],
    [1, 2, 1],
    [1, 3, 5],
    [2, 3, 8],
    [3, 4, 3]
  ],

  nodes: {
  0: { name: "Location 0", lat: 25.3176, lng: 82.9739 },
  1: { name: "Location 1", lat: 25.3276, lng: 82.9839 },
  2: { name: "Location 2", lat: 25.3076, lng: 82.9939 },
  3: { name: "Location 3", lat: 25.2976, lng: 82.9739 },
  4: { name: "Location 4", lat: 25.3176, lng: 83.0039 }
}
};

export default graph;