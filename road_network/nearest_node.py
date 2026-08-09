import math

def find_nearest_node(lat, lon):

    nearest_node = -1
    min_distance = float("inf")

    with open("coordinates.txt", "r") as file:

        for line in file:

            parts = line.strip().split()

            if len(parts) != 3:
                continue

            node_id = int(parts[0])
            node_lat = float(parts[1])
            node_lon = float(parts[2])

            # Approximate distance for finding the nearest node
            distance = math.sqrt(
                (lat - node_lat) ** 2 +
                (lon - node_lon) ** 2
            )

            if distance < min_distance:
                min_distance = distance
                nearest_node = node_id

    return nearest_node


# Test
lat = 25.259335
lon = 82.993434

node = find_nearest_node(lat, lon)

print("Nearest node:", node)