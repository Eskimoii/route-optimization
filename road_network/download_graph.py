import osmnx as ox

print("Downloading road network...")

G = ox.graph.graph_from_place(
    "Varanasi, Uttar Pradesh, India",
    network_type="drive",
    simplify=True
)

print("Graph downloaded!")

print("Number of nodes:", len(G.nodes))
print("Number of edges:", len(G.edges))

ox.io.save_graphml(G, "varanasi_drive.graphml")

print("Graph saved as varanasi_drive.graphml")