import osmnx as ox

print("Loading road network...")

G = ox.load_graphml("varanasi_drive.graphml")

print("Graph loaded!")
print("Nodes:", len(G.nodes))
print("Edges:", len(G.edges))


# --------------------------------
# STEP 1: Create OSM ID → C++ ID
# --------------------------------

node_mapping = {}

for new_id, old_id in enumerate(G.nodes):
    node_mapping[old_id] = new_id


# --------------------------------
# STEP 2: Create graph.txt
# --------------------------------

with open("graph.txt", "w") as f:

    n = len(G.nodes)

    # Count directed edges
    m = len(G.edges)

    f.write(f"{n} {m}\n")

    for u, v, data in G.edges(data=True):

        new_u = node_mapping[u]
        new_v = node_mapping[v]

        # Road length in meters
        length = data.get("length", 1)

        f.write(f"{new_u} {new_v} {length}\n")


# --------------------------------
# STEP 3: Create coordinates.txt
# --------------------------------

with open("coordinates.txt", "w") as f:

    for old_id, new_id in node_mapping.items():

        node_data = G.nodes[old_id]

        lat = node_data["y"]
        lon = node_data["x"]

        f.write(f"{new_id} {lat} {lon}\n")


print("Conversion complete!")

print("Created:")
print("  graph.txt")
print("  coordinates.txt")